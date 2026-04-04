import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    imageFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "fs.files", // GridFS reference
    },
    siteId: {
      type: String
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Site",
      // required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Virtuals
BlogSchema.virtual("titleText").get(function () {
  return this.title || "";
});

BlogSchema.virtual("descriptionText").get(function () {
  return this.description || "";
});

// Indexes
BlogSchema.index({ siteId: 1 });
BlogSchema.index({ status: 1 });
BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ imageFileId: 1 });
BlogSchema.index({ order: 1 });

const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

export default Blog;
