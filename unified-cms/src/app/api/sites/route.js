import connectDB from "@/lib/mongodb";
import Site from "@/models/Site";

//GET → Fetch all sites
export async function GET() {
  try {
    await connectDB();

    const sites = await Site.find().sort({ createdAt: -1 });

    return Response.json(
      { success: true, data: sites },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /sites error:", error);

    return Response.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

//  POST → Create new site
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const site = await Site.create(body);

    return Response.json(
      { success: true, data: site },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /sites error:", error);

    // Mongoose Validation Error
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (err) => err.message
      );

      return Response.json(
        { success: false, message: errors },
        { status: 400 }
      );
    }

    //Duplicate key error (if you add unique fields later)
    if (error.code === 11000) {
      return Response.json(
        { success: false, message: "Duplicate field value entered" },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}