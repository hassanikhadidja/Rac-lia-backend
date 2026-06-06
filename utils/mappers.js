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
  const cardImages = Array.isArray(p.cardImages) ? p.cardImages.filter(Boolean) : [];
  const coverImage = p.coverImage || cardImages[0] || "";
  const images = coverImage
    ? [coverImage, ...cardImages.filter((url) => url !== coverImage)]
    : cardImages;

  return {
    id: p.slug,
    _id: String(p._id),
    name: p.name || "",
    tag: p.tag || "",
    price: p.price || formatPriceEur(p.priceAmount || 0),
    stockNote: p.stockNote || "",
    description: p.description || "",
    isPack: Boolean(p.isPack),
    packLabel: p.packLabel || "",
    sections: Array.isArray(p.sections) ? p.sections : ["all-selection"],
    coverImage,
    cardImages: images,
    closerLookImages: Array.isArray(p.closerLookImages) ? p.closerLookImages : [],
    closerLookMain: {
      image: p.closerLookMain?.image || images[1] || coverImage,
      title: p.closerLookMain?.title || "A Closer Look",
      text:
        p.closerLookMain?.text ||
        "Refined pebble leather with a polished finish — casual meets dressy, designed for everyday elegance.",
    },
    colors: Array.isArray(p.colors) ? p.colors : [],
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

function toFrontendWebPic(doc) {
  if (!doc) return null;
  const w = doc.toObject ? doc.toObject() : doc;
  return {
    id: w.webPicKey || String(w._id),
    _id: String(w._id),
    title: w.title || "",
    image: w.image || w.imageUrl || "",
    device: w.device || w.layout || "mobile",
    section: w.section || "hero",
    linksToProduct: Boolean(w.linksToProduct),
    productId: w.productSlug || (w.productId ? String(w.productId) : null),
    order: w.order ?? 0,
    createdAt: w.createdAt ? new Date(w.createdAt).getTime() : Date.now(),
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
  const firstItem = o.items?.[0];
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
    total: formatPriceEur(o.total),
    status: o.status || "processing",
    statusLabel: orderStatusLabel(o.status),
    items: o.items || [],
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    discount: o.discount || 0,
    paymentMode: o.paymentMode || "cod",
    paymentMethod: o.paymentMethod || "",
    note: o.note || "",
    createdAt: o.createdAt,
  };
}

function orderStatusLabel(status) {
  const map = {
    processing: "Processing",
    on_way: "On the way",
    delivered: "Delivered",
    cancelled: "Cancelled",
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
    birthday: u.birthday || null,
    createdAt: u.createdAt ? new Date(u.createdAt).getTime() : Date.now(),
  };
}

module.exports = {
  PRODUCT_SECTIONS,
  toFrontendProduct,
  toFrontendBlog,
  toFrontendWebPic,
  toFrontendReview,
  toFrontendStyleLook,
  toStorefrontStyleLook,
  toFrontendOrder,
  toFrontendUser,
  orderStatusLabel,
};
