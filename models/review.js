const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewKey: { type: String, unique: true, sparse: true, trim: true },
    author: { type: String, required: true, trim: true },
    product: { type: String, required: true, trim: true },
    productSlug: { type: String, default: "" },
    stars: { type: Number, required: true, min: 1, max: 5, default: 5 },
    comment: { type: String, default: "" },
    reviewDate: { type: String, default: "" },
    photo: { type: String, default: null },
    source: { type: String, enum: ["admin", "client"], default: "client" },
    status: { type: String, enum: ["pending", "published"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("review", reviewSchema);
