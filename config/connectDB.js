const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (!process.env.uri) {
            throw new Error("MongoDB URI is not defined in environment variables");
        }

        await mongoose.connect(process.env.uri);
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        throw error;
    }
};

module.exports = connectDB;