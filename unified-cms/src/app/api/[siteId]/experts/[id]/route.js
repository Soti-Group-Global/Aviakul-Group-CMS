import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";
import Expert from "@/models/NAO/Expert";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// GET /api/expert/[id]
export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;

  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return Response.json(
  //     { success: false, message: "Invalid ID" },
  //     { status: 400 },
  //   );
  // }

  const expert = await Expert.findById(id).populate("siteId", "name");
  if (!expert) {
    return Response.json(
      { success: false, message: "Expert not found" },
      { status: 404 },
    );
  }

  return Response.json({ success: true, data: expert });
}

// PUT /api/expert/[id]
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
    const name = formData.get("name");
    const designation = formData.get("designation");
    const organization = formData.get("organization");
    const location = formData.get("location");
    const siteId = formData.get("siteId");
    const file = formData.get("profileFile"); // optional – if provided, replace image

    const existingExpert = await Expert.findById(id);
    if (!existingExpert) {
      return Response.json(
        { success: false, message: "Expert not found" },
        { status: 404 },
      );
    }

    // // Validate siteId if provided
    // if (siteId && !mongoose.Types.ObjectId.isValid(siteId)) {
    //   return Response.json(
    //     { success: false, message: "Invalid siteId" },
    //     { status: 400 },
    //   );
    // }

    let profileFileId = existingExpert.profileFileId;

    // If a new file is uploaded, replace the old one
    if (file && file.size > 0) {
      // Delete old file from GridFS
      if (existingExpert.profileFileId) {
        const bucket = getBucket();
        await bucket.delete(new ObjectId(existingExpert.profileFileId));
      }

      // Upload new file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(file.name, {
        contentType: file.type,
      });
      profileFileId = await new Promise((resolve, reject) => {
        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.on("error", reject);
        uploadStream.end(buffer);
      });
    }

    // Build update object (only fields that are provided)
    const updateData = {};
    if (name !== null) updateData.name = name;
    if (designation !== null) updateData.designation = designation;
    if (organization !== null) updateData.organization = organization;
    if (location !== null) updateData.location = location;
    if (siteId !== null) updateData.siteId = siteId;
    updateData.profileFileId = profileFileId;

    const updatedExpert = await Expert.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return Response.json({ success: true, data: updatedExpert });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/expert/[id]
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

    const expert = await Expert.findById(id);
    if (!expert) {
      return Response.json(
        { success: false, message: "Expert not found" },
        { status: 404 },
      );
    }

    // Delete GridFS file
    if (expert.profileFileId) {
      const bucket = getBucket();
      await bucket.delete(new ObjectId(expert.profileFileId));
    }

    // Delete database document
    await Expert.findByIdAndDelete(id);

    return Response.json({ success: true, message: "Expert deleted" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
