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

// GET /api/nao/blogs?siteId=...&statusFilter=...&sort=...&searchTerm=...&tagFilter=...

export async function GET(req, { params }) {
  await connectDB();

  const { siteId } = await params;

  const { searchParams } = new URL(req.url);

  const statusFilter = searchParams.get("statusFilter");
  const sortBy = searchParams.get("sort") || "order";
  const searchTerm = searchParams.get("searchTerm");
  const tagFilter = searchParams.get("tagFilter");
  const sectionFilter = searchParams.get("sectionFilter");

  const filter = {};

  // Site filter
  if (siteId) filter.siteId = siteId;

  // Status filter
  if (
    statusFilter &&
    ["draft", "published", "archived"].includes(statusFilter)
  ) {
    filter.status = statusFilter;
  }

  // Section filter
  if (sectionFilter && ["news", "events", "stories"].includes(sectionFilter)) {
    // Also match blogs without a section field (legacy blogs default to "news")
    if (sectionFilter === "news") {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [{ section: "news" }, { section: { $exists: false } }, { section: null }],
      });
    } else {
      filter.section = sectionFilter;
    }
  }

  // tag filter
  if (tagFilter) {
    const tagsArray = tagFilter.split(",").map((t) => t.trim());
    filter.tags = { $in: tagsArray };
  }

  // Search (title + content)
  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { content: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Sorting
  let sortOptions = {};
  if (sortBy === "order") sortOptions = { order: 1, createdAt: -1 };
  else if (sortBy === "newest") sortOptions = { createdAt: -1 };
  else if (sortBy === "oldest") sortOptions = { createdAt: 1 };
  else sortOptions = { order: 1, createdAt: -1 };

  const blogs = await Blog.find(filter).sort(sortOptions);

  const filesCollection = mongoose.connection.db.collection("fs.files");

  const blogsWithImages = await Promise.all(
    blogs.map(async (blog) => {
      let filename = null;
      let imageFilenames = [];

      if (blog.imageFileId) {
        const file = await filesCollection.findOne({
          _id: blog.imageFileId,
        });

        filename = file?.filename || null;
      }

      // Resolve filenames for multiple images
      if (blog.imageFileIds && blog.imageFileIds.length > 0) {
        const files = await filesCollection
          .find({ _id: { $in: blog.imageFileIds } })
          .toArray();
        // Maintain order matching imageFileIds
        imageFilenames = blog.imageFileIds.map((fid) => {
          const f = files.find((file) => file._id.equals(fid));
          return f?.filename || null;
        });
      }

      return {
        ...blog._doc,
        imageFilename: filename,
        imageFilenames,
      };
    }),
  );

  return Response.json({
    success: true,
    data: blogsWithImages,
  });
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
    const section = formData.get("section") || "news";
    const order = formData.get("order");
    const file = formData.get("imageFile"); // optional single image (legacy)
    const imageFiles = formData.getAll("imageFiles"); // multiple images
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
    let imageFileIds = [];

    // Handle multiple image uploads
    if (imageFiles && imageFiles.length > 0) {
      const bucket = getBucket();
      for (const imgFile of imageFiles) {
        if (imgFile && imgFile.size > 0) {
          const bytes = await imgFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const uploadStream = bucket.openUploadStream(imgFile.name, {
            contentType: imgFile.type,
          });
          const fileId = await new Promise((resolve, reject) => {
            uploadStream.on("finish", () => resolve(uploadStream.id));
            uploadStream.on("error", reject);
            uploadStream.end(buffer);
          });
          imageFileIds.push(fileId);
        }
      }
      // Set the first image as the primary/featured image for backward compatibility
      if (imageFileIds.length > 0) {
        imageFileId = imageFileIds[0];
      }
    } else if (file && file.size > 0) {
      // Legacy single file upload
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
    }

    // publishedDate: set to now if publishing, otherwise null
    const publishedDate = status === "published" ? new Date() : null;

    const blog = await Blog.create({
      title,
      content,
      siteId,
      status,
      section,
      order: order ? parseInt(order) : 0,
      imageFileId,
      imageFileIds,
      tags,
      publishedDate,
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
