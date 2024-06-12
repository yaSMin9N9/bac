import { Request, Response } from "express";
import QuestionModel from "../models/question.model";
import StageModel from "../models/stage.model";

export const addQuestion = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { questionText, stageId } = request.body;
    const foundStage = await StageModel.findById(stageId);
    if (!foundStage)
      return response.status(400).send({ message: "المرحلة غير موجودة" });
    await QuestionModel.create({
      questionText,
      stage: { id: stageId, name: foundStage.name },
    });
    return response.status(201).send({ message: "تم إنشاء السؤال بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const deleteQuestion = async (request: Request, response: Response) => {
  try {
    const { questionId } = request.params;
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const foundQuestion = await QuestionModel.findById(questionId);
    if (!foundQuestion)
      return response.status(400).send({ message: "السؤال غير موجود" });
    await QuestionModel.deleteOne({ _id: questionId });
    return response.status(200).send({ message: "تم حذف السؤال بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const updateQuestion = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { questionText } = request.body;
    const { questionId } = request.params;
    const foundQuestion = await QuestionModel.findById(questionId);
    if (!foundQuestion)
      return response.status(400).send({ message: "السؤال غير موجود" });
    await QuestionModel.updateOne({ _id: questionId }, { questionText });
    return response.status(200).send({ message: "تم تعديل السؤال بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const getStageQuestion = async (
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
    const questions = await QuestionModel.find({
      "stage.id": stageId,
    }).select("-stage");
    return response.status(200).send({ stageName: foundStage.name, questions });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};
