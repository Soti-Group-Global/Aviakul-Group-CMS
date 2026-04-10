import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";
import Blog from "@/models/NAO/Blog";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// Helper to parse tags from FormData (same as above)
function parseTags(formData) {
  const tagsString = formData.get("tags");
  if (tagsString && typeof tagsString === "string") {
    return tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  const tagsArray = formData.getAll("tags[]");
  if (tagsArray && tagsArray.length) {
    return tagsArray.filter((t) => t && t.trim()).map((t) => t.trim());
  }
  return [];
}

// GET /api/nao/blogs/[id]
export async function GET(req, { params }) {
  await connectDB();

  const { id } = await params;

  const blog = await Blog.findById(id);

  if (!blog) {
    return Response.json(
      { success: false, message: "Blog not found" },
      { status: 404 },
    );
  }

  let filename = null;

  if (blog.imageFileId) {
    const file = await mongoose.connection.db
      .collection("fs.files")
      .findOne({ _id: blog.imageFileId });

    filename = file?.filename || null;
  }

  return Response.json({
    success: true,
    data: {
      ...blog._doc,
      imageFilename: filename,
    },
  });
}

// PUT /api/nao/blog/[id]
export async function PUT(req, { params }) {
  try {
    await connectDB();
    initGridFS();
    const { id } = await params;

    const formData = await req.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const siteId = formData.get("siteId");
    const status = formData.get("status");
    const order = formData.get("order");
    const file = formData.get("imageFile");
    const tags = parseTags(formData);

    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return Response.json(
        { success: false, message: "Blog not found" },
        { status: 404 },
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

    let imageFileId = existingBlog.imageFileId;

    // Handle file update
    if (file && file.size > 0) {
      // Delete old image if exists
      if (existingBlog.imageFileId) {
        const bucket = getBucket();
        await bucket.delete(new ObjectId(existingBlog.imageFileId));
      }
      // Upload new image
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
    } else if (file && file.size === 0) {
      // User explicitly wants to remove the image
      if (existingBlog.imageFileId) {
        const bucket = getBucket();
        await bucket.delete(new ObjectId(existingBlog.imageFileId));
      }
      imageFileId = null;
    }

    const updateData = {};
    if (title !== null) updateData.title = title;
    if (content !== null) updateData.content = content;
    if (siteId !== null) updateData.siteId = siteId;
    if (status !== null) updateData.status = status;
    if (order !== null) updateData.order = parseInt(order);
    updateData.imageFileId = imageFileId;
    if (tags.length) updateData.tags = tags; // only update if tags were sent

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return Response.json({ success: true, data: updatedBlog });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/nao/blog/[id]
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    initGridFS();
    const { id } = await params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return Response.json(
        { success: false, message: "Blog not found" },
        { status: 404 },
      );
    }

    // Delete associated GridFS image if exists
    if (blog.imageFileId) {
      const bucket = getBucket();
      await bucket.delete(new ObjectId(blog.imageFileId));
    }

    await Blog.findByIdAndDelete(id);

    return Response.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
