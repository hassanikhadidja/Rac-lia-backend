const mongoose = require("mongoose");

const styleProductSchema = new mongoose.Schema(
  {
    entryKey: { type: String, default: "" },
    productSlug: { type: String, required: true },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const styleLookSchema = new mongoose.Schema(
  {
    lookKey: { type: String, unique: true, sparse: true, trim: true },
    title: { type: String, default: "", trim: true },
    tag: { type: String, default: "", trim: true },
    image: { type: String, required: true, trim: true },
    products: { type: [styleProductSchema], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("stylelook", styleLookSchema);
