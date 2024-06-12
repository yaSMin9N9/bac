import mongoose, { Schema } from "mongoose";

export interface StageType {
  name: string;
  title: string;
  service: {
    id: mongoose.Types.ObjectId;
    name: string;
  };
  order: number;
  status: boolean;
  description: string;
  canSkip: boolean;
  file: string;
}

export interface StageDocument extends StageType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const StageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    description: { type: String, required: true },
    file: { type: String, required: true },
    status: { type: Boolean, default: true },
    canSkip: { type: Boolean, default: false },
    service: {
      id: { type: Schema.Types.ObjectId, ref: "Service" },
      name: { type: String, ref: "Service" },
    },
  },
  { timestamps: true, versionKey: false }
);

const StageModel = mongoose.model<StageDocument>("Stage", StageSchema);

export default StageModel;
