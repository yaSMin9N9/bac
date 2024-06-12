import { Request, Response } from "express";
import GuidanceModel from "../models/guidance.model";
import StageModel from "../models/stage.model";

export const addGuidance = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { guidance, stageId } = request.body;
    const foundStage = await StageModel.findById(stageId);
    if (!foundStage)
      return response.status(400).send({ message: "المرحلة غير موجودة" });
    await GuidanceModel.create({
      guidance,
      stage: { id: stageId, name: foundStage.name },
    });
    return response.status(201).send({ message: "تم إنشاء الارشاد بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const deleteGuidance = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { guidanceId } = request.params;
    const foundGuidance = await GuidanceModel.findById(guidanceId);
    if (!foundGuidance)
      return response.status(400).send({ message: "الارشاد غير موجود" });
    await GuidanceModel.deleteOne({ _id: guidanceId });
    return response.status(200).send({ message: "تم حذف الارشاد بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const updateGuidance = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { guidance } = request.body;
    const { guidanceId } = request.params;
    const foundGuidance = await GuidanceModel.findById(guidanceId);
    if (!foundGuidance)
      return response.status(400).send({ message: "الارشاد غير موجود" });
    await GuidanceModel.updateOne({ _id: guidanceId }, { guidance });
    return response.status(200).send({ message: "تم تعديل الارشاد بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const getStageGuidances = async (
  request: Request,
  response: Response
) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { stageId } = request.params;
    const foundStage = await StageModel.findById(stageId);
    if (!foundStage)
      return response.status(400).send({ message: "المرحلة غير موجود" });
    const guidances = await GuidanceModel.find({
      "stage.id": stageId,
    }).select("-stage");
    return response.status(200).send({ stageName: foundStage.name, guidances });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};
