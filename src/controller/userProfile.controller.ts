import bcrypt from "bcrypt";
import config from "config";
import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import UserModel from "../models/user.model";
import { restoreFile } from "../service/file.service";

const domain = config.get<string>("domain");

export const changePassword = async (request: Request, response: Response) => {
  try {
    const { currentPassword, newPassword } = request.body;
    const userId = request?.id;
    if (!userId) return response.status(401).json({ message: "Unauthorized" });
    const foundUser = await UserModel.findById(userId);
    if (!foundUser)
      return response.status(401).json({ message: "Unauthorized" });
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      foundUser.password
    );
    if (!isValidPassword)
      return response
        .status(408)
        .send({ message: "كلمة المرور الحالية خاطئة" });
    const salt = await bcrypt.genSalt(
      parseInt(config.get<string>("saltWorkFactor"))
    );
    const hash = await bcrypt.hash(newPassword, salt);
    await UserModel.updateOne({ _id: userId }, { password: hash });
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
    const userId = request.id;
    const file = request.files?.image;
    const { firstName, lastName } = request.body;

    if (!userId) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    if (file) {
      const image = file as UploadedFile;
      const newImageUrl = restoreFile("users", image, foundUser.image);
      foundUser.image = newImageUrl;
    }

    foundUser.firstName = firstName;
    foundUser.lastName = lastName;

    await foundUser.save();

    return response.status(200).send({ message: "تم تعديل المعلومات بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};
