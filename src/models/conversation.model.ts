import mongoose from "mongoose";

export interface ConversationType {
  userId: mongoose.Schema.Types.ObjectId;
  adminId: mongoose.Schema.Types.ObjectId;
  adminRole: "advisor" | "designer" | "arbitrator";
}

export interface ConversationDocument
  extends ConversationType,
    mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    adminRole: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

const ConversationModel = mongoose.model<ConversationDocument>(
  "Conversation",
  ConversationSchema
);

export default ConversationModel;
