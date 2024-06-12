import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface UserOtpType {
  userId: UserDocument["_id"];
  otp: string;
  expiresAt: Date;
}

export interface UserOtpDocument extends UserOtpType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const userOtpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false }
);

const UserOtpModel = mongoose.model<UserOtpDocument>("UserOtp", userOtpSchema);

export default UserOtpModel;
