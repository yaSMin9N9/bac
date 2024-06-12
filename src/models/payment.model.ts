import mongoose, { ObjectId } from "mongoose";

export interface PaymentType {
  userId: ObjectId;
  adminId: ObjectId;
  status: "success" | "field" | "pending" | "initiated";
  price: number;
  type: "bank" | "stc" | "card";
  serviceType: "booking" | "design" | "arbitration";
  paymentId: string;
  fieldReason: string;
  serviceId: ObjectId;
  attachment: string;
}

export interface PaymentDocument extends PaymentType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    status: { type: String, required: true },
    type: { type: String, required: true },
    serviceType: { type: String, required: true },
    fieldReason: { type: String, default: "" },
    paymentId: { type: String, default: "" },
    price: { type: Number, required: true },
    attachment: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

const PaymentModel = mongoose.model<PaymentDocument>("Payment", PaymentSchema);

export default PaymentModel;
