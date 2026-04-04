import connectDB from "@/lib/mongodb";
import Site from "@/models/Site";
import mongoose from "mongoose";

//GET single site
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    const site = await Site.findById(id);

    if (!site) {
      return Response.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, data: site },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET site error:", error);

    return Response.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE site
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await req.json();

    const site = await Site.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!site) {
      return Response.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, data: site },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT site error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (err) => err.message
      );

      return Response.json(
        { success: false, message: errors },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE site
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const site = await Site.findByIdAndDelete(id);

    if (!site) {
      return Response.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Site deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE site error:", error);

    return Response.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}