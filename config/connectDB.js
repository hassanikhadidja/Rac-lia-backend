const mongoose = require("mongoose");

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!process.env.uri) {
        throw new Error("MongoDB URI is not defined in environment variables");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.uri).then((mongooseInstance) => {
            console.log("✅ MongoDB Connected Successfully");
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error("❌ MongoDB Connection Error:", error.message);
        throw error;
    }
};

module.exports = connectDB;