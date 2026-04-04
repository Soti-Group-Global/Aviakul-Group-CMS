import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";
import Expert from "@/models/NAO/Expert";
import mongoose from "mongoose";

// GET /api/expert
export async function GET() {
  console.log("👉 [GET /api/expert] Request received");

  await connectDB();
  console.log("✅ DB connected");

  const experts = await Expert.find()
    // .populate("siteId", "name")
    .sort({ createdAt: -1 });

  console.log(`📦 Experts fetched: ${experts.length}`);

  return Response.json({ success: true, data: experts });
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
