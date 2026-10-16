require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/product");
const catalog = require("./storefront-catalog.json");

function docFrom(product) {
  const cardCover = product.cardCover || product.coverImage || "";
  return {
    slug: String(product.id || "").trim().toLowerCase(),
    name: product.name || "",
    tag: product.tag || "",
    price: product.price || "",
    priceAmount: Number(product.priceAmount) || 0,
    priceAmountDzd: Number(product.priceAmountDzd) || 0,
    promoPriceAmountDzd: Number(product.promoPriceAmountDzd) || 0,
    isPromo: Boolean(product.isPromo),
    stockNote: product.stockNote || "",
    stockNotes: Array.isArray(product.stockNotes) ? product.stockNotes : [],
    univers: Array.isArray(product.univers) ? product.univers : [],
    audiences: Array.isArray(product.audiences) ? product.audiences : [],
    departments: Array.isArray(product.departments) ? product.departments : [],
    mallFilters: Array.isArray(product.mallFilters) ? product.mallFilters : [],
    kidsCategories: Array.isArray(product.kidsCategories) ? product.kidsCategories : [],
    description: product.description || "",
    isPack: Boolean(product.isPack),
    packLabel: product.packLabel || "",
    isNewArrival: Boolean(product.isNewArrival),
    inSalesReport: Boolean(product.inSalesReport),
    hasColorImages: Boolean(product.hasColorImages),
    sections: Array.isArray(product.sections) && product.sections.length ? product.sections : ["all-selection"],
    coverImage: product.coverImage || cardCover,
    cardCover,
    cardScroll: Array.isArray(product.cardScroll) ? product.cardScroll : [],
    pdpCover: product.pdpCover || cardCover,
    pdpScroll: Array.isArray(product.pdpScroll) ? product.pdpScroll : [],
    cardImages: Array.isArray(product.cardImages) ? product.cardImages : [],
    closerLookExtra: Array.isArray(product.closerLookExtra) ? product.closerLookExtra : [],
    closerLookImages: Array.isArray(product.closerLookImages) ? product.closerLookImages : [],
    closerLookMain: product.closerLookMain || {},
    colors: Array.isArray(product.colors) ? product.colors : [],
    colorVariants: Array.isArray(product.colorVariants) ? product.colorVariants : [],
    details: Array.isArray(product.details) ? product.details : [],
    filters: Array.isArray(product.filters) ? product.filters : [],
  };
}

async function main() {
  if (!process.env.uri) throw new Error("MongoDB URI is not defined");
  await mongoose.connect(process.env.uri);
  for (const product of catalog) {
    const doc = docFrom(product);
    if (!doc.slug || !doc.name) continue;
    const existing = await Product.findOne({ slug: doc.slug });
    if (existing) {
      if (!doc.priceAmount && existing.priceAmount) doc.priceAmount = existing.priceAmount;
      existing.set(doc);
      await existing.save();
      console.log("updated", doc.slug);
    } else {
      await Product.create(doc);
      console.log("created", doc.slug);
    }
  }
  const count = await Product.countDocuments();
  console.log("products", count);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
