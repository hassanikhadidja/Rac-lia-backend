/**
 * Seed RACÈLIA backend with catalog data matching the frontend defaults.
 * Run: node seed/seedRacelia.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const bcrypt = require("bcrypt");
const connectDB = require("../config/connectDB");
const Product = require("../models/product");
const Blog = require("../models/blog");
const WebPic = require("../models/webPic");
const StyleLook = require("../models/styleLook");
const Review = require("../models/review");
const User = require("../models/user");
const { parsePrice } = require("../utils/parsePrice");

const img = {
  bag1: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80",
  bag2: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
  bag3: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
  bag4: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80",
  bag5: "https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cef?auto=format&fit=crop&w=800&q=80",
  bag6: "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80",
  editorial: "https://images.unsplash.com/photo-1483653364400-eedcfb9f1f88?auto=format&fit=crop&w=1000&q=80",
  hero: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85",
};

const products = [
  {
    slug: "mini-flap-bag",
    name: "MINI FLAP BAG",
    tag: "Métiers d'Art",
    price: "€ 3,950",
    stockNote: "new",
    coverImage: img.bag1,
    cardImages: [img.bag1, img.bag3, img.bag4, img.bag5],
    closerLookImages: [img.bag3, img.bag4],
    colors: ["#5a4a36", "#111", "#f1ece2", "#7a1f1f", "#6b8aa8", "#c4a882"],
    filters: ["2026 Métiers d'art", "Leather", "Black", "Gold-Tone"],
    sections: ["mini-bags", "all-selection", "metiers-dart"],
    description: "The Mini Flap Bag features signature RACÈLIA hardware and a compact silhouette for day-to-night wear.",
    size: "Width: 20 cm · Height: 14 cm · Depth: 6 cm. Detachable crossbody strap included.",
  },
  {
    slug: "mini-hobo-bag",
    name: "MINI HOBO BAG",
    tag: "SS26",
    price: "€ 4,200",
    stockNote: "dispo",
    coverImage: img.bag3,
    cardImages: [img.bag3, img.bag1, img.bag6, img.bag2],
    closerLookImages: [img.bag1, img.bag6],
    colors: ["#111", "#7a1f1f", "#f1ece2"],
    filters: ["Spring Summer 2026", "Leather", "Red", "Silver-Tone"],
    sections: ["mini-bags", "all-selection"],
    description: "Soft hobo silhouette with adjustable strap and interior card slots.",
  },
  {
    slug: "mini-evening-clutch",
    name: "MINI EVENING CLUTCH",
    tag: "Evening",
    price: "€ 2,850",
    stockNote: "dispo",
    coverImage: img.bag5,
    cardImages: [img.bag5, img.bag4, img.bag3],
    closerLookImages: [img.bag4, img.bag3],
    colors: ["#6b8aa8", "#111", "#f1ece2", "#5a4a36", "#7a1f1f"],
    filters: ["The Emblematics", "Tweed & Fabrics", "Blue", "Gold-Tone", "On a look"],
    sections: ["mini-bags", "all-selection"],
    description: "Compact evening clutch with chain strap and magnetic closure.",
  },
  {
    slug: "racelia-classic",
    name: "THE RACÈLIA CLASSIC",
    tag: "Signature",
    price: "€ 5,700",
    stockNote: "new",
    coverImage: img.bag2,
    cardImages: [img.bag2, img.bag4, img.bag6, img.bag1, img.bag3],
    closerLookImages: [img.bag4, img.bag6],
    colors: ["#6b8aa8", "#111", "#f1ece2", "#5a4a36", "#7a1f1f", "#c4a882", "#2f4f4f"],
    filters: ["2026 Métiers d'art", "Leather", "Beige", "Gold-Tone"],
    sections: ["racelia-handbag", "all-selection", "metiers-dart"],
    description: "Signature RACÈLIA hardware, a top handle and a detachable crossbody strap for versatile day-to-evening wear.",
  },
  {
    slug: "racelia-maxi-flap",
    name: "RACÈLIA MAXI FLAP",
    tag: "Pre-collection",
    price: "€ 6,400",
    stockNote: "dispo",
    coverImage: img.bag4,
    cardImages: [img.bag4, img.bag2, img.bag5],
    closerLookImages: [img.bag2, img.bag5],
    colors: ["#5a4a36", "#111"],
    filters: ["Spring Summer 2026 Pre-collection", "Leather", "Black", "Silver-Tone"],
    sections: ["racelia-handbag", "all-selection"],
    description: "Oversized flap silhouette with double-compartment interior.",
  },
  {
    slug: "racelia-signature-tote",
    name: "RACÈLIA SIGNATURE TOTE",
    tag: "SS26",
    price: "€ 5,200",
    stockNote: "sold-out",
    coverImage: img.bag6,
    cardImages: [img.bag6, img.bag3, img.bag1, img.bag4],
    closerLookImages: [img.bag3, img.bag1],
    colors: ["#111", "#f1ece2", "#7a1f1f"],
    filters: ["Spring Summer 2026", "Tweed & Fabrics", "Red", "Gold-Tone"],
    sections: ["racelia-handbag", "all-selection"],
    description: "Structured tote with reinforced base and interior zip pocket.",
  },
  {
    slug: "mom-tote",
    name: "MOM TOTE",
    tag: "Métiers d'Art",
    price: "€ 4,650",
    stockNote: "dispo",
    coverImage: img.bag4,
    cardImages: [img.bag4, img.bag5, img.bag2, img.bag6],
    closerLookImages: [img.bag5, img.bag2],
    colors: ["#5a4a36", "#111", "#f1ece2", "#6b8aa8", "#7a1f1f"],
    filters: ["2026 Métiers d'art", "Leather", "Beige", "Gold-Tone", "On a look"],
    sections: ["moms-bags", "all-selection", "metiers-dart"],
    description: "Spacious tote designed for everyday elegance with multiple carry options.",
  },
  {
    slug: "mom-shoulder-bag",
    name: "MOM SHOULDER BAG",
    tag: "Emblematics",
    price: "€ 4,950",
    stockNote: "dispo",
    coverImage: img.bag5,
    cardImages: [img.bag5, img.bag1, img.bag3],
    closerLookImages: [img.bag1, img.bag3],
    colors: ["#111", "#6b8aa8"],
    filters: ["The Emblematics", "Leather", "Blue", "Silver-Tone"],
    sections: ["moms-bags", "all-selection"],
    description: "Shoulder bag with wide strap and soft-structure silhouette.",
  },
  {
    slug: "mom-crossbody",
    name: "MOM CROSSBODY",
    tag: "SS26 Pre-collection",
    price: "€ 3,800",
    stockNote: "not",
    coverImage: img.bag1,
    cardImages: [img.bag1, img.bag6, img.bag4, img.bag2],
    closerLookImages: [img.bag6, img.bag4],
    colors: ["#7a1f1f", "#111", "#f1ece2", "#5a4a36", "#6b8aa8", "#c4a882"],
    filters: ["Spring Summer 2026 Pre-collection", "Tweed & Fabrics", "Yellow", "Gold-Tone"],
    sections: ["moms-bags", "all-selection"],
    description: "Crossbody with adjustable woven strap and front flap pocket.",
  },
];

async function seed() {
  await connectDB();
  console.log("Connected. Seeding RACÈLIA data…");

  await Product.deleteMany({});
  for (const p of products) {
    await Product.create({
      ...p,
      priceAmount: parsePrice(p.price),
      materials: "Refined pebble leather. Wipe with a soft, dry cloth.",
      closerLookMain: {
        image: img.editorial,
        title: "A Closer Look",
        text: "Refined pebble leather with a polished finish — casual meets dressy, designed for everyday elegance.",
      },
    });
  }
  console.log(`✓ ${products.length} products`);

  await Blog.deleteMany({});
  await Blog.insertMany([
    {
      blogKey: "blog-seed-1",
      slug: "boost-conversion-high-ticket",
      templateId: "product-spotlight",
      status: "published",
      isPublished: true,
      title: "How to boost conversion on high-ticket pieces",
      subtitle: "Practical tips for product pages and launch campaigns.",
      coverImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      sections: [
        {
          id: "blog-seed-1-s1",
          type: "text",
          content:
            "Practical tips for product pages, sizing guides, and retargeting campaigns that help customers commit to investment pieces.",
        },
      ],
      linkedProductIds: ["mini-flap-bag"],
      cta: { text: "Shop mini flap bag", productIds: ["mini-flap-bag"] },
      publishedAt: new Date("2026-05-28"),
    },
    {
      blogKey: "blog-seed-2",
      slug: "weekly-sales-recap-maxi-flap",
      templateId: "seasonal-campaign",
      status: "published",
      isPublished: true,
      title: "Weekly sales recap: maxi flap leads",
      coverImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80",
      sections: [
        {
          id: "blog-seed-2-s1",
          type: "text",
          content: "A breakdown of top sellers, margins, and inventory alerts from last week.",
        },
      ],
      linkedProductIds: ["racelia-maxi-flap"],
      cta: { text: "View maxi flap", productIds: ["racelia-maxi-flap"] },
      publishedAt: new Date("2026-05-22"),
    },
  ]);
  console.log("✓ blogs");

  await WebPic.deleteMany({});
  await WebPic.insertMany([
    {
      webPicKey: "webpic-seed-1",
      title: "Homepage hero — laptop",
      image: img.hero,
      device: "laptop",
      section: "hero",
      linksToProduct: false,
      order: 0,
    },
    {
      webPicKey: "webpic-seed-2",
      title: "Editorial — tablet",
      image: img.editorial,
      device: "tablet",
      section: "editorial",
      linksToProduct: false,
      order: 0,
    },
  ]);
  console.log("✓ web pics");

  const styleImages = [
    "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?w=900&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80",
  ];

  await StyleLook.deleteMany({});
  await StyleLook.insertMany([
    {
      lookKey: "style-seed-0",
      title: "Featured creator look",
      tag: "Featured",
      image: styleImages[0],
      products: [
        { entryKey: "style-seed-0-p-0", productSlug: "mini-flap-bag", image: img.bag1 },
        { entryKey: "style-seed-0-p-1", productSlug: "racelia-classic", image: img.bag2 },
      ],
      order: 0,
    },
    {
      lookKey: "style-seed-1",
      title: "Creator look 2",
      tag: "Live",
      image: styleImages[1],
      products: [
        { entryKey: "style-seed-1-p-0", productSlug: "mini-hobo-bag", image: img.bag3 },
        { entryKey: "style-seed-1-p-1", productSlug: "mini-evening-clutch", image: img.bag5 },
      ],
      order: 1,
    },
  ]);
  console.log("✓ style looks");

  await Review.deleteMany({});
  await Review.insertMany([
    {
      reviewKey: "pub-1",
      author: "Alex Gilles",
      product: "MINI FLAP BAG",
      productSlug: "mini-flap-bag",
      stars: 5,
      comment: "Beautiful craftsmanship. The leather quality exceeded my expectations.",
      reviewDate: "29 May 2026",
      source: "client",
      status: "published",
    },
    {
      reviewKey: "pending-seed-1",
      author: "Lina Moreau",
      product: "MOM TOTE",
      productSlug: "mom-tote",
      stars: 4,
      comment: "Spacious and elegant. Delivery took a few extra days but worth the wait.",
      reviewDate: "27 May 2026",
      source: "client",
      status: "pending",
    },
  ]);
  console.log("✓ reviews");

  const adminEmail = "alex@racelia.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      userKey: "user-1",
      name: "Alex Johnson",
      email: adminEmail,
      password: await bcrypt.hash("admin2026", 10),
      role: "admin",
      status: "active",
      points: 1250,
    });
    console.log("✓ admin user (alex@racelia.com / admin2026)");
  } else {
    console.log("✓ admin user already exists");
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
