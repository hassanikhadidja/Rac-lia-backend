const cloudinary = require("../config/cloudinary");
const HeroSlide = require("../models/heroSlide");

const uploadOne = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: cloudinary.UPLOAD_FOLDER },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });

function toGroupedPayload(slides) {
  const grouped = { mobile: [], tablet: [], desktop: [] };
  for (const s of slides) {
    if (!grouped[s.layout]) continue;
    grouped[s.layout].push({
      _id: String(s._id),
      imageUrl: s.imageUrl,
      layout: s.layout,
      productId: s.productId ? String(s.productId) : null,
      order: s.order,
    });
  }
  return grouped;
}

exports.getPublicSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ layout: 1, order: 1 }).lean();
    return res.status(200).json(toGroupedPayload(slides));
  } catch (e) {
    return res.status(503).json({ msg: e.message });
  }
};

exports.createSlide = async (req, res) => {
  try {
    const { layout, productId, imageUrl, order } = req.body;
    const allowed = ["mobile", "tablet", "desktop"];
    if (!allowed.includes(layout)) {
      return res.status(400).json({ msg: "Invalid layout (mobile | tablet | desktop)" });
    }

    let url = imageUrl != null ? String(imageUrl).trim() : "";
    if (req.file) {
      url = await uploadOne(req.file.buffer);
    }
    if (!url) {
      return res.status(400).json({ msg: "Image required: upload a file or provide imageUrl" });
    }

    let ord = order != null && order !== "" ? Number(order) : null;
    if (ord == null || Number.isNaN(ord)) {
      const max = await HeroSlide.findOne({ layout }).sort({ order: -1 }).select("order").lean();
      ord = (max?.order ?? -1) + 1;
    }

    const doc = await HeroSlide.create({
      imageUrl: url,
      layout,
      productId: productId && String(productId).trim() ? productId : null,
      order: ord,
    });

    return res.status(201).json({ msg: "Created", slide: doc });
  } catch (e) {
    return res.status(503).json({ msg: e.message });
  }
};

exports.updateSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ msg: "Not found" });

    const { layout, productId, order, imageUrl } = req.body;
    const allowed = ["mobile", "tablet", "desktop"];

    if (layout !== undefined && layout !== "") {
      if (!allowed.includes(layout)) {
        return res.status(400).json({ msg: "Invalid layout" });
      }
      slide.layout = layout;
    }
    if (productId !== undefined) {
      slide.productId = productId && String(productId).trim() ? productId : null;
    }
    if (order !== undefined && order !== "") {
      const n = Number(order);
      if (!Number.isNaN(n)) slide.order = n;
    }
    if (req.file) {
      slide.imageUrl = await uploadOne(req.file.buffer);
    } else if (imageUrl !== undefined && String(imageUrl).trim()) {
      slide.imageUrl = String(imageUrl).trim();
    }

    await slide.save();
    return res.status(200).json({ msg: "Updated", slide });
  } catch (e) {
    return res.status(503).json({ msg: e.message });
  }
};

exports.deleteSlide = async (req, res) => {
  try {
    const result = await HeroSlide.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ msg: "Not found" });
    return res.status(200).json({ msg: "Deleted" });
  } catch (e) {
    return res.status(503).json({ msg: e.message });
  }
};
