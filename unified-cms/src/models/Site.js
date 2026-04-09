import mongoose from "mongoose";

const SiteSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: [true, "Site name is required"],
    trim: true,
  },
  url: {
    type: String,
    required: [true, "URL is required"],
    match: [
      /^https?:\/\/.+/,
      "Please enter a valid URL (starting with http:// or https://)",
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Site = mongoose.models.Site || mongoose.model("Site", SiteSchema);

export default Site;
