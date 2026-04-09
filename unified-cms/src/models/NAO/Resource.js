import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "For Schools",
        "For Students",
        "For Coordinators",
        "Media Resources",
      ],
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "fs.files", // GridFS reference
      default: null,
    },
    // status: {
    //   type: String,
    //   enum: ["Available", "TBD"],
    //   default: "TBD",
    // },
    order: {
      type: Number,
      default: 0,
    },
    siteId: {
      type: String
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Site",
      // required: true,
    },
  },
  { timestamps: true },
);

// Index
ResourceSchema.index({ category: 1, order: 1 });

const Resource =
  mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);

export default Resource;
