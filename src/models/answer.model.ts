import mongoose from "mongoose";

export interface AnswerType {
  answer: string;
  userId: mongoose.Types.ObjectId;
  stageId: mongoose.Types.ObjectId;
  question: {
    id: mongoose.Types.ObjectId;
    questionText: string;
  };
}

export interface AnswerDocument extends AnswerType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new mongoose.Schema(
  {
    answer: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    stageId: { type: mongoose.Schema.Types.ObjectId, ref: "Stage" },
    question: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      questionText: { type: String, ref: "Question" },
    },
  },
  { timestamps: true, versionKey: false }
);

const AnswerModel = mongoose.model<AnswerDocument>("Answer", AnswerSchema);

export default AnswerModel;
