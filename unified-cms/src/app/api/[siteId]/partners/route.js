import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";
import Partner from "@/models/NAO/Partner";
import mongoose from "mongoose";

import { corsHeaders } from "@/lib/cors";

const ORIGIN = "http://localhost:3001";

// GET /api/partner?siteId=...&category=...
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");
  const category = searchParams.get("category");

  const filter = {};
  if (siteId) filter.siteId = siteId;
  if (category) filter.category = category;

  const partners = await Partner.find(filter)
    // .populate("siteId", "name")
    .sort({ order: 1, createdAt: -1 });

  return new Response(JSON.stringify({ success: true, data: partners }), {
    headers: corsHeaders(ORIGIN),
  });
}

// POST /api/partner
export async function POST(req) {
  try {
    await connectDB();
    initGridFS();

    const formData = await req.formData();
    const name = formData.get("name");
    const category = formData.get("category");
    const siteId = formData.get("siteId");
    const order = formData.get("order");
    const file = formData.get("imageFile");

    // Validation
    if (!name || !category || !siteId) {
      return Response.json(
        { success: false, message: "Name, category, and siteId are required" },
        { status: 400 },
      );
    }
    if (!file || file.size === 0) {
      return Response.json(
        { success: false, message: "Image file is required" },
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
      "Academic Partners",
      "Industry Partners",
      "Government Partners",
      "Media Partners",
    ];
    if (!validCategories.includes(category)) {
      return Response.json(
        { success: false, message: "Invalid category" },
        { status: 400 },
      );
    }

    // Upload file to GridFS
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(file.name, {
      contentType: file.type,
    });

    const imageFileId = await new Promise((resolve, reject) => {
      uploadStream.on("finish", () => resolve(uploadStream.id));
      uploadStream.on("error", reject);
      uploadStream.end(buffer);
    });

    // Create partner document
    const partner = await Partner.create({
      name,
      category,
      siteId,
      imageFileId,
      order: order ? parseInt(order) : 0,
    });

    return Response.json({ success: true, data: partner }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
