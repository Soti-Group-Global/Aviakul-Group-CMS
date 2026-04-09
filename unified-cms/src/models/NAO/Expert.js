import mongoose from "mongoose";

const ExpertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    profileFileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "fs.files", // GridFS file reference
    },
    siteId: {
      type: String,
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Site",
      // required: true,
    },
  },
  { timestamps: true },
);

const Expert = mongoose.models.Expert || mongoose.model("Expert", ExpertSchema);

export default Expert;
