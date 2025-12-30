import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Please add your MongoDB URI to .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { dbName: "ticket_system" })
      .then((mongoose) => {
        console.log("📦 MongoDB Connected");
        return mongoose;
      })
      .catch((err) => console.log("MongoDB Error:", err));
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
