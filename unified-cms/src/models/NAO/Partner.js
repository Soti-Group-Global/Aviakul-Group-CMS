import mongoose from "mongoose";

const PartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Academic Partners",
        "Industry Partners",
        "Government Partners",
        "Media Partners",
      ],
    },
    imageFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "fs.files", // GridFS reference
      required: true,
    },
    siteId: {
      type: String,
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Site",
      // required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Indexes
PartnerSchema.index({ siteId: 1, category: 1 });
PartnerSchema.index({ order: 1 });

const Partner =
  mongoose.models.Partner || mongoose.model("Partner", PartnerSchema);

export default Partner;
