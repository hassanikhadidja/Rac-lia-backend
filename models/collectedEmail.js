const mongoose = require("mongoose");

const collectedEmailSchema = new mongoose.Schema(
  {
    emailKey: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, default: "" },
    newsletter: { type: Boolean, default: false },
    sources: {
      type: [{ type: String, enum: ["account", "newsletter", "contact", "returns", "admin"] }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("collectedEmail", collectedEmailSchema);
