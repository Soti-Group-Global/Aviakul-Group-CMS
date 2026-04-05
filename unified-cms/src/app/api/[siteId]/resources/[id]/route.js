import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";
import Resource from "@/models/NAO/Resource";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// GET /api/resource/[id]
export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return Response.json(
//       { success: false, message: "Invalid ID" },
//       { status: 400 },
//     );
//   }

  const resource = await Resource.findById(id).populate("siteId", "name");
  if (!resource) {
    return Response.json(
      { success: false, message: "Resource not found" },
      { status: 404 },
    );
  }

  return Response.json({ success: true, data: resource });
}

// PUT /api/resource/[id]
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
    const category = formData.get("category");
    const siteId = formData.get("siteId");
    // const status = formData.get("status");
    const order = formData.get("order");
    const file = formData.get("file"); // optional

    const existingResource = await Resource.findById(id);
    if (!existingResource) {
      return Response.json(
        { success: false, message: "Resource not found" },
        { status: 404 },
      );
    }

    // Validate category if provided
    if (category) {
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
    }

    // if (siteId && !mongoose.Types.ObjectId.isValid(siteId)) {
    //   return Response.json(
    //     { success: false, message: "Invalid siteId" },
    //     { status: 400 },
    //   );
    // }

    // if (status && !["Available", "TBD"].includes(status)) {
    //   return Response.json(
    //     { success: false, message: "Status must be 'Available' or 'TBD'" },
    //     { status: 400 },
    //   );
    // }

    let fileId = existingResource.fileId;

    // Handle file update
    if (file && file.size > 0) {
      // Delete old file if exists
      if (existingResource.fileId) {
        const bucket = getBucket();
        await bucket.delete(new ObjectId(existingResource.fileId));
      }
      // Upload new file
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
    } else if (file && file.size === 0) {
      // If user explicitly wants to remove file but status is Available, reject
      return Response.json(
        {
          success: false,
          message: "Cannot remove file when status is 'Available'",
        },
        { status: 400 },
      );
    }

    // If status is "Available" but no fileId (and no new file provided), reject
    // const finalStatus = status || existingResource.status;
    // if (finalStatus === "Available" && !fileId) {
    //   return Response.json(
    //     {
    //       success: false,
    //       message: "When status is 'Available', a file is required",
    //     },
    //     { status: 400 },
    //   );
    // }

    const updateData = {};
    if (title !== null) updateData.title = title;
    if (category !== null) updateData.category = category;
    if (siteId !== null) updateData.siteId = siteId;
    // if (status !== null) updateData.status = status;
    if (order !== null) updateData.order = parseInt(order);
    updateData.fileId = fileId;

    const updatedResource = await Resource.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return Response.json({ success: true, data: updatedResource });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/resource/[id]
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

    const resource = await Resource.findById(id);
    if (!resource) {
      return Response.json(
        { success: false, message: "Resource not found" },
        { status: 404 },
      );
    }

    // Delete associated GridFS file if exists
    if (resource.fileId) {
      const bucket = getBucket();
      await bucket.delete(new ObjectId(resource.fileId));
    }

    await Resource.findByIdAndDelete(id);

    return Response.json({ success: true, message: "Resource deleted" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
