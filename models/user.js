const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userKey: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    birthday: { type: Date, default: null },
    points: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "pending", "suspended"], default: "active" },
    role: { type: String, enum: ["admin", "manager", "support", "client"], default: "client" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
