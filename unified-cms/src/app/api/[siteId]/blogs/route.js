import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";
import Blog from "@/models/NAO/Blog";
import mongoose from "mongoose";

// Helper to parse tags from FormData
function parseTags(formData) {
  // Method 1: send as comma-separated string e.g. "tag1,tag2"
  const tagsString = formData.get("tags");
  if (tagsString && typeof tagsString === "string") {
    return tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  // Method 2: send as repeated fields tags[]=tag1&tags[]=tag2
  const tagsArray = formData.getAll("tags[]");
  if (tagsArray && tagsArray.length) {
    return tagsArray.filter((t) => t && t.trim()).map((t) => t.trim());
  }
  return [];
}

// GET /api/nao/blogs?siteId=...&status=...&sort=...
export async function GET(req,{params}) {
  await connectDB();
  
  const {siteId} = await params

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sort") || "order";
  const tags = searchParams.get("tags")

  const filter = {};
  if (siteId) filter.siteId = siteId;
  if (status && ["draft", "published", "archived"].includes(status))
    filter.status = status;
 if (tags) {
  const tagsArray = tags.split(",").map(t => t.trim());
  filter.tags = { $in: tagsArray };
}

  let sortOptions = {};
  if (sortBy === "order") sortOptions = { order: 1, createdAt: -1 };
  else if (sortBy === "newest") sortOptions = { createdAt: -1 };
  else if (sortBy === "oldest") sortOptions = { createdAt: 1 };
  else sortOptions = { order: 1, createdAt: -1 };

  const blogs = await Blog.find(filter).sort(sortOptions);
  return Response.json({ success: true, data: blogs });
}

// POST /api/nao/blogs
export async function POST(req) {
  try {
    await connectDB();
    initGridFS();

    const formData = await req.formData();
    const title = formData.get("title");
    const content = formData.get("content") || "";
    const siteId = formData.get("siteId");
    const status = formData.get("status") || "draft";
    const order = formData.get("order");
    const file = formData.get("imageFile"); // optional
    const tags = parseTags(formData);

    // Validation
    if (!title || !siteId) {
      return Response.json(
        { success: false, message: "Title and siteId are required" },
        { status: 400 },
      );
    }
    if (status && !["draft", "published", "archived"].includes(status)) {
      return Response.json(
        {
          success: false,
          message: "Status must be draft, published, or archived",
        },
        { status: 400 },
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
      content,
      siteId,
      status,
      order: order ? parseInt(order) : 0,
      imageFileId,
      tags,
    });

    return Response.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
