import mongoose from "mongoose";

export interface GuidanceType {
  guidance: string;
  stage: { id: mongoose.Types.ObjectId; name: string };
}

export interface GuidanceDocument extends GuidanceType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const GuidanceSchema = new mongoose.Schema(
  {
    guidance: { type: String, required: true },
    stage: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Stage" },
      name: { type: mongoose.Schema.Types.String, ref: "Stage" },
    },
  },
  { timestamps: true, versionKey: false }
);

const GuidanceModel = mongoose.model<GuidanceDocument>(
  "Guidance",
  GuidanceSchema
);

export default GuidanceModel;
