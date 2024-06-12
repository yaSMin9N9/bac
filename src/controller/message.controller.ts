import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import BookingModel from "../models/booking.model";
import ConversationModel from "../models/conversation.model";
import MessageModel from "../models/message.model";
import { storeFile } from "../service/file.service";

export const sendMessage = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });
    const { message, conversationId } = request.body;
    const media = request.files?.media as UploadedFile | undefined;
    if (!message && !media)
      return response
        .status(400)
        .send({ message: "عذراً يرجى ادخال رسالة او ملف" });
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    const foundConversation = await ConversationModel.findById(conversationId);
    if (!foundConversation)
      return response.status(400).send({ message: "المحادثة غير موجودة" });

    const query = {
      $and: [
        {
          $or: [
            { conversationId },
            { arbitrationConversationId: conversationId },
            { designConversationId: conversationId },
          ],
        },
      ],
    };

    const foundBooking = await BookingModel.findOne(query).lean();
    if (!foundBooking)
      return response.status(400).send({ message: "الحجز غير موجود" });

    if (
      foundBooking.status !== "inProgress" &&
      foundBooking.status !== "arbitration" &&
      foundBooking.status !== "design"
    )
      return response.status(400).send({ message: "لا يمكنك ارسال الرسالة" });

    let file = "";

    if (media) {
      const image = storeFile("messages", media);
      file = image;
    }

    await MessageModel.create({
      message: message ? message : "",
      sender: role === "user" ? "user" : "admin",
      conversationId: conversationId,
      media: file,
    });
    return response.status(200).send({ message: "تم ارسال الرسالة بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const getMessages = async (request: Request, response: Response) => {
  try {
    const id = request.id;
    const { conversationId } = request.params;
    if (!id) return response.status(401).send({ message: "Unauthorized" });
    const foundConversationId = await ConversationModel.findById(
      conversationId
    );
    if (!foundConversationId)
      return response.status(400).send({ message: "المحادثة غير موجودة" });
    const messages = await MessageModel.find({ conversationId }).select(
      "-conversationId -updatedAt"
    );
    return response.status(200).send(messages);
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};
