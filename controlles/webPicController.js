const cloudinary = require("../config/cloudinary");
const WebPic = require("../models/webPic");
const { toFrontendWebPic } = require("../utils/mappers");

const uploadOne = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "racelia-webpics" }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });

async function findWebPicByIdOrKey(idOrKey) {
  if (!idOrKey) return null;
  const key = String(idOrKey);
  const byKey = await WebPic.findOne({ webPicKey: key });
  if (byKey) return byKey;
  if (/^[a-f\d]{24}$/i.test(key)) return WebPic.findById(key);
  return null;
}

function groupByDevice(pics) {
  const grouped = { mobile: [], tablet: [], laptop: [] };
  for (const pic of pics) {
    const mapped = toFrontendWebPic(pic);
    const device = mapped.device === "desktop" ? "laptop" : mapped.device;
    if (grouped[device]) grouped[device].push(mapped);
  }
  return grouped;
}

exports.getPublicWebPics = async (req, res) => {
  try {
    const pics = await WebPic.find().sort({ device: 1, section: 1, order: 1 });
    return res.status(200).json({
      all: pics.map(toFrontendWebPic),
      byDevice: groupByDevice(pics),
    });
  } catch (e) {
    return res.status(503).json({ msg: e.message });
  }
};

exports.getActiveWebPic = async (req, res) => {
  try {
    const { device = "mobile", section = "hero" } = req.query;
    const pic = await WebPic.findOne({ device, section }).sort({ order: 1 });
    if (!pic) return res.status(404).json({ msg: "No web pic found" });
    return res.status(200).json(toFrontendWebPic(pic));
  } catch (e) {
    return res.status(503).json({ msg: e.message });
  }
};

exports.createWebPic = async (req, res) => {
  try {
    const { title, device, section, linksToProduct, productSlug, productId, order, image, imageUrl } =
      req.body;
    const allowedDevices = ["mobile", "tablet", "laptop"];
    const allowedSections = ["hero", "category", "intro", "products", "editorial", "other"];

    if (!allowedDevices.includes(device)) {
      return res.status(400).json({ msg: "Invalid device (mobile | tablet | laptop)" });
    }
    if (section && !allowedSections.includes(section)) {
      return res.status(400).json({ msg: "Invalid section" });
    }

    let url = String(image || imageUrl || "").trim();
    if (req.file?.buffer) url = await uploadOne(req.file.buffer);
    if (!url) return res.status(400).json({ msg: "Image required" });

    let ord = order != null && order !== "" ? Number(order) : null;
    if (ord == null || Number.isNaN(ord)) {
      const max = await WebPic.findOne({ device, section: section || "hero" })
        .sort({ order: -1 })
        .select("order")
        .lean();
      ord = (max?.order ?? -1) + 1;
    }

    const doc = await WebPic.create({
      webPicKey: req.body.webPicKey || req.body.id || `webpic-${Date.now()}`,
      title: String(title || "").trim(),
      image: url,
      device,
      section: section || "hero",
      linksToProduct: linksToProduct === true || linksToProduct === "true",
      productSlug: String(productSlug || productId || "").trim(),
      order: ord,
    });

    return res.status(201).json({ msg: "Created", webPic: toFrontendWebPic(doc) });
  } catch (e) {
    return res.status(503).json({ msg: e.message });
  }
};

exports.updateWebPic = async (req, res) => {
  try {
    const pic = await findWebPicByIdOrKey(req.params.id);
    if (!pic) return res.status(404).json({ msg: "Not found" });

    const { title, device, section, linksToProduct, productSlug, productId, order, image, imageUrl } =
      req.body;

    if (title !== undefined) pic.title = String(title).trim();
    if (device !== undefined && device !== "") pic.device = device;
    if (section !== undefined && section !== "") pic.section = section;
    if (linksToProduct !== undefined) {
      pic.linksToProduct = linksToProduct === true || linksToProduct === "true";
    }
    if (productSlug !== undefined || productId !== undefined) {
      pic.productSlug = String(productSlug || productId || "").trim();
    }
    if (order !== undefined && order !== "") {
      const n = Number(order);
      if (!Number.isNaN(n)) pic.order = n;
    }
    if (req.file?.buffer) {
      pic.image = await uploadOne(req.file.buffer);
    } else if (image !== undefined || imageUrl !== undefined) {
      const url = String(image || imageUrl || "").trim();
      if (url) pic.image = url;
    }

    await pic.save();
    return res.status(200).json({ msg: "Updated", webPic: toFrontendWebPic(pic) });
  } catch (e) {
    return res.status(503).json({ msg: e.message });
  }
};

exports.deleteWebPic = async (req, res) => {
  try {
    const pic = await findWebPicByIdOrKey(req.params.id);
    if (!pic) return res.status(404).json({ msg: "Not found" });
    await WebPic.deleteOne({ _id: pic._id });
    return res.status(200).json({ msg: "Deleted" });
  } catch (e) {
    return res.status(503).json({ msg: e.message });
  }
};

// Backward-compatible hero slide handlers (maps old /hero routes)
exports.getPublicSlides = exports.getPublicWebPics;
exports.createSlide = exports.createWebPic;
exports.updateSlide = exports.updateWebPic;
exports.deleteSlide = exports.deleteWebPic;
