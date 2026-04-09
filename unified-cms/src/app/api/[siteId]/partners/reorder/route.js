import connectDB from "@/lib/mongodb";
import Partner from "@/models/NAO/Partner";
import mongoose from "mongoose";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { siteId } = await params; // from URL: /api/[siteId]/partners/reorder
    const { category, updates } = await req.json();

    // Validate input
    if (!siteId || !category || !updates || !Array.isArray(updates)) {
      return Response.json(
        {
          success: false,
          message: "siteId, category, and updates array are required",
        },
        { status: 400 },
      );
    }

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

    // Build bulk update operations
    const bulkOps = updates.map(({ _id, order }) => ({
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(_id),
          siteId: siteId,
          category: category,
        },
        update: { $set: { order } },
      },
    }));

    if (bulkOps.length === 0) {
      return Response.json({ success: true, message: "No updates to apply" });
    }

    const result = await Partner.bulkWrite(bulkOps);

    return Response.json({
      success: true,
      message: `Updated ${result.modifiedCount} partners`,
    });
  } catch (error) {
    console.error("Reorder error:", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
