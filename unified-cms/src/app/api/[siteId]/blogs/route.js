
import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";
import Blog from "@/models/NAO/Blog";
import mongoose from "mongoose";

// GET /api/blog?siteId=...&status=...&sort=...
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sort") || "order"; // order, createdAt, etc.

  const filter = {};
  if (siteId) filter.siteId = siteId;
  if (status && ["draft", "published", "archived"].includes(status)) filter.status = status;

  let sortOptions = {};
  if (sortBy === "order") sortOptions = { order: 1, createdAt: -1 };
  else if (sortBy === "newest") sortOptions = { createdAt: -1 };
  else if (sortBy === "oldest") sortOptions = { createdAt: 1 };
  else sortOptions = { order: 1, createdAt: -1 };

  const blogs = await Blog.find(filter)
    .populate("siteId", "name")
    .sort(sortOptions);
  return Response.json({ success: true, data: blogs });
}

// POST /api/blog
export async function POST(req) {
  try {
    await connectDB();
    initGridFS();

    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description") || "";
    const siteId = formData.get("siteId");
    const status = formData.get("status") || "draft";
    const order = formData.get("order");
    const file = formData.get("imageFile"); // optional

    // Validation
    if (!title || !siteId) {
      return Response.json(
        { success: false, message: "Title and siteId are required" },
        { status: 400 }
      );
    }
    // if (!mongoose.Types.ObjectId.isValid(siteId)) {
    //   return Response.json(
    //     { success: false, message: "Invalid siteId" },
    //     { status: 400 }
    //   );
    // }
    if (status && !["draft", "published", "archived"].includes(status)) {
      return Response.json(
        { success: false, message: "Status must be draft, published, or archived" },
        { status: 400 }
      );
    }

    let imageFileId = null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(file.name, {
        contentType: file.type,
      });
      imageFileId = await new Promise((resolve, reject) => {
        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.on("error", reject);
        uploadStream.end(buffer);
      });
    }

    const blog = await Blog.create({
      title,
      description,
      siteId,
      status,
      order: order ? parseInt(order) : 0,
      imageFileId,
    });

    return Response.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}