import mongoose, { Schema } from "mongoose";

export interface ServiceType {
  name: string;
  price: number;
  arbitrationPrice: number;
  designPrice: number;
  image: string;
  status: boolean;
  hasVideos: boolean;
  advisors: {
    _id: mongoose.Types.ObjectId;
    name: string;
    image: string;
  }[];
}

export interface ServiceDocument extends ServiceType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    arbitrationPrice: { type: Number, required: true },
    designPrice: { type: Number, required: true },
    image: { type: String, required: true },
    hasVideos: { type: Boolean, default: false },
    status: { type: Boolean, default: false },
    advisors: [
      {
        id: { type: Schema.Types.ObjectId, ref: "Admin" },
        name: { type: String, default: "" },
        image: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const ServiceModel = mongoose.model<ServiceDocument>("Service", ServiceSchema);

export default ServiceModel;
