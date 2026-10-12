import mongoose from "mongoose";

/** Allocate a monotonically increasing public blog ID using MongoDB's atomic counter. */
export async function nextBlogPublicId() {
  const db = mongoose.connection.db;
  const blogs = db.collection("blogs");
  const counters = db.collection("counters");

  // Keep the counter ahead of any IDs already present (including partially migrated data).
  const highest = await blogs.findOne(
    { publicId: { $type: "number" } },
    { sort: { publicId: -1 }, projection: { publicId: 1 } },
  );
  const floor = Number(highest?.publicId || 0);
  await counters.updateOne(
    { _id: "blogPublicId" },
    { $max: { seq: floor } },
    { upsert: true },
  );

  const result = await counters.findOneAndUpdate(
    { _id: "blogPublicId" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  // MongoDB driver versions differ on whether findOneAndUpdate returns the document directly or in .value.
  const counter = result?.value ?? result;
  return Number(counter.seq);
}

/** Backfill public IDs for older blog records when the CMS listing is loaded. */
export async function ensureBlogPublicIds(Blog, siteId) {
  const filter = { publicId: { $exists: false } };
  if (siteId) filter.siteId = siteId;
  const missing = await Blog.find(filter).sort({ createdAt: 1, _id: 1 }).select("_id").lean();

  for (const item of missing) {
    // Conditional update prevents two simultaneous requests from assigning two IDs to one blog.
    const publicId = await nextBlogPublicId();
    await Blog.updateOne(
      { _id: item._id, publicId: { $exists: false } },
      { $set: { publicId } },
    );
  }
}
