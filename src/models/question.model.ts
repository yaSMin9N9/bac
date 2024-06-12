import mongoose from "mongoose";

export interface QuestionType {
  questionText: string;
  stage: {
    id: mongoose.Types.ObjectId;
    name: string;
  };
}

export interface QuestionDocument extends QuestionType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    stage: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Stage" },
      name: { type: String, ref: "Stage" },
    },
  },
  { timestamps: true, versionKey: false }
);

const QuestionModel = mongoose.model<QuestionDocument>(
  "Question",
  QuestionSchema
);

export default QuestionModel;
