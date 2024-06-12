import { Request, Response } from "express";
import ServiceModel from "../models/service.model";
import StageModel from "../models/stage.model";
import { UploadedFile } from "express-fileupload";
import { restoreFile, storeFile } from "../service/file.service";

export const getStages = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { serviceId } = request.params;
    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService)
      return response.status(400).send({ message: "الخدمة غير موجودة" });
    const stages = await StageModel.find({ "service.id": serviceId }).lean();
    return response.status(200).send({
      serviceName: foundService.name,
      stages: stages.map((stage) => ({
        ...stage,
        hasVideo: foundService.hasVideos,
      })),
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const addStage = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "admin" && role !== "superAdmin")
      return response.status(403).send({ message: "Forbidden" });

    const { serviceId, name, description, canSkip, title } = request.body;
    const file = request.files!.pdfFile as UploadedFile;

    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService)
      return response.status(400).send({ message: "الخدمة غير موجودة" });

    const stagesService = await StageModel.findOne({
      "service.id": serviceId,
    }).sort({ order: "desc" });

    let order = 0;
    if (stagesService) {
      order = stagesService.order + 1;
    }

    const stageFile = storeFile("services", file, "pdf");
    await StageModel.create({
      name,
      order,
      description,
      canSkip,
      title,
      file: stageFile,
      service: {
        id: serviceId,
        name: foundService.name,
      },
    });
    return response.status(200).send({ message: "تم إنشاء المرحلة بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const changeStageStatus = async (
  request: Request,
  response: Response
) => {
  const { id, role } = request;
  if (!id) return response.status(401).send({ message: "Unauthorized" });
  if (!role) return response.status(401).send({ message: "Unauthorized" });
  if (role !== "admin" && role !== "superAdmin")
    return response.status(403).send({ message: "Forbidden" });
  const { stageId } = request.params;
  const foundStage = await StageModel.findById(stageId);
  if (!foundStage)
    return response.status(400).send({ message: "المرحلة غير موجودة" });

  const status = foundStage.status;
  foundStage.status = !status;
  await foundStage.save();
  return response.status(200).send("تم تغيير حالة المرحلة بنجاح");
};

export const editStage = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { name, description, canSkip, title } = request.body;
    const file = request.files?.pdfFile;
    const { stageId } = request.params;
    const foundStage = await StageModel.findById(stageId);
    if (!foundStage)
      return response.status(400).send({ message: "المرحلة غير موجودة" });

    let updatedFile = "";

    if (file) {
      const image = file as UploadedFile;
      const newImageUrl = restoreFile("services", image, foundStage.file, "pdf");
      updatedFile = newImageUrl;
    }
    await StageModel.updateOne(
      { _id: stageId },
      {
        name,
        description,
        canSkip,
        title,
        file: updatedFile.length > 0 ? updatedFile : foundStage.file,
      }
    );
    return response.status(200).send({ message: "تم تعديل المرحلة بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};
