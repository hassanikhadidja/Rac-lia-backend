const Review = require("../models/review");
const cloudinary = require("../config/cloudinary");
const { toFrontendReview } = require("../utils/mappers");

const uploadOne = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: cloudinary.UPLOAD_FOLDER }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });

async function findReviewByIdOrKey(idOrKey) {
  if (!idOrKey) return null;
  const key = String(idOrKey);
  const byKey = await Review.findOne({ reviewKey: key });
  if (byKey) return byKey;
  if (/^[a-f\d]{24}$/i.test(key)) return Review.findById(key);
  return null;
}

exports.getPublishedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "published" }).sort({ createdAt: -1 });
    return res.json(reviews.map(toFrontendReview));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "pending" }).sort({ createdAt: -1 });
    return res.json(reviews.map(toFrontendReview));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    return res.json(reviews.map(toFrontendReview));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { author, product, productSlug, stars, comment, source, status, reviewDate } = req.body;
    if (!author || !product) {
      return res.status(400).json({ msg: "Author and product are required" });
    }

    let photo = null;
    if (req.file?.buffer) photo = await uploadOne(req.file.buffer);

    const review = await Review.create({
      reviewKey: req.body.reviewKey || req.body.id || `review-${Date.now()}`,
      author: String(author).trim(),
      product: String(product).trim(),
      productSlug: String(productSlug || "").trim(),
      stars: Math.min(5, Math.max(1, Number(stars) || 5)),
      comment: String(comment || ""),
      reviewDate: reviewDate || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      photo,
      source: source === "admin" ? "admin" : "client",
      status: status === "published" ? "published" : "pending",
    });

    return res.status(201).json({ msg: "Review added", review: toFrontendReview(review) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const existing = await findReviewByIdOrKey(req.params.id);
    if (!existing) return res.status(404).json({ msg: "Not found" });

    const update = { ...req.body };
    if (update.stars != null) update.stars = Math.min(5, Math.max(1, Number(update.stars) || 5));
    if (update.status != null) update.status = update.status === "published" ? "published" : "pending";
    if (update.source != null) update.source = update.source === "admin" ? "admin" : "client";
    if (req.file?.buffer) update.photo = await uploadOne(req.file.buffer);

    delete update.id;
    delete update.reviewKey;

    const review = await Review.findByIdAndUpdate(existing._id, update, { new: true });
    return res.json({ msg: "Updated", review: toFrontendReview(review) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.publishReview = async (req, res) => {
  try {
    const existing = await findReviewByIdOrKey(req.params.id);
    if (!existing) return res.status(404).json({ msg: "Not found" });
    existing.status = "published";
    await existing.save();
    return res.json({ msg: "Published", review: toFrontendReview(existing) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const existing = await findReviewByIdOrKey(req.params.id);
    if (!existing) return res.status(404).json({ msg: "Not found" });
    await Review.deleteOne({ _id: existing._id });
    return res.json({ msg: "Deleted" });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};
