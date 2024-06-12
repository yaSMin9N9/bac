import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import AdminModel from "../models/admin.model";
import BookingModel from "../models/booking.model";
import ServiceModel from "../models/service.model";
import { restoreFile, storeFile } from "../service/file.service";

export const getServices = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "superAdmin" && role !== "admin")
      return response.status(401).send({ message: "Forbidden" });
    const services = await ServiceModel.find();
    return response.status(200).send(services);
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const createService = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });
    if (role !== "superAdmin" && role !== "admin")
      return response.status(401).send({ message: "Forbidden" });
    const file = request.files!.image as UploadedFile;
    const { name, price, hasVideos, designPrice, arbitrationPrice } =
      request.body;

    const foundService = await ServiceModel.findOne({ name }).exec();
    if (foundService)
      return response.status(406).send({ message: "الخدمة موجودة مسبقاً" });

    const image = storeFile("services", file);
    await ServiceModel.create({
      name,
      price,
      hasVideos,
      designPrice,
      arbitrationPrice,
      image: image,
    });
    return response.status(201).send({ message: "تم إنشاء الخدمة بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const changeServiceStatus = async (
  request: Request,
  response: Response
) => {
  try {
    const { id, role } = request;
    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });
    if (role !== "superAdmin" && role !== "admin")
      return response.status(401).send({ message: "Forbidden" });
    const { serviceId } = request.params;
    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService)
      return response.status(400).send({ message: "الخدمة غير موجودة" });
    const { status } = foundService;
    await ServiceModel.updateOne({ _id: serviceId }, { status: !status });
    return response.status(200).send({ message: "تم التعديل بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const updateService = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });
    if (role !== "superAdmin" && role !== "admin")
      return response.status(401).send({ message: "Forbidden" });
    const { serviceId } = request.params;
    const file = request.files?.image;
    const { name, price, designPrice, arbitrationPrice } = request.body;
    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService) {
      return response.status(400).json({ message: "الخدمة غير موجودة" });
    }
    const foundNameService = await ServiceModel.findOne({ name });
    if (foundNameService && !foundNameService.equals(foundService)) {
      return response.status(400).json({ message: "يوجد خدمة بنفس هذا الاسم" });
    }

    if (file) {
      const image = file as UploadedFile;
      const newImageUrl = restoreFile("services", image, foundService.image);
      foundService.image = newImageUrl;
    }
    foundService.name = name;
    foundService.price = price;
    foundService.designPrice = designPrice;
    foundService.arbitrationPrice = arbitrationPrice;
    await foundService.save();
    return response.status(200).send({ message: "تم تعديل الخدمة بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const deleteService = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "superAdmin" && role !== "admin")
      return response.status(401).send({ message: "Forbidden" });
    const { serviceId } = request.params;
    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService) {
      return response.status(400).json({ message: "الخدمة غير موجودة" });
    }
    const foundBooking = await BookingModel.find({ serviceId });
    if (foundBooking.length > 0)
      return response.status(400).send({ message: "لا يمكن حذف هذه الخدمة " });
    await ServiceModel.deleteOne({ _id: serviceId });
    return response.status(200).send({ message: "تم حذف الخدمة بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const getUserServices = async (request: Request, response: Response) => {
  try {
    const services = await ServiceModel.find({ status: true })
      .select("-status")
      .select("-hasVideos")
      .select("-updatedAt")
      .select("-advisors")
      .select("-createdAt");
    return response.status(200).send(services);
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const addAdvisor = async (request: Request, response: Response) => {
  try {
    const { advisorId, serviceId } = request.body;
    const { id, role } = request;
    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });
    if (role !== "superAdmin" && role !== "admin")
      return response.status(401).send({ message: "Forbidden" });
    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService)
      return response.status(400).json({ message: "الخدمة غير موجودة" });

    const foundAdvisor = await AdminModel.findById(advisorId);

    if (!foundAdvisor || foundAdvisor.role !== "advisor")
      return response.status(400).send({ message: "المستشار غير موجود" });

    const advisorList = foundService.advisors;

    const isAdded = advisorList.find((advisor) =>
      advisor._id.equals(advisorId)
    );
    if (isAdded)
      return response
        .status(400)
        .send({ message: "!!المستشار موجود بالفعل في هذه الخدمة" });

    foundService.advisors = [
      ...advisorList,
      {
        _id: foundAdvisor._id,
        image: foundAdvisor.image,
        name: `${foundAdvisor.firstName} ${foundAdvisor.lastName}`,
      },
    ];

    await foundService.save();
    return response.status(200).send({ message: "تم الإضافة بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const removeAdvisor = async (request: Request, response: Response) => {
  try {
    const { advisorId, serviceId } = request.body;
    const { id, role } = request;
    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });
    if (role !== "superAdmin" && role !== "admin")
      return response.status(401).send({ message: "Forbidden" });
    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService)
      return response.status(400).json({ message: "الخدمة غير موجودة" });

    const foundAdvisor = await AdminModel.findById(advisorId);
    if (!foundAdvisor)
      return response.status(400).send({ message: "المستشار غير موجود" });

    const advisorList = foundService.advisors.filter(
      (advisor) => !advisor._id.equals(advisorId)
    );

    foundService.advisors = advisorList;

    await foundService.save();
    return response.status(200).send({ message: "تم الإزالة بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};
