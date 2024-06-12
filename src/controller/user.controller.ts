import { Request, Response } from "express";
import UserModel from "../models/user.model";
import config from "config";
import path from "path";
import { UploadedFile } from "express-fileupload";
import { createUser as createNewUser } from "../service/user.service";

const domain = config.get<string>("domain");

export const getAllUsers = async (
  request: Request<
    {},
    {},
    {},
    {
      search?: string;
      page?: string;
      count?: string;
      isVerified: string;
    }
  >,
  response: Response
) => {
  try {
    const page = request.query.page ? parseInt(request.query.page) - 1 : 0;
    const count = request.query.count ? parseInt(request.query.count) : 5;
    const isVerified = request.query.isVerified;
    const search = request.query.search || "";

    let regex = new RegExp(search, "i");
    let query: any = {
      $and: [
        { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
      ],
    };
    if (isVerified && isVerified === "true") query["isVerified"] = true;
    if (isVerified && isVerified === "false") query["isVerified"] = false;
    const users = await UserModel.find(query)
      .skip(page * count)
      .limit(count)
      .select("-password");
    const totalUsers = await UserModel.countDocuments(query);
    response.status(200).json({
      users,
      pagination: {
        total: totalUsers,
        page: page + 1,
        count,
        lastPage: Math.ceil(totalUsers / count) || 1,
      },
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const deleteUser = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const user = await UserModel.findById(id);
    if (!user)
      return response.status(404).send({ message: "المستخدم غير موجود" });
    if (user.isVerified)
      return response
        .status(406)
        .send({ message: `لا يمكنك حذف حساب ${user.firstName}` });
    await UserModel.deleteOne({ _id: id });
    response.status(200).json({ message: "تم حذف الحساب بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const createUser = async (request: Request, response: Response) => {
  try {
    const file = request.files!.image as UploadedFile;
    const { email, firstName, lastName, password } = request.body;
    const foundUser = await UserModel.findOne({ email }).exec();
    if (foundUser)
      return response
        .status(406)
        .send({ message: "البريد الالكتروني موجود مسبقاً" });
    const fileName = `${Date.now()}${Math.round(Math.random() * 1e4)}__${
      file.name
    }`;
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "static",
      "images",
      "users",
      fileName
    );
    file.mv(filePath);
    const user = await createNewUser({
      email,
      firstName,
      lastName,
      password,
      isVerified: true,
      image: `${domain}/static/images/users/${fileName}`,
    });
    return response.status(201).send({
      message: "تم إنشاء الحساب بنجاح",
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};
