import connectDB from "@/lib/mongodb";
import { initGridFS, getBucket } from "@/lib/gridfs";

export async function POST(req) {
  try {
    await connectDB();
    initGridFS();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json(
        { success: false, message: "No file uploaded" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bucket = getBucket();

    const uploadStream = bucket.openUploadStream(file.name, {
      contentType: file.type,
    });

    uploadStream.end(buffer);

    return new Promise((resolve, reject) => {
      uploadStream.on("finish", () => {
        resolve(
          Response.json({
            success: true,
            fileId: uploadStream.id, 
          }),
        );
      });

      uploadStream.on("error", (err) => {
        reject(
          Response.json(
            { success: false, message: err.message },
            { status: 500 },
          ),
        );
      });
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
