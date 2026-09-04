const mongoose = require("mongoose");

const STORE_TYPES = [
  "boutique",
  "maroquinerie",
  "atelier",
  "corner",
  "boutique-de-mode",
  "vente-en-ligne",
];

const boutiqueSchema = new mongoose.Schema(
  {
    storeKey: { type: String, unique: true, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: STORE_TYPES, default: "boutique", trim: true },
    location: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    postal: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    hours: { type: String, default: "", trim: true },
    note: { type: String, default: "", trim: true },
    mapLink: { type: String, default: "", trim: true },
    isOnlineStore: { type: Boolean, default: false },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("boutique", boutiqueSchema);
module.exports.STORE_TYPES = STORE_TYPES;
