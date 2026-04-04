import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();
    initGridFS();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response("Invalid file ID", { status: 400 });
    }

    const bucket = getBucket();
    const stream = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));

    // Get file metadata to set correct Content-Type
    const files = await bucket
      .find({ _id: new mongoose.Types.ObjectId(id) })
      .toArray();
    const file = files[0];
    if (!file) {
      return new Response("File not found", { status: 404 });
    }

    return new Response(stream, {
      headers: {
        "Content-Type": file.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${file.filename}"`,
      },
    });
  } catch (error) {
    return new Response("File not found", { status: 404 });
  }
}
