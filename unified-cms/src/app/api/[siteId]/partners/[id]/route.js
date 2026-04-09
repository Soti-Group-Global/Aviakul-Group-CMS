import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";
import Partner from "@/models/NAO/Partner";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// GET /api/partner/[id]
export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;

  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return Response.json(
  //     { success: false, message: "Invalid ID" },
  //     { status: 400 },
  //   );
  // }

  const partner = await Partner.findById(id).populate("siteId", "name");
  if (!partner) {
    return Response.json(
      { success: false, message: "Partner not found" },
      { status: 404 },
    );
  }

  return Response.json({ success: true, data: partner });
}

// PUT /api/partner/[id]
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
    const category = formData.get("category");
    const siteId = formData.get("siteId");
    const order = formData.get("order");
    const file = formData.get("imageFile"); // optional

    const existingPartner = await Partner.findById(id);
    if (!existingPartner) {
      return Response.json(
        { success: false, message: "Partner not found" },
        { status: 404 },
      );
    }

    // Validate category if provided
    if (category) {
      const validCategories = [
        "Academic Partners",
        "Industry Partners",
        "Government Partners",
        "Media Partners",
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

    let imageFileId = existingPartner.imageFileId;

    // If a new file is uploaded, replace the old one
    if (file && file.size > 0) {
      // Delete old file from GridFS
      if (existingPartner.imageFileId) {
        const bucket = getBucket();
        await bucket.delete(new ObjectId(existingPartner.imageFileId));
      }

      // Upload new file
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

    // Build update object (only fields that are provided)
    const updateData = {};
    if (name !== null) updateData.name = name;
    if (category !== null) updateData.category = category;
    if (siteId !== null) updateData.siteId = siteId;
    if (order !== null) updateData.order = parseInt(order);
    updateData.imageFileId = imageFileId;

    const updatedPartner = await Partner.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return Response.json({ success: true, data: updatedPartner });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/partner/[id]
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

    const partner = await Partner.findById(id);
    if (!partner) {
      return Response.json(
        { success: false, message: "Partner not found" },
        { status: 404 },
      );
    }

    // Delete GridFS file
    if (partner.imageFileId) {
      const bucket = getBucket();
      await bucket.delete(new ObjectId(partner.imageFileId));
    }

    // Delete database document
    await Partner.findByIdAndDelete(id);

    return Response.json({ success: true, message: "Partner deleted" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
