import { Request, Response } from "express";
import ContactModel from "../models/contact.model";

export const createContact = async (request: Request, response: Response) => {
  try {
    const { name, email, subject, comment } = request.body;

    await ContactModel.create({
      name,
      email,
      comment,
      subject: subject ? subject : "",
    });

    return response.status(200).send({
      message: "شكراً لك على ارسال الرسالة سيتم التواصل معك في اقرب فرصة",
    });
  } catch (error) {
    return response
      .status(500)
      .send({ message: "حدث خطأ ما يرجى المحاولة لاحقاً" });
  }
};

export const getContactUsMessages = async (
  request: Request,
  response: Response
) => {
  try {
    const { id, role } = request;
    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });
    if (role !== "superAdmin" && role !== "admin")
      return response.status(401).send({ message: "Forbidden" });

    const page = request.query.page
      ? parseInt(request.query.page as string) - 1
      : 0;
    const count = request.query.count
      ? parseInt(request.query.count as string)
      : 5;

    const messages = await ContactModel.find()
      .skip(page * count)
      .limit(count)
      .sort({ createdAt: "desc" })
      .lean();
    const totalCount = await ContactModel.countDocuments();

    return response.status(200).send({
      messages,
      pagination: {
        total: totalCount,
        page: page + 1,
        count,
        lastPage: Math.ceil(totalCount / count) || 1,
      },
    });
  } catch (error) {
    return response
      .status(500)
      .send({ message: "حدث خطأ ما يرجى المحاولة لاحقاً" });
  }
};

export const deleteMessage = async (request: Request, response: Response) => {
  const { id, role } = request;
  const { messageId } = request.params;
  try {
    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });
    if (role !== "superAdmin" && role !== "admin")
      return response.status(401).send({ message: "Forbidden" });

    const foundMessage = await ContactModel.findById(messageId);
    if (!foundMessage)
      return response.status(400).send({
        message: "الرسالة غير موجودة",
      });

    await ContactModel.deleteOne({ _id: messageId });
    return response.status(200).send({
      message: "تم حذف الرسالة بنجاح",
    });
  } catch (error) {
    return response
      .status(500)
      .send({ message: "حدث خطأ ما يرجى المحاولة لاحقاً" });
  }
};
