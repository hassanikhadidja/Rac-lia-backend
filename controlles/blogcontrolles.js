const Blog = require("../models/blog");
const cloudinary = require("../config/cloudinary");
const { toFrontendBlog } = require("../utils/mappers");

function slugify(text) {
  return (
    String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "article"
  );
}

function parseJsonField(raw, fallback) {
  if (raw == null || raw === "") return fallback;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

const uploadOne = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: cloudinary.UPLOAD_FOLDER }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });

async function findBlogByIdOrKey(idOrKey) {
  if (!idOrKey) return null;
  const key = String(idOrKey);
  const byKey = await Blog.findOne({ $or: [{ blogKey: key }, { slug: key.toLowerCase() }] });
  if (byKey) return byKey;
  if (/^[a-f\d]{24}$/i.test(key)) return Blog.findById(key);
  return null;
}

function normalizeBlogPayload(body) {
  const payload = { ...body };
  if (payload.sections != null) payload.sections = parseJsonField(payload.sections, []);
  if (payload.linkedProductIds != null) {
    payload.linkedProductIds = parseJsonField(payload.linkedProductIds, payload.linkedProductIds);
    if (!Array.isArray(payload.linkedProductIds)) payload.linkedProductIds = [];
  }
  if (payload.cta != null) payload.cta = parseJsonField(payload.cta, { text: "", productIds: [] });

  if (payload.status === "published") {
    payload.isPublished = true;
    if (!payload.publishedAt) payload.publishedAt = new Date();
  } else if (payload.status === "draft") {
    payload.isPublished = false;
  }

  if (payload.isPublished !== undefined) {
    payload.isPublished = payload.isPublished === true || payload.isPublished === "true";
    if (payload.isPublished && !payload.publishedAt) payload.publishedAt = new Date();
    payload.status = payload.isPublished ? "published" : payload.status || "draft";
  }

  if (payload.id && !payload.blogKey) payload.blogKey = payload.id;
  delete payload.id;
  return payload;
}

exports.GetPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" }).sort({ publishedAt: -1, updatedAt: -1 });
    return res.json(blogs.map(toFrontendBlog));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.GetPublishedBlogBySlug = async (req, res) => {
  try {
    const key = String(req.params.slug || "").toLowerCase();
    const blog = await Blog.findOne({
      status: "published",
      $or: [{ slug: key }, { blogKey: req.params.slug }],
    });
    if (!blog) return res.status(404).json({ msg: "Not found" });
    return res.json(toFrontendBlog(blog));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.GetAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ updatedAt: -1 });
    return res.json(blogs.map(toFrontendBlog));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.AddBlog = async (req, res) => {
  try {
    const body = normalizeBlogPayload(req.body);
    const title = String(body.title || "").trim();
    if (!title) return res.status(400).json({ msg: "Title is required" });

    let slug = String(body.slug || "").trim().toLowerCase();
    if (!slug) slug = slugify(title);
    let finalSlug = slug;
    let n = 0;
    while (await Blog.findOne({ slug: finalSlug })) {
      n += 1;
      finalSlug = `${slug}-${n}`;
    }

    if (req.file?.buffer) {
      body.coverImage = await uploadOne(req.file.buffer);
    }

    const blog = await Blog.create({
      ...body,
      title,
      slug: finalSlug,
      blogKey: body.blogKey || `blog-${Date.now()}`,
    });
    return res.status(201).json({ msg: "ok", blog: toFrontendBlog(blog) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.UpdateBlog = async (req, res) => {
  try {
    const existing = await findBlogByIdOrKey(req.params.id);
    if (!existing) return res.status(404).json({ msg: "Not found" });

    const body = normalizeBlogPayload(req.body);
    const update = { ...body };

    if (body.slug != null && String(body.slug).trim()) {
      const slug = String(body.slug).trim().toLowerCase();
      const clash = await Blog.findOne({ slug, _id: { $ne: existing._id } });
      if (clash) return res.status(400).json({ msg: "Slug already in use" });
      update.slug = slug;
    }

    if (req.file?.buffer) {
      update.coverImage = await uploadOne(req.file.buffer);
    } else if (Object.prototype.hasOwnProperty.call(body, "keepCover")) {
      update.coverImage = String(body.keepCover || "").trim();
    }

    delete update.id;
    const blog = await Blog.findByIdAndUpdate(existing._id, update, { new: true });
    return res.json({ msg: "ok", blog: toFrontendBlog(blog) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.DeleteBlog = async (req, res) => {
  try {
    const existing = await findBlogByIdOrKey(req.params.id);
    if (!existing) return res.status(400).json({ msg: "Not found" });
    await Blog.deleteOne({ _id: existing._id });
    return res.json({ msg: "ok" });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};
