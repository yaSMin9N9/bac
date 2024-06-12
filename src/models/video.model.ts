import mongoose from "mongoose";

export interface VideoType {
  url: string;
  stage: {
    id: mongoose.Types.ObjectId;
    name: string;
  };
}

export interface VideoDocument extends VideoType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    stage: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Stage" },
      name: { type: String, ref: "Stage" },
    },
  },
  { timestamps: true, versionKey: false }
);

const VideoModel = mongoose.model<VideoDocument>("Video", VideoSchema);

export default VideoModel;
