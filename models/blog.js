const mongoose = require("mongoose");

const blogSectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "heading", "image", "quote"],
      default: "text",
    },
    content: { type: String, default: "" },
    image: { type: String, default: "" },
    caption: { type: String, default: "" },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    blogKey: { type: String, unique: true, sparse: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    templateId: {
      type: String,
      enum: ["product-spotlight", "seasonal-campaign", "editorial-story"],
      default: "editorial-story",
    },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    categoryLabel: { type: String, default: "Métiers d'Art", trim: true },
    sections: { type: [blogSectionSchema], default: [] },
    linkedProductIds: { type: [String], default: [] },
    cta: {
      text: { type: String, default: "" },
      productIds: { type: [String], default: [] },
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("blog", blogSchema);
