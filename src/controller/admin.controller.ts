import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import AdminModel from "../models/admin.model";
import CompleteAdminProfileModel from "../models/completeAdminProfile.model";
import ServiceModel from "../models/service.model";
import { restoreFile, storeFile } from "../service/file.service";

export const getAllAdmins = async (request: Request, response: Response) => {
  try {
    const { id, role: userRole } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!userRole)
      return response.status(401).send({ message: "Unauthorized" });
    if (userRole !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const page = request.query.page
      ? parseInt(request.query.page as string) - 1
      : 0;
    const count = request.query.count
      ? parseInt(request.query.count as string)
      : 5;
    const search = request.query.search || "";
    const role = request.query.role;
    const regex = new RegExp(search.toString(), "i");
    let query: any = {};

    if (role) {
      query = {
        $and: [
          {
            $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
          },
        ],
        role,
      };
    } else {
      query = {
        $and: [
          {
            $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
          },
          { $or: [{ role: "superAdmin" }, { role: "admin" }] },
        ],
      };
    }
    const admins = await AdminModel.find(query)
      .skip(page * count)
      .limit(count)
      .sort({ createdAt: "desc" })
      .select("-password")
      .select("+createdAt");
    const totalUsers = await AdminModel.countDocuments(query);
    response.status(200).json({
      admins: admins.filter((admin) => !admin._id.equals(id)),
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

export const AddAdmin = async (request: Request, response: Response) => {
  try {
    // const { id, role: adminRole } = request;
    // if (!id) return response.status(401).send({ message: "Unauthorized" });
    // if (!adminRole)
    // return response.status(401).send({ message: "Unauthorized" });
    // if (adminRole !== "superAdmin")
    // return response.status(401).send({ message: "Forbidden" });
    const file = request.files!.image as UploadedFile;
    const { email, firstName, lastName, password, role } = request.body;
    const foundAdmin = await AdminModel.findOne({ email }).lean();
    if (foundAdmin)
      return response
        .status(406)
        .send({ message: "البريد الالكتروني موجود مسبقاً" });
    const fileUrl = storeFile("admins", file);
    await AdminModel.create({
      email,
      firstName,
      lastName,
      password,
      role,
      image: fileUrl,
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

export const deleteAdmin = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!role) return response.status(401).send({ message: "Unauthorized" });
    if (role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });
    const { adminId } = request.params;
    const admin = await AdminModel.findById(adminId);
    if (!admin)
      return response.status(404).send({ message: "الحساب غير موجود" });
    if (admin.role !== "admin")
      return response
        .status(400)
        .send({ message: "عذراً لا يمكنك حذف هذا الحساب" });
    await AdminModel.deleteOne({ _id: adminId });
    response.status(200).json({ message: "تم حذف الحساب بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const completeAdminProfile = async (
  request: Request,
  response: Response
) => {
  try {
    const { id, role: adminRole } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!adminRole)
      return response.status(401).send({ message: "Unauthorized" });
    if (adminRole !== "advisor" && adminRole !== "arbitrator")
      return response.status(401).send({ message: "Forbidden" });
    const file = request.files!.image as UploadedFile;
    const { description, cvURL, adminId } = request.body;
    const foundAdmin = await AdminModel.findById(adminId);
    if (!foundAdmin)
      return response.status(400).send({ message: "الحساب غير موجود" });
    const role = foundAdmin.role;
    if (role !== "arbitrator" && role !== "advisor")
      return response.status(400).send({ message: "الحساب غير موجود" });
    const foundAdminProfile = await CompleteAdminProfileModel.findOne({
      adminId,
    });
    if (foundAdminProfile)
      return response
        .status(400)
        .send({ message: "لا يمكن الاضافة اكثر من مرة" });
    const fileUrl = storeFile("adminsProfile", file);
    await CompleteAdminProfileModel.create({
      cvURL,
      description,
      image: fileUrl,
      adminId: adminId,
    });
    return response.status(200).send({ message: "تم الإضافة بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const editAdminProfile = async (
  request: Request,
  response: Response
) => {
  try {
    const { id, role: adminRole } = request;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    if (!adminRole)
      return response.status(401).send({ message: "Unauthorized" });
    if (adminRole !== "advisor" && adminRole !== "arbitrator")
      return response.status(401).send({ message: "Forbidden" });

    const file = request.files?.image;
    const { description, cvURL, adminId } = request.body;

    const foundAdmin = await AdminModel.findById(adminId);
    if (!foundAdmin)
      return response.status(400).send({ message: "الحساب غير موجود" });
    const role = foundAdmin.role;
    if (role !== "arbitrator" && role !== "advisor")
      return response.status(400).send({ message: "الحساب غير موجود" });
    const foundAdminProfile = await CompleteAdminProfileModel.findOne({
      adminId,
    });
    if (!foundAdminProfile)
      return response
        .status(400)
        .send({ message: "عذراً لا يمكن التعديل على المعلومات" });

    if (file) {
      const image = file as UploadedFile;
      const newImageUrl = restoreFile("adminsProfile", image, foundAdmin.image);
      foundAdmin.image = newImageUrl;
    }
    foundAdminProfile.cvURL = cvURL;
    foundAdminProfile.description = description;

    await foundAdminProfile.save();

    return response.status(200).send({ message: "تم التعديل بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const getAdvisors = async (request: Request, response: Response) => {
  try {
    const { serviceId } = request.params;
    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService)
      return response.status(400).send({ message: "الخدمة غير موجودة" });
    const advisorsList = foundService.advisors;
    if (advisorsList.length === 0)
      return response
        .status(400)
        .send({ message: "لا يوجد مستشارين لهذه الخدمة" });
    const admins = await AdminModel.find({ _id: { $in: advisorsList } })
      .select("-role")
      .select("-password")
      .select("-updatedAt")
      .sort({ createdAt: "desc" })
      .lean();
    const adminsProfile = await CompleteAdminProfileModel.find();
    const adminsResponse = admins.map((admin) => ({
      ...admin,
      profile:
        adminsProfile.find((profile) => admin._id.equals(profile.adminId)) ||
        [],
    }));
    return response.status(200).send(adminsResponse);
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const getArbitrators = async (request: Request, response: Response) => {
  try {
    const admins = await AdminModel.find({ role: "arbitrator" })
      .select("-role")
      .select("-password")
      .select("-updatedAt")
      .sort({ createdAt: "desc" })
      .lean();
    const adminsProfile = await CompleteAdminProfileModel.find();
    const adminsResponse = admins.map((admin) => ({
      ...admin,
      profile:
        adminsProfile.find((profile) => admin._id.equals(profile.adminId)) ||
        [],
    }));
    return response.status(200).send(adminsResponse);
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const getAdminInformation = async (
  request: Request,
  response: Response
) => {
  try {
    const { id, role } = request;
    const { adminId, type } = request.params;
    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });
    if (role !== "superAdmin" && role !== "admin")
      return response.status(401).send({ message: "Forbidden" });

    const foundAdmin = await AdminModel.findOne({
      _id: adminId,
      role: type,
    })
      .lean()
      .select("-password -role -updatedAt");

    if (!foundAdmin)
      return response.status(400).send({ message: "الحساب غير موجود" });

    const foundProfile = await CompleteAdminProfileModel.findOne({
      adminId,
    }).lean();

    return response.status(200).send({
      admin: {
        ...foundAdmin,
        profileImage: foundProfile?.image ? foundProfile.image : "",
        cvURL: foundProfile?.cvURL ? foundProfile.cvURL : "",
        description: foundProfile?.description ? foundProfile?.description : "",
      },
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};
