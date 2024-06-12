import mongoose from "mongoose";

export interface ContactType {
  name: string;
  email: string;
  subject: string;
  comment: string;
}

export interface ContactDocument extends ContactType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    comment: { type: String, required: true },
    subject: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

const ContactModel = mongoose.model<ContactDocument>("Contact", ContactSchema);

export default ContactModel;
