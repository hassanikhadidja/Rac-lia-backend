const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!process.env.uri) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }

    cached.promise = mongoose.connect(process.env.uri).then((instance) => {
      console.log("MongoDB connected successfully");
      return instance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
