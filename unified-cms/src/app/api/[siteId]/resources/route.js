import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";
import Resource from "@/models/NAO/Resource";
import mongoose from "mongoose";

// GET /api/resource?siteId=...&category=...
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");
  const category = searchParams.get("category");

  const filter = {};
//   && mongoose.Types.ObjectId.isValid(siteId)
  if (siteId ) filter.siteId = siteId;
  if (category) filter.category = category;

  const resources = await Resource.find(filter)
    .populate("siteId", "name")
    .sort({ order: 1, createdAt: -1 });
  return Response.json({ success: true, data: resources });
}

// POST /api/resource
export async function POST(req) {
  try {
    await connectDB();
    initGridFS();

    const formData = await req.formData();
    const title = formData.get("title");
    const category = formData.get("category");
    const siteId = formData.get("siteId");
    // const status = formData.get("status") || "TBD";
    const order = formData.get("order");
    const file = formData.get("file"); // optional

    // Validation
    if (!title || !category || !siteId) {
      return Response.json(
        { success: false, message: "Title, category, and siteId are required" },
        { status: 400 },
      );
    }
    // if (!mongoose.Types.ObjectId.isValid(siteId)) {
    //   return Response.json(
    //     { success: false, message: "Invalid siteId" },
    //     { status: 400 },
    //   );
    // }

    const validCategories = [
      "For Schools",
      "For Students",
      "For Coordinators",
      "Media Resources",
    ];
    if (!validCategories.includes(category)) {
      return Response.json(
        { success: false, message: "Invalid category" },
        { status: 400 },
      );
    }

    // if (status && !["Available", "TBD"].includes(status)) {
    //   return Response.json(
    //     { success: false, message: "Status must be 'Available' or 'TBD'" },
    //     { status: 400 },
    //   );
    // }

    let fileId = null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(file.name, {
        contentType: file.type,
      });
      fileId = await new Promise((resolve, reject) => {
        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.on("error", reject);
        uploadStream.end(buffer);
      });
    }

    // If status is "Available" but no file, we could throw an error (optional)
    // if (!fileId) {
    //   return Response.json(
    //     {
    //       success: false,
    //       message: "When status is 'Available', a file is required",
    //     },
    //     { status: 400 },
    //   );
    // }

    const resource = await Resource.create({
      title,
      category,
      siteId,
      // status,
      order: order ? parseInt(order) : 0,
      fileId,
    });

    return Response.json({ success: true, data: resource }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
