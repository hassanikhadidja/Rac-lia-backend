const mongoose = require("mongoose");

const returnRequestSchema = new mongoose.Schema(
  {
    requestKey: { type: String, unique: true, sparse: true, trim: true },
    requestType: {
      type: String,
      enum: ["retour", "echange", "reclamation"],
      default: "reclamation",
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    email: { type: String, default: "", trim: true, lowercase: true },
    wilaya: { type: String, default: "" },
    wilayaName: { type: String, default: "" },
    comment: { type: String, default: "" },
    picture: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in_progress", "solved", "closed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("returnRequest", returnRequestSchema);
