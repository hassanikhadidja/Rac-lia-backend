const StyleLook = require("../models/styleLook");
const cloudinary = require("../config/cloudinary");
const { toFrontendStyleLook, toStorefrontStyleLook } = require("../utils/mappers");

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

async function findLookByIdOrKey(idOrKey) {
  if (!idOrKey) return null;
  const key = String(idOrKey);
  const byKey = await StyleLook.findOne({ lookKey: key });
  if (byKey) return byKey;
  if (/^[a-f\d]{24}$/i.test(key)) return StyleLook.findById(key);
  return null;
}

function normalizeProducts(raw) {
  const products = parseJsonField(raw, []);
  if (!Array.isArray(products)) return [];
  return products
    .map((p, i) => ({
      entryKey: p.entryKey || p.id || `p-${i}`,
      productSlug: String(p.productSlug || p.productId || p.id || "").trim(),
      image: String(p.image || "").trim(),
    }))
    .filter((p) => p.productSlug);
}

exports.getStorefrontLooks = async (req, res) => {
  try {
    const looks = await StyleLook.find().sort({ order: 1, createdAt: 1 });
    return res.json(looks.map(toStorefrontStyleLook).filter(Boolean));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.getAllLooks = async (req, res) => {
  try {
    const looks = await StyleLook.find().sort({ order: 1, createdAt: 1 });
    return res.json(looks.map(toFrontendStyleLook));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.addLook = async (req, res) => {
  try {
    const { title, tag, products, order } = req.body;
    let image = String(req.body.image || "").trim();
    if (req.file?.buffer) image = await uploadOne(req.file.buffer);
    if (!image) return res.status(400).json({ msg: "Look image is required" });

    const look = await StyleLook.create({
      lookKey: req.body.lookKey || req.body.id || `style-${Date.now()}`,
      title: String(title || "").trim(),
      tag: String(tag || "").trim(),
      image,
      products: normalizeProducts(products),
      order: Number(order) || 0,
    });

    return res.status(201).json({ msg: "Look created", look: toFrontendStyleLook(look) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.updateLook = async (req, res) => {
  try {
    const existing = await findLookByIdOrKey(req.params.id);
    if (!existing) return res.status(404).json({ msg: "Not found" });

    const update = {};
    if (req.body.title != null) update.title = String(req.body.title).trim();
    if (req.body.tag != null) update.tag = String(req.body.tag).trim();
    if (req.body.products != null) update.products = normalizeProducts(req.body.products);
    if (req.body.order != null && req.body.order !== "") update.order = Number(req.body.order) || 0;
    if (req.file?.buffer) {
      update.image = await uploadOne(req.file.buffer);
    } else if (req.body.image != null && String(req.body.image).trim()) {
      update.image = String(req.body.image).trim();
    }

    const look = await StyleLook.findByIdAndUpdate(existing._id, update, { new: true });
    return res.json({ msg: "Updated", look: toFrontendStyleLook(look) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.deleteLook = async (req, res) => {
  try {
    const existing = await findLookByIdOrKey(req.params.id);
    if (!existing) return res.status(404).json({ msg: "Not found" });
    await StyleLook.deleteOne({ _id: existing._id });
    return res.json({ msg: "Deleted" });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};
