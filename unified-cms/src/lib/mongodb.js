import mongoose from "mongoose";
import { seedAdmin } from "./seedAdmin";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

//  Fix global typing safely
global.mongoose = global.mongoose || { conn: null, promise: null };

let cached = global.mongoose;

//  Add flag
let isSeeded = false;

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  const mongooseInstance = await cached.promise;

  if (!cached.conn) {
    console.log("✅ MongoDB connected");
  }

  //  Seed only once
  if (!isSeeded) {
    await seedAdmin();
    isSeeded = true;
  }

  cached.conn = mongooseInstance;
  return cached.conn;
}

export default connectDB;
