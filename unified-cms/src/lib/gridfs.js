import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let bucket;

export function initGridFS() {
  const conn = mongoose.connection;

  if (bucket) return bucket;

  bucket = new GridFSBucket(conn.db, {
    bucketName: "fs",
  });

  return bucket;
}

export function getBucket() {
  if (!bucket) throw new Error("GridFS not initialized");
  return bucket;
}
