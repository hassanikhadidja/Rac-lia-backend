const Product = require("../models/product");
const cloudinary = require("../config/cloudinary");
const { parsePrice, formatPriceEur } = require("../utils/parsePrice");
const { toFrontendProduct } = require("../utils/mappers");

function slugify(text) {
  return (
    String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `product-${Date.now()}`
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

function parseStringArray(raw) {
  const parsed = parseJsonField(raw, raw);
  if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  if (typeof parsed === "string" && parsed.includes(",")) {
    return parsed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return typeof parsed === "string" && parsed ? [parsed] : [];
}

const uploadOne = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "racelia-products" }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });

const uploadAll = (files) =>
  files && files.length > 0 ? Promise.all(files.map((f) => uploadOne(f.buffer))) : Promise.resolve([]);

async function findProductByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;
  const bySlug = await Product.findOne({ slug: String(idOrSlug).toLowerCase() });
  if (bySlug) return bySlug;
  if (/^[a-f\d]{24}$/i.test(String(idOrSlug))) {
    return Product.findById(idOrSlug);
  }
  return null;
}

function buildProductBody(body, uploadedUrls = []) {
  const data = { ...body };
  const slug = String(data.slug || data.id || "").trim().toLowerCase() || slugify(data.name);
  data.slug = slug;

  if (data.price != null) {
    data.price = String(data.price);
    if (!data.priceAmount) data.priceAmount = parsePrice(data.price);
  } else if (data.priceAmount != null) {
    data.priceAmount = Number(data.priceAmount) || 0;
    if (!data.price) data.price = formatPriceEur(data.priceAmount);
  }

  if (data.sections != null) data.sections = parseStringArray(data.sections);
  if (data.cardImages != null) data.cardImages = parseStringArray(data.cardImages);
  if (data.closerLookImages != null) data.closerLookImages = parseStringArray(data.closerLookImages);
  if (data.colors != null) data.colors = parseStringArray(data.colors);
  if (data.filters != null) data.filters = parseStringArray(data.filters);
  if (data.closerLookMain != null) data.closerLookMain = parseJsonField(data.closerLookMain, {});

  if (data.isPack !== undefined) data.isPack = data.isPack === true || data.isPack === "true";
  if (data.stockNote === undefined) data.stockNote = data.stockNote || "";

  let keepImgs = data.keepImgs || data.cardImages || [];
  if (typeof keepImgs === "string") keepImgs = keepImgs ? [keepImgs] : [];
  if (uploadedUrls.length) {
    data.cardImages = [...keepImgs, ...uploadedUrls];
    if (!data.coverImage && data.cardImages[0]) data.coverImage = data.cardImages[0];
  } else if (Array.isArray(keepImgs) && keepImgs.length) {
    data.cardImages = keepImgs;
  }

  delete data.keepImgs;
  delete data.id;
  return data;
}

exports.AddProduct = async (req, res) => {
  try {
    const urls = await uploadAll(req.files);
    const body = buildProductBody(req.body, urls);

    if (!body.name) return res.status(400).json({ msg: "Product name is required" });

    const exists = await Product.findOne({ slug: body.slug });
    if (exists) return res.status(400).json({ msg: "Product slug already exists" });

    const product = await Product.create(body);
    return res.status(201).json({ msg: "Product added", product: toFrontendProduct(product) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.GetProducts = async (req, res) => {
  try {
    const { section } = req.query;
    let query = {};
    if (section) query = { sections: section };

    const products = await Product.find(query).sort({ updatedAt: -1 });
    return res.status(200).json(products.map(toFrontendProduct));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.GetOneProduct = async (req, res) => {
  try {
    const product = await findProductByIdOrSlug(req.params.idOrSlug);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    return res.status(200).json(toFrontendProduct(product));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.UpdateProduct = async (req, res) => {
  try {
    const existing = await findProductByIdOrSlug(req.params.idOrSlug);
    if (!existing) return res.status(404).json({ msg: "Product not found" });

    const newUrls = await uploadAll(req.files);
    const updateData = buildProductBody(req.body, newUrls);

    if (updateData.slug && updateData.slug !== existing.slug) {
      const clash = await Product.findOne({ slug: updateData.slug, _id: { $ne: existing._id } });
      if (clash) return res.status(400).json({ msg: "Product slug already exists" });
    }

    const product = await Product.findByIdAndUpdate(existing._id, updateData, { new: true });
    return res.status(200).json({ msg: "Update success", product: toFrontendProduct(product) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.DeleteProduct = async (req, res) => {
  try {
    const existing = await findProductByIdOrSlug(req.params.idOrSlug);
    if (!existing) return res.status(404).json({ msg: "Product not found" });
    await Product.deleteOne({ _id: existing._id });
    return res.status(200).json({ msg: "Product deleted" });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};
