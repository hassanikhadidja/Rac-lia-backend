const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const connectDB = require("./config/connectDB");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const blogRoutes = require("./routes/blogRoutes");
const heroRoutes = require("./routes/heroRoutes");
const webPicRoutes = require("./routes/webPicRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const styleLookRoutes = require("./routes/styleLookRoutes");

const cors = require("cors");
const multer = require("multer");

module.exports = app;

const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(",").map((value) => value.trim())
    : true,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(503).json({ msg: error.message || "Database unavailable" });
  }
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "racelia-backend" });
});

app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/order", orderRoutes);
app.use("/blog", blogRoutes);
app.use("/hero", heroRoutes);
app.use("/webpic", webPicRoutes);
app.use("/review", reviewRoutes);
app.use("/style", styleLookRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ msg: `Upload error: ${err.message}` });
  }
  if (err) {
    console.error("RACÈLIA backend error:", err.message);
    return res.status(500).json({ msg: err.message || "Server error" });
  }
  return next();
});

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`RACÈLIA backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}
