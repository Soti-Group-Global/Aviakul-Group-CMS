import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";
import Expert from "@/models/NAO/Expert";
import mongoose from "mongoose";

// GET /api/nao/experts?limit=20&page=1
export async function GET(req) {
  console.log("👉 [GET /api/nao/experts] Request received");

  await connectDB();


  // Parse query parameters
  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  const pageParam = url.searchParams.get("page");

  // Default limit = 100 (to avoid returning thousands of docs accidentally)
  // Use limit=0 to get all documents (no limit)
  let limit = limitParam ? parseInt(limitParam, 10) : 100;
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  let query = Expert.find().sort({ createdAt: -1 });

  // Apply limit and skip only if limit > 0
  if (limit > 0) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const experts = await query;
  console.log(`📦 Experts fetched: ${experts.length}`);

  // Optional: return total count for pagination (useful for frontend)
  const total = limit > 0 ? await Expert.countDocuments() : experts.length;

  return Response.json({
    success: true,
    data: experts,
    pagination: limit > 0 ? { page, limit, total } : undefined,
  });
}
// POST /api/expert
export async function POST(req) {
  console.log("👉 [POST /api/expert] Request started");

  try {
    await connectDB();
    console.log("✅ DB connected");

    initGridFS();
    console.log("✅ GridFS initialized");

    const formData = await req.formData();
    console.log("📥 FormData received");

    const name = formData.get("name");
    const designation = formData.get("designation");
    const organization = formData.get("organization");
    const location = formData.get("location");
    const siteId = formData.get("siteId");
    const file = formData.get("profileFile");

    console.log("🧾 Parsed fields:", {
      name,
      designation,
      organization,
      location,
      siteId,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    });

    // Validation
    if (!name || !designation || !organization || !location || !siteId) {
      console.log("❌ Validation failed: Missing fields");
      return Response.json(
        { success: false, message: "All text fields and siteId are required" },
        { status: 400 },
      );
    }

    if (!file || file.size === 0) {
      console.log("❌ Validation failed: File missing or empty");
      return Response.json(
        { success: false, message: "Profile file is required" },
        { status: 400 },
      );
    }

    // if (!mongoose.Types.ObjectId.isValid(siteId)) {
    //   console.log("❌ Validation failed: Invalid siteId", siteId);
    //   return Response.json(
    //     { success: false, message: "Invalid siteId" },
    //     { status: 400 },
    //   );
    // }

    console.log("✅ Validation passed");

    // Upload file to GridFS
    const bytes = await file.arrayBuffer();
    console.log("📦 File converted to buffer");

    const buffer = Buffer.from(bytes);

    const bucket = getBucket();
    console.log("🪣 GridFS bucket ready");

    const uploadStream = bucket.openUploadStream(file.name, {
      contentType: file.type,
    });

    console.log("⬆️ Upload stream opened");

    const profileFileId = await new Promise((resolve, reject) => {
      uploadStream.on("finish", () => {
        console.log("✅ File uploaded to GridFS", uploadStream.id);
        resolve(uploadStream.id);
      });

      uploadStream.on("error", (err) => {
        console.error("❌ GridFS upload error:", err);
        reject(err);
      });

      uploadStream.end(buffer);
    });

    console.log("🧾 Creating expert document");

    const expert = await Expert.create({
      name,
      designation,
      organization,
      location,
      siteId,
      profileFileId,
    });

    console.log("✅ Expert created:", expert._id);

    return Response.json({ success: true, data: expert }, { status: 201 });
  } catch (error) {
    console.error("🔥 POST /api/expert ERROR:", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
