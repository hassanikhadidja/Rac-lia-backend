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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`RACÈLIA backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }
};

startServer();
