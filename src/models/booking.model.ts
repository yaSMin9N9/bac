import mongoose, { ObjectId } from "mongoose";

export interface BookingType {
userId: ObjectId;
  advisorId: ObjectId;
  designerId: ObjectId;
  arbitratorId: ObjectId;
  serviceId: ObjectId;
  conversationId: ObjectId;
  arbitrationConversationId: ObjectId;
  designConversationId: ObjectId;
  status:
    | "pending"
    | "inProgress"
    | "endAdvisor"
    | "arbitration"
    | "arbitrationPending"
    | "endArbitration"
    | "design"
    | "designPending"
    | "completed";
  currentStage: ObjectId;
  files: string[];
  finalPdfFile: string;
  stages: {
    _id: mongoose.Types.ObjectId;
    order: number;
  }[];
}

export interface BookingDocument extends BookingType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    advisorId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    arbitratorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    designerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: "",
    },
    files: { type: [String], default: [] },
    finalPdfFile: { type: String, default: "" },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    designConversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    arbitrationConversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    status: { type: String, required: true },
    currentStage: { type: mongoose.Schema.Types.ObjectId, ref: "Stage" },
    stages: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Stage" },
        order: { type: Number, ref: "Stage" },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const BookingModel = mongoose.model<BookingDocument>("Booking", BookingSchema);

export default BookingModel;
