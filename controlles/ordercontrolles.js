const Order = require("../models/order");
const { toFrontendOrder } = require("../utils/mappers");

const DELIVERY_FEE = 20;
const ONLINE_DISCOUNT_RATE = 0.05;

async function nextOrderNumber() {
  const count = await Order.countDocuments();
  return `RA-${String(24000 + count + 1)}`;
}

exports.CreateOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      phone,
      wilaya,
      commune,
      items,
      note,
      paymentMode,
      paymentMethod,
      promoCode,
      loyaltyDiscount: loyaltyDiscountRaw,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: "Order must have at least one item" });
    }

    const normalizedItems = items.map((item) => ({
      productSlug: item.productSlug || item.productId || "",
      name: item.name,
      price: Number(item.price ?? item.unitPrice) || 0,
      quantity: Number(item.quantity ?? item.qty) || 1,
      imageUrl: item.imageUrl || item.img || "",
      color: item.color || "",
      selectedHex: item.selectedHex || "",
    }));

    const subtotal = normalizedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = normalizedItems.length > 0 ? DELIVERY_FEE : 0;
    const mode = paymentMode === "online" ? "online" : "cod";
    const loyaltyDiscount = Math.min(subtotal, Math.max(0, Number(loyaltyDiscountRaw) || 0));
    const afterLoyalty = Math.max(0, subtotal - loyaltyDiscount);
    const onlineDiscount = mode === "online" ? (afterLoyalty + deliveryFee) * ONLINE_DISCOUNT_RATE : 0;
    const discount = loyaltyDiscount + onlineDiscount;
    const total = Math.max(0, afterLoyalty + deliveryFee - onlineDiscount);

    const order = await Order.create({
      orderNumber: await nextOrderNumber(),
      customerName,
      customerEmail: typeof customerEmail === "string" ? customerEmail.trim() : "",
      phone,
      wilaya,
      commune: typeof commune === "string" ? commune.trim() : "",
      userId: req.user ? req.user._id : null,
      items: normalizedItems,
      subtotal,
      deliveryFee,
      discount,
      loyaltyDiscount,
      promoCode: typeof promoCode === "string" ? promoCode.trim() : "",
      total,
      paymentMode: mode,
      paymentMethod: paymentMethod || (mode === "cod" ? "cod" : "visa"),
      note: note || "",
      status: "pending",
    });

    return res.status(201).json({
      msg: "Order placed successfully",
      orderId: order._id,
      orderNumber: order.orderNumber,
      order: toFrontendOrder(order),
    });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.GetMyOrders = async (req, res) => {
  try {
    const email = String(req.user.email || "").toLowerCase();
    const orders = await Order.find({
      $or: [{ userId: req.user._id }, { customerEmail: email }],
    }).sort({ createdAt: -1 });
    return res.status(200).json(orders.map(toFrontendOrder));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.GetOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders.map(toFrontendOrder));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.GetOrder = async (req, res) => {
  try {
    const key = req.params.id;
    const order = await Order.findOne({
      $or: [{ orderNumber: key }, ...( /^[a-f\d]{24}$/i.test(key) ? [{ _id: key }] : []) ],
    });
    if (!order) return res.status(404).json({ msg: "Order not found" });
    return res.status(200).json(toFrontendOrder(order));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.UpdateOrderStatus = async (req, res) => {
  try {
    const { status, issueComment } = req.body;
    const allowed = ["pending", "processing", "confirmed", "on_way", "delivered", "received", "not_received", "order_issue", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const comment = typeof issueComment === "string" ? issueComment.trim() : "";
    if (status === "order_issue" && !comment) {
      return res.status(400).json({ msg: "A comment is required for order issue" });
    }

    const key = req.params.id;
    const update = { status };
    if (status === "order_issue") update.issueComment = comment;
    else if (issueComment !== undefined) update.issueComment = comment;

    const order = await Order.findOneAndUpdate(
      { $or: [{ orderNumber: key }, ...( /^[a-f\d]{24}$/i.test(key) ? [{ _id: key }] : []) ] },
      update,
      { new: true }
    );
    if (!order) return res.status(404).json({ msg: "Order not found" });
    return res.status(200).json({ msg: "Status updated", order: toFrontendOrder(order) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.DeleteOrder = async (req, res) => {
  try {
    const key = req.params.id;
    const result = await Order.deleteOne({
      $or: [{ orderNumber: key }, ...( /^[a-f\d]{24}$/i.test(key) ? [{ _id: key }] : []) ],
    });
    if (result.deletedCount === 0) return res.status(404).json({ msg: "Order not found" });
    return res.status(200).json({ msg: "Order deleted" });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.GetConfig = (req, res) => {
  res.json({
    deliveryFee: DELIVERY_FEE,
    onlineDiscountRate: ONLINE_DISCOUNT_RATE,
    currency: "EUR",
  });
};
