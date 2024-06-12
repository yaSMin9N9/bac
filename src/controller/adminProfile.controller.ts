import bcrypt from "bcrypt";
import config from "config";
import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import AdminModel from "../models/admin.model";
import { restoreFile } from "../service/file.service";

export const changePassword = async (request: Request, response: Response) => {
  try {
    const { currentPassword, newPassword } = request.body;
    const adminId = request?.id;
    if (!adminId) return response.status(401).json({ message: "Unauthorized" });
    const foundAdmin = await AdminModel.findById(adminId);
    if (!foundAdmin)
      return response.status(401).json({ message: "Unauthorized" });
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      foundAdmin.password
    );
    if (!isValidPassword)
      return response
        .status(408)
        .send({ message: "كلمة المرور الحالية خاطئة" });
    const salt = await bcrypt.genSalt(
      parseInt(config.get<string>("saltWorkFactor"))
    );
    const hash = await bcrypt.hash(newPassword, salt);
    await AdminModel.updateOne({ _id: adminId }, { password: hash });
    return response.status(200).send({ message: "تم تعديل كلمة المرور بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const editProfile = async (request: Request, response: Response) => {
  try {
    const adminId = request.id;
    const file = request.files?.image;
    const { firstName, lastName } = request.body;

    if (!adminId) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    const foundAdmin = await AdminModel.findById(adminId);
    if (!foundAdmin) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    let newImageUrl = "";
    if (file) {
      const image = file as UploadedFile;
      newImageUrl = restoreFile("admins", image, foundAdmin.image);
      foundAdmin.image = newImageUrl;
    }

    foundAdmin.firstName = firstName;
    foundAdmin.lastName = lastName;

    await foundAdmin.save();

    return response.status(200).send({
      message: "تم تعديل المعلومات بنجاح",
      data: {
        firstName,
        lastName,
        image: newImageUrl,
      },
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};
