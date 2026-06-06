const mongoose = require("mongoose");

const closerLookMainSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    title: { type: String, default: "A Closer Look" },
    text: { type: String, default: "" },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, required: [true, "Product name is required"], trim: true },
    tag: { type: String, default: "", trim: true },
    price: { type: String, default: "" },
    priceAmount: { type: Number, default: 0, min: 0 },
    stockNote: {
      type: String,
      enum: ["", "new", "dispo", "sold-out", "not"],
      default: "",
    },
    description: { type: String, default: "" },
    isPack: { type: Boolean, default: false },
    packLabel: { type: String, default: "" },
    sections: {
      type: [String],
      default: ["all-selection"],
      enum: ["mini-bags", "racelia-handbag", "moms-bags", "all-selection", "metiers-dart"],
    },
    coverImage: { type: String, default: "" },
    cardImages: { type: [String], default: [] },
    closerLookImages: { type: [String], default: [] },
    closerLookMain: { type: closerLookMainSchema, default: () => ({}) },
    colors: { type: [String], default: [] },
    materials: { type: String, default: "" },
    size: { type: String, default: "" },
    filters: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
