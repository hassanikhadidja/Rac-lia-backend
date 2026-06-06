const mongoose = require("mongoose");

const DEVICES = ["mobile", "tablet", "laptop"];
const SECTIONS = ["hero", "category", "intro", "products", "editorial", "other"];

const webPicSchema = new mongoose.Schema(
  {
    webPicKey: { type: String, unique: true, sparse: true, trim: true },
    title: { type: String, default: "", trim: true },
    image: { type: String, required: true, trim: true },
    device: { type: String, enum: DEVICES, required: true },
    section: { type: String, enum: SECTIONS, default: "hero" },
    linksToProduct: { type: Boolean, default: false },
    productSlug: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

webPicSchema.index({ device: 1, section: 1, order: 1 });

module.exports = mongoose.model("webpic", webPicSchema);
