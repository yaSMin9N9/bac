import mongoose from "mongoose";
import { AdminDocument } from "./admin.model";

export interface AdminOtpType {
  adminId: AdminDocument["_id"];
  otp: string;
  expiresAt: Date;
}

export interface AdminOtpDocument extends AdminOtpType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const adminOtpSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false }
);

const AdminOtpModel = mongoose.model<AdminOtpDocument>(
  "AdminOtp",
  adminOtpSchema
);

export default AdminOtpModel;
