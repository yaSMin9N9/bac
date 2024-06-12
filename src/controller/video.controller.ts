import { Request, Response } from "express";
import StageModel from "../models/stage.model";
import VideoModel from "../models/video.model";

export const addVideo = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { url, stageId } = request.body;
    const foundStage = await StageModel.findById(stageId);
    if (!foundStage)
      return response.status(400).send({ message: "المرحلة غير موجودة" });
    const foundVideo = await VideoModel.findOne({ "stage.id": stageId });
    if (foundVideo)
      return response
        .status(400)
        .send({ message: "يجب ان تحتوي المرحلة على فيديو واحد فقط" });

    await VideoModel.create({
      url,
      stage: { id: stageId, name: foundStage.name },
    });
    return response.status(200).send({ message: "تم الإنشاء بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const getVideo = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { stageId } = request.params;
    const foundStage = await StageModel.findById(stageId);
    if (!foundStage)
      return response.status(400).send({ message: "المرحلة غير موجودة" });
    const video = await VideoModel.find({ "stage.id": stageId });
    return response.status(200).send({ stageName: foundStage.name, video });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const deleteVideo = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { stageId } = request.params;
    const foundStage = await StageModel.findById(stageId);
    if (!foundStage)
      return response.status(400).send({ message: "المرحلة غير موجودة" });
    await VideoModel.deleteMany({ "stage.id": stageId });
    return response.status(200).send({ message: "تم حذف الفيديو بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const updateVideo = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { videoId } = request.params;
    const { url } = request.body;
    const foundVideo = await VideoModel.findById(videoId);
    if (!foundVideo)
      return response.status(400).send({ message: "الفيديو غير موجود" });
    await VideoModel.updateOne({ _id: videoId }, { url });
    return response.status(200).send({ message: "تم تعديل الفيديو بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};
