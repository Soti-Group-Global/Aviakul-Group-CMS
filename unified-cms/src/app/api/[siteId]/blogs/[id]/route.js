import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";
import Blog from "@/models/NAO/Blog";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// GET /api/blog/[id]
export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;

  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return Response.json(
  //     { success: false, message: "Invalid ID" },
  //     { status: 400 },
  //   );
  // }

  const blog = await Blog.findById(id).populate("siteId", "name");
  if (!blog) {
    return Response.json(
      { success: false, message: "Blog not found" },
      { status: 404 },
    );
  }

  return Response.json({ success: true, data: blog });
}

// PUT /api/blog/[id]
export async function PUT(req, { params }) {
  try {
    await connectDB();
    initGridFS();
    const { id } = await params;

    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   return Response.json(
    //     { success: false, message: "Invalid ID" },
    //     { status: 400 },
    //   );
    // }

    const formData = await req.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const siteId = formData.get("siteId");
    const status = formData.get("status");
    const order = formData.get("order");
    const file = formData.get("imageFile"); // optional

    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return Response.json(
        { success: false, message: "Blog not found" },
        { status: 404 },
      );
    }

    // // Validate fields if provided
    // if (siteId && !mongoose.Types.ObjectId.isValid(siteId)) {
    //   return Response.json(
    //     { success: false, message: "Invalid siteId" },
    //     { status: 400 },
    //   );
    // }
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

// DELETE /api/blog/[id]
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    initGridFS();
    const { id } = await params;

    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   return Response.json(
    //     { success: false, message: "Invalid ID" },
    //     { status: 400 },
    //   );
    // }

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
