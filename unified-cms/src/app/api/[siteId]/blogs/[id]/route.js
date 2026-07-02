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
  let imageFilenames = [];

  if (blog.imageFileId) {
    const file = await mongoose.connection.db
      .collection("fs.files")
      .findOne({ _id: blog.imageFileId });

    filename = file?.filename || null;
  }

  // Resolve filenames for multiple images
  if (blog.imageFileIds && blog.imageFileIds.length > 0) {
    const filesCollection = mongoose.connection.db.collection("fs.files");
    const files = await filesCollection
      .find({ _id: { $in: blog.imageFileIds } })
      .toArray();
    imageFilenames = blog.imageFileIds.map((fid) => {
      const f = files.find((file) => file._id.equals(fid));
      return f?.filename || null;
    });
  }

  return Response.json({
    success: true,
    data: {
      ...blog._doc,
      imageFilename: filename,
      imageFilenames,
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
    const section = formData.get("section");
    const order = formData.get("order");
    const file = formData.get("imageFile"); // legacy single file
    const imageFiles = formData.getAll("imageFiles"); // multiple new images
    const existingImageIds = formData.get("existingImageIds"); // JSON string of IDs to keep
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
    let imageFileIds = existingBlog.imageFileIds || [];

    // Handle multi-image update
    if (existingImageIds !== null) {
      // Parse existing image IDs the user wants to keep
      let idsToKeep = [];
      try {
        idsToKeep = existingImageIds ? JSON.parse(existingImageIds) : [];
      } catch (e) {
        idsToKeep = [];
      }

      // Find images that need to be deleted (ones that were removed by user)
      const oldIds = (existingBlog.imageFileIds || []).map((id) => id.toString());
      const idsToDelete = oldIds.filter((id) => !idsToKeep.includes(id));

      // Delete removed images from GridFS
      if (idsToDelete.length > 0) {
        const bucket = getBucket();
        for (const delId of idsToDelete) {
          try {
            await bucket.delete(new ObjectId(delId));
          } catch (e) {
            console.warn("Failed to delete GridFS file:", delId, e.message);
          }
        }
      }

      // Start with images being kept (in order)
      imageFileIds = idsToKeep.map((id) => new ObjectId(id));

      // Upload new images and append them
      if (imageFiles && imageFiles.length > 0) {
        const bucket = getBucket();
        for (const imgFile of imageFiles) {
          if (imgFile && imgFile.size > 0) {
            const bytes = await imgFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uploadStream = bucket.openUploadStream(imgFile.name, {
              contentType: imgFile.type,
            });
            const newFileId = await new Promise((resolve, reject) => {
              uploadStream.on("finish", () => resolve(uploadStream.id));
              uploadStream.on("error", reject);
              uploadStream.end(buffer);
            });
            imageFileIds.push(newFileId);
          }
        }
      }

      // Set primary image for backward compatibility
      imageFileId = imageFileIds.length > 0 ? imageFileIds[0] : null;
    } else {
      // Legacy single file handling (backward compat)
      if (file && file.size > 0) {
        // Delete old image if exists
        if (existingBlog.imageFileId) {
          const bucket = getBucket();
          try {
            await bucket.delete(new ObjectId(existingBlog.imageFileId));
          } catch (e) {
            console.warn("Failed to delete old image:", e.message);
          }
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
        imageFileIds = [imageFileId];
      } else if (file && file.size === 0) {
        // User explicitly wants to remove the image
        if (existingBlog.imageFileId) {
          const bucket = getBucket();
          try {
            await bucket.delete(new ObjectId(existingBlog.imageFileId));
          } catch (e) {
            console.warn("Failed to delete old image:", e.message);
          }
        }
        imageFileId = null;
        imageFileIds = [];
      }
    }

    const updateData = {};
    if (title !== null) updateData.title = title;
    if (content !== null) updateData.content = content;
    if (siteId !== null) updateData.siteId = siteId;
    if (status !== null) updateData.status = status;
    if (section !== null) updateData.section = section;
    if (order !== null) updateData.order = parseInt(order);
    updateData.imageFileId = imageFileId;
    updateData.imageFileIds = imageFileIds;
    updateData.tags = tags; // always update tags (empty array clears them)

    // Allow setting a custom published date
    const publishedDate = formData.get("publishedDate");
    if (publishedDate !== null) {
      if (publishedDate === "" || publishedDate === "null") {
        updateData.publishedDate = null;
      } else {
        const parsedDate = new Date(publishedDate);
        if (!isNaN(parsedDate.getTime())) {
          updateData.publishedDate = parsedDate;
        }
      }
    }

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

    // Delete all associated GridFS images
    const bucket = getBucket();
    const allImageIds = new Set();

    if (blog.imageFileId) {
      allImageIds.add(blog.imageFileId.toString());
    }
    if (blog.imageFileIds && blog.imageFileIds.length > 0) {
      blog.imageFileIds.forEach((fid) => allImageIds.add(fid.toString()));
    }

    for (const fid of allImageIds) {
      try {
        await bucket.delete(new ObjectId(fid));
      } catch (e) {
        console.warn("Failed to delete GridFS file:", fid, e.message);
      }
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
