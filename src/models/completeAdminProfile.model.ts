import mongoose, { ObjectId } from "mongoose";

export interface CompleteAdminProfileType {
  adminId: string;
  image: string;
  cvURL: string;
  description: string;
}

export interface CompleteAdminProfileDocument
  extends CompleteAdminProfileType,
    mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const CompleteAdminProfileSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    image: { type: String, required: true },
    cvURL: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

const CompleteAdminProfileModel = mongoose.model<CompleteAdminProfileDocument>(
  "CompleteAdminProfile",
  CompleteAdminProfileSchema
);

export default CompleteAdminProfileModel;
