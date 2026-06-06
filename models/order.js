const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productSlug: { type: String, default: "" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", default: null },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, default: "" },
    color: { type: String, default: "" },
    selectedHex: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, trim: true },
    customerName: { type: String, required: [true, "Name is required"] },
    customerEmail: { type: String, trim: true, default: "" },
    phone: { type: String, required: [true, "Phone is required"] },
    wilaya: { type: String, required: [true, "Wilaya is required"] },
    commune: { type: String, trim: true, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "EUR" },
    paymentMode: { type: String, enum: ["cod", "online"], default: "cod" },
    paymentMethod: { type: String, default: "" },
    status: {
      type: String,
      enum: ["processing", "on_way", "delivered", "cancelled"],
      default: "processing",
    },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema);
