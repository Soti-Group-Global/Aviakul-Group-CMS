import mongoose from "mongoose";

const HeaderBannerItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 240 },
    actionText: {
      type: String,
      default: "Check here →",
      trim: true,
      maxlength: 80,
    },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const HeaderBannerSchema = new mongoose.Schema(
  {
    siteId: { type: String, default: "nao", unique: true, index: true },
    enabled: { type: Boolean, default: true },
    items: { type: [HeaderBannerItemSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.NAOHeaderBanner ||
  mongoose.model("NAOHeaderBanner", HeaderBannerSchema);
