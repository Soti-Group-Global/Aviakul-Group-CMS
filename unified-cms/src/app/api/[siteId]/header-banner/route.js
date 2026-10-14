import connectDB from "@/lib/mongodb";
import HeaderBanner from "@/models/NAO/HeaderBanner";

const normalizeItems = (items) => {
  if (!Array.isArray(items)) return null;
  if (items.length > 3)
    throw new Error("You can configure up to 3 banner items.");
  return items.map((item, index) => {
    const text = String(item?.text || "").trim();
    const actionText = String(item?.actionText || "Check here →").trim();
    const url = String(item?.url || "").trim();
    if (!text || !actionText || !url) {
      throw new Error(
        "Each banner item needs announcement text, action text, and a URL.",
      );
    }
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      throw new Error("URLs must start with http://, https://, or /.");
    }
    return {
      text,
      actionText,
      url,
      enabled: item.enabled !== false,
      order: index,
    };
  });
};

export async function GET(_req, { params }) {
  try {
    const { siteId } = await params;
    if (!["nao", "cso"].includes(siteId)) {
      return Response.json(
        { success: false, message: "Unsupported site." },
        { status: 404 },
      );
    }
    await connectDB();
    const doc = await HeaderBanner.findOne({ siteId }).lean();
    return Response.json({
      success: true,
      enabled: doc?.enabled !== false,
      data: doc?.items || [],
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { siteId } = await params;
    if (!["nao", "cso"].includes(siteId)) {
      return Response.json(
        { success: false, message: "Unsupported site." },
        { status: 404 },
      );
    }
    await connectDB();
    const body = await req.json();
    const items = normalizeItems(body.items);
    if (!items) {
      return Response.json(
        { success: false, message: "items must be an array." },
        { status: 400 },
      );
    }
    const enabled = body.enabled !== false;
    const doc = await HeaderBanner.findOneAndUpdate(
      { siteId },
      { $set: { items, enabled } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();
    return Response.json({
      success: true,
      enabled: doc.enabled !== false,
      data: doc.items,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}
