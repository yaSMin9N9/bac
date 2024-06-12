import mongoose from "mongoose";

export interface MessageType {
  message: string;
  media: string;
  sender: "user" | "admin";
  conversationId: mongoose.Schema.Types.ObjectId;
}

export interface MessageDocument extends MessageType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    message: { type: String, default: "" },
    media: { type: String, default: "" },
    sender: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

const MessageModel = mongoose.model<MessageDocument>("Message", MessageSchema);

export default MessageModel;
