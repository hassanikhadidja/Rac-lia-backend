const { formatPriceEur } = require("./parsePrice");

const PRODUCT_SECTIONS = [
  "mini-bags",
  "racelia-handbag",
  "moms-bags",
  "all-selection",
  "metiers-dart",
];

function toFrontendProduct(doc) {
  if (!doc) return null;
  const p = doc.toObject ? doc.toObject() : doc;
  const cardCover = p.cardCover || p.coverImage || "";
  const cardScroll = Array.isArray(p.cardScroll) && p.cardScroll.length
    ? p.cardScroll.filter(Boolean)
    : Array.isArray(p.cardImages)
      ? p.cardImages.filter((url) => url && url !== cardCover)
      : [];

  return {
    id: p.slug,
    _id: String(p._id),
    name: p.name || "",
    tag: p.tag || "",
    price: p.price || "",
    priceAmountDzd: p.priceAmountDzd || 0,
    stockNote: p.stockNote || "",
    description: p.description || "",
    isPack: Boolean(p.isPack),
    isNewArrival: Boolean(p.isNewArrival),
    inSalesReport: Boolean(p.inSalesReport),
    hasColorImages: Boolean(p.hasColorImages),
    packLabel: p.packLabel || "",
    sections: Array.isArray(p.sections) ? p.sections : ["all-selection"],
    cardCover,
    cardScroll,
    pdpCover: p.pdpCover || cardCover,
    pdpScroll: Array.isArray(p.pdpScroll) ? p.pdpScroll.filter(Boolean) : cardScroll,
    coverImage: cardCover,
    cardImages: cardCover ? [cardCover, ...cardScroll] : cardScroll,
    closerLookExtra: Array.isArray(p.closerLookExtra)
      ? p.closerLookExtra.filter(Boolean)
      : Array.isArray(p.closerLookImages)
        ? p.closerLookImages
        : [],
    closerLookImages: Array.isArray(p.closerLookImages) ? p.closerLookImages : [],
    closerLookMain: {
      image: p.closerLookMain?.image || cardScroll[0] || cardCover,
      title: p.closerLookMain?.title || "A Closer Look",
      text: p.closerLookMain?.text || "",
    },
    colors: Array.isArray(p.colors) ? p.colors : [],
    colorVariants: Array.isArray(p.colorVariants) ? p.colorVariants : [],
    details: Array.isArray(p.details) && p.details.length
      ? p.details.filter(Boolean)
      : [p.materials, p.size].filter(Boolean),
    materials: p.materials || "",
    size: p.size || "",
    filters: Array.isArray(p.filters) ? p.filters : [],
    createdAt: p.createdAt ? new Date(p.createdAt).getTime() : Date.now(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).getTime() : Date.now(),
  };
}

function toFrontendBlog(doc) {
  if (!doc) return null;
  const b = doc.toObject ? doc.toObject() : doc;
  return {
    id: b.blogKey || b.slug,
    _id: String(b._id),
    templateId: b.templateId || "editorial-story",
    status: b.status || (b.isPublished ? "published" : "draft"),
    title: b.title || "",
    subtitle: b.subtitle || "",
    coverImage: b.coverImage || "",
    sections: Array.isArray(b.sections) ? b.sections : [],
    linkedProductIds: Array.isArray(b.linkedProductIds) ? b.linkedProductIds : [],
    cta: {
      text: b.cta?.text || "",
      productIds: Array.isArray(b.cta?.productIds) ? b.cta.productIds : [],
    },
    slug: b.slug,
    createdAt: b.createdAt ? new Date(b.createdAt).getTime() : Date.now(),
    updatedAt: b.updatedAt ? new Date(b.updatedAt).getTime() : Date.now(),
    publishedAt: b.publishedAt ? new Date(b.publishedAt).getTime() : null,
  };
}

function toFrontendReview(doc) {
  if (!doc) return null;
  const r = doc.toObject ? doc.toObject() : doc;
  return {
    id: r.reviewKey || String(r._id),
    _id: String(r._id),
    author: r.author || "",
    product: r.product || "",
    productSlug: r.productSlug || "",
    stars: r.stars || 5,
    comment: r.comment || "",
    date: r.reviewDate || (r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""),
    photo: r.photo || null,
    source: r.source || "client",
    status: r.status || "pending",
  };
}

function toFrontendStyleLook(doc) {
  if (!doc) return null;
  const s = doc.toObject ? doc.toObject() : doc;
  return {
    id: s.lookKey || String(s._id),
    _id: String(s._id),
    title: s.title || "",
    tag: s.tag || "",
    image: s.image || "",
    products: Array.isArray(s.products)
      ? s.products.map((p, i) => ({
          id: p.entryKey || `${s.lookKey || s._id}-p-${i}`,
          productId: p.productSlug || p.productId || "",
          image: p.image || "",
        }))
      : [],
    order: s.order ?? 0,
    createdAt: s.createdAt ? new Date(s.createdAt).getTime() : Date.now(),
  };
}

function toStorefrontStyleLook(doc) {
  const look = toFrontendStyleLook(doc);
  if (!look) return null;
  return {
    img: look.image,
    products: look.products.map((p) => ({ id: p.productId, image: p.image })),
  };
}

function toFrontendOrder(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  const items = o.items || [];
  const firstItem = items[0];
  const quantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || 1;
  const rawStatus = o.status === "processing" ? "pending" : o.status || "pending";
  return {
    id: o.orderNumber,
    _id: String(o._id),
    date: o.createdAt
      ? new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "",
    customer: o.customerName || "",
    customerEmail: o.customerEmail || "",
    phone: o.phone || "",
    wilaya: o.wilaya || "",
    commune: o.commune || "",
    product: firstItem?.name || "",
    productSlug: firstItem?.productSlug || "",
    quantity,
    total: formatPriceEur(o.total),
    status: rawStatus,
    statusLabel: orderStatusLabel(rawStatus),
    items,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    discount: o.discount || 0,
    loyaltyDiscount: o.loyaltyDiscount || 0,
    promoCode: o.promoCode || "",
    hasAccount: Boolean(o.userId),
    userId: o.userId ? String(o.userId) : "",
    paymentMode: o.paymentMode || "cod",
    paymentMethod: o.paymentMethod || "",
    note: o.note || "",
    issueComment: o.issueComment || "",
    createdAt: o.createdAt,
  };
}

function orderStatusLabel(status) {
  const map = {
    pending: "Pending",
    processing: "Pending",
    confirmed: "Confirmed",
    on_way: "In way",
    delivered: "Delivered",
    received: "Received",
    not_received: "Not Received",
    order_issue: "Order Issue",
    cancelled: "Canceled",
  };
  return map[status] || status;
}

function toFrontendUser(doc) {
  if (!doc) return null;
  const u = doc.toObject ? doc.toObject() : doc;
  const roleMap = {
    admin: "Admin",
    manager: "Manager",
    support: "Support",
    client: "Customer",
  };
  return {
    id: u.userKey || String(u._id),
    _id: String(u._id),
    name: u.name || "",
    email: u.email || "",
    role: roleMap[u.role] || u.role || "Customer",
    status: u.status || "active",
    points: u.points ?? 0,
    phone: u.phone || "",
    address: u.address || "",
    wilaya: u.wilaya || "",
    commune: u.commune || "",
    birthday: u.birthday || null,
    avatar: u.avatar || "",
    newsletter: u.newsletter !== false,
    createdAt: u.createdAt ? new Date(u.createdAt).getTime() : Date.now(),
  };
}

function toFrontendCollectedEmail(doc) {
  if (!doc) return null;
  const e = doc.toObject ? doc.toObject() : doc;
  return {
    id: e.emailKey || String(e._id),
    _id: String(e._id),
    email: e.email || "",
    name: e.name || "",
    newsletter: e.newsletter === true,
    sources: Array.isArray(e.sources) ? e.sources : [],
    createdAt: e.createdAt ? new Date(e.createdAt).getTime() : Date.now(),
    updatedAt: e.updatedAt ? new Date(e.updatedAt).getTime() : Date.now(),
  };
}

function toFrontendReturnRequest(doc) {
  if (!doc) return null;
  const r = doc.toObject ? doc.toObject() : doc;
  return {
    id: r.requestKey || String(r._id),
    _id: String(r._id),
    requestType: r.requestType || "reclamation",
    name: r.name || "",
    phone: r.phone || "",
    email: r.email || "",
    wilaya: r.wilaya || "",
    wilayaName: r.wilayaName || "",
    comment: r.comment || "",
    picture: r.picture || "",
    status: r.status || "pending",
    createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
    updatedAt: r.updatedAt ? new Date(r.updatedAt).getTime() : Date.now(),
  };
}

module.exports = {
  PRODUCT_SECTIONS,
  toFrontendProduct,
  toFrontendBlog,
  toFrontendReview,
  toFrontendStyleLook,
  toStorefrontStyleLook,
  toFrontendOrder,
  toFrontendUser,
  toFrontendCollectedEmail,
  toFrontendReturnRequest,
  orderStatusLabel,
};
