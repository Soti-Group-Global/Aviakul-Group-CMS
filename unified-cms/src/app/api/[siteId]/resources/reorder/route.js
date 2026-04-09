import connectDB from "@/lib/mongodb";
import Resource from "@/models/NAO/Resource";
import mongoose from "mongoose";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { siteId } = await params;
    const { category, updates } = await req.json();

    if (!siteId || !category || !updates || !Array.isArray(updates)) {
      return Response.json(
        {
          success: false,
          message: "siteId, category, and updates array required",
        },
        { status: 400 },
      );
    }

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

    const bulkOps = updates.map(({ _id, order }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(_id), siteId, category },
        update: { $set: { order } },
      },
    }));

    const result = await Resource.bulkWrite(bulkOps);
    return Response.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
