import config from "config";
import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";
import AdminModel from "../models/admin.model";
import AnswerModel from "../models/answer.model";
import BookingModel from "../models/booking.model";
import ConversationModel from "../models/conversation.model";
import PaymentModel from "../models/payment.model";
import QuestionModel from "../models/question.model";
import ServiceModel from "../models/service.model";
import StageModel from "../models/stage.model";
import {
  generateAnswersPdfFile,
  getStageInformation,
  mergePdfFile,
} from "../service/booking.service";
import { storeFile } from "../service/file.service";

const domain = config.get<string>("domain");

export const bookingRegisterByBank = async (
  request: Request,
  response: Response
) => {
  try {
    const { serviceId, advisorId } = request.body;
    const file = request.files!.image as UploadedFile;
    const userId = request?.id;
    const role = request?.role;
    if (!userId || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "user")
      return response.status(403).send({ message: "Forbidden" });

    const foundAdmin = await AdminModel.findById(advisorId);
    if (!foundAdmin || foundAdmin.role !== "advisor")
      return response.status(400).send({ message: "حساب المستشار غير موجود" });

    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService || !foundService.status)
      return response.status(400).send({ message: "الخدمة غير موجودة" });

    const foundBooking = await BookingModel.findOne({ serviceId, userId });
    if (foundBooking)
      return response.status(400).send({ message: "الحجز موجود" });

    const foundStages = await StageModel.find({
      "service.id": serviceId,
      status: true,
    });
    if (foundStages.length === 0)
      return response.status(400).send({ message: "الخدمة غير مكتملة" });

    const currentStage = foundStages[0]._id;
    const imageUrl = storeFile("payment", file);
    const conversation = await ConversationModel.create({
      userId,
      adminId: advisorId,
      adminRole: "advisor",
    });
    await BookingModel.create({
      userId,
      advisorId,
      serviceId,
      status: "pending",
      currentStage,
      conversationId: conversation._id,
      stages: foundStages,
    });
    await PaymentModel.create({
      userId,
      serviceId,
      status: "pending",
      type: "bank",
      serviceType: "booking",
      price: foundService.price,
      attachment: imageUrl,
      adminId: advisorId,
    });
    return response.status(200).send({ message: "تم ارسال الطلب بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const designRegisterByBank = async (
  request: Request,
  response: Response
) => {
  try {
    const { serviceId } = request.body;
    const file = request.files!.image as UploadedFile;
    const { role, id: userId } = request;
    if (!userId || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "user")
      return response.status(403).send({ message: "Forbidden" });

    const foundAdmins = await AdminModel.find({ role: "designer" });
    let designerId = "";

    if (foundAdmins.length === 0)
      return response.status(400).send({
        message: "عذراً لا يمكنك المتابعة حالياً يرجى المحاولة لاحقاً",
      });
    else if (foundAdmins.length === 1) designerId = foundAdmins[0]._id;
    else {
      const randomIndex = Math.floor(Math.random() * foundAdmins.length);
      const randomValue = foundAdmins[randomIndex]._id;
      designerId = randomValue;
    }

    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService)
      return response.status(400).send({ message: "الخدمة غير موجودة" });

    const foundBooking = await BookingModel.findOne({ serviceId, userId });
    if (!foundBooking)
      return response.status(400).send({ message: "الحجز غير موجود" });

    if (
      foundBooking.status !== "endArbitration" &&
      foundBooking.status !== "endAdvisor"
    )
      return response.status(400).send({ message: "عذراً لا يمكنك المتابعة" });

    const imageUrl = storeFile("payment", file);
    const conversation = await ConversationModel.create({
      userId,
      adminId: designerId,
      adminRole: "designer",
    });

    await BookingModel.updateOne(
      { _id: foundBooking._id },
      {
        designConversationId: conversation._id,
        designerId: designerId,
        status: "designPending",
      }
    );
    await PaymentModel.create({
      userId,
      serviceId,
      status: "pending",
      type: "bank",
      serviceType: "design",
      price: foundService.designPrice,
      attachment: imageUrl,
      adminId: designerId,
    });
    return response.status(200).send({ message: "تم ارسال الطلب بنجاح" });
  } catch (error) {
    console.log(error);
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const arbitrationRegisterByBank = async (
  request: Request,
  response: Response
) => {
  try {
    const { serviceId, arbitratorId } = request.body;
    const file = request.files!.image as UploadedFile;
    const { role, id: userId } = request;
    if (!userId || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "user")
      return response.status(403).send({ message: "Forbidden" });

    const foundAdmin = await AdminModel.findById(arbitratorId);
    if (!foundAdmin || foundAdmin.role !== "arbitrator")
      return response.status(400).send({ message: "حساب المحكم غير موجود" });

    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService)
      return response.status(400).send({ message: "الخدمة غير موجودة" });

    const foundBooking = await BookingModel.findOne({ serviceId, userId });
    if (!foundBooking)
      return response.status(400).send({ message: "الحجز غير موجود" });

    if (foundBooking.status !== "endAdvisor")
      return response.status(400).send({ message: "عذراً لا يمكنك المتابعة" });

    const imageUrl = storeFile("payment", file);
    const conversation = await ConversationModel.create({
      userId,
      adminId: arbitratorId,
      adminRole: "arbitrator",
    });

    await BookingModel.updateOne(
      { _id: foundBooking._id },
      {
        arbitrationConversationId: conversation._id,
        arbitratorId: arbitratorId,
        status: "arbitrationPending",
      }
    );

    await PaymentModel.create({
      userId,
      serviceId,
      status: "pending",
      type: "bank",
      serviceType: "arbitration",
      price: foundService.arbitrationPrice,
      attachment: imageUrl,
      adminId: arbitratorId,
    });
    return response.status(200).send({ message: "تم ارسال الطلب بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const userSkipStage = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    const { serviceId } = request.body;

    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "user")
      return response.status(403).send({ message: "Forbidden" });

    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService)
      return response.status(400).send({ message: "الخدمة غير موجودة" });

    const foundBooking = await BookingModel.findOne({
      serviceId,
      userId: id,
    });

    if (!foundBooking)
      return response.status(400).send({ message: "الحجز غير موجود" });

    const { status, currentStage } = foundBooking;

    if (status === "endAdvisor")
      return response.status(400).send({ message: "الخدمة منتهية" });

    if (status === "pending")
      return response
        .status(400)
        .send({ message: "الخدمة بانتظار موافقة المشرف" });

    const currentStageObj = await StageModel.findById(currentStage);
    if (!currentStageObj)
      return response.status(400).send({ message: "المرحلة غير موجودة" });

    if (!currentStageObj.canSkip)
      return response.status(400).send({
        message: "عذراً الانتقال للمرحلة التالية يتم فقط من قبل المستشار",
      });

    const answers = await AnswerModel.find({
      stageId: currentStage,
      userId: id,
    });

    const foundQuestions = await QuestionModel.find({
      "stage.id": foundBooking.currentStage,
    }).select("questionText");

    const unansweredQuestions = foundQuestions.filter((question) => {
      const answer = answers.find((ans) =>
        question._id.equals(ans.question.id)
      );
      return !answer || !answer.answer;
    });

    if (unansweredQuestions.length > 0)
      return response.status(400).send({
        message: "يجب الإجابة على جميع الأسئلة قبل الانتقال للمرحلة التالية",
      });

    const nextStage = foundBooking.stages.indexOf(
      foundBooking.stages.find((stage) =>
        stage._id.equals(foundBooking.currentStage as unknown as string)
      )!
    );
    const pdfName = `${foundBooking._id}_${nextStage}_${foundService.name}.pdf`;
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "static",
      "pdf",
      "stages",
      pdfName
    );

    generateAnswersPdfFile(foundQuestions, answers, filePath);

    const stageFileName =
      currentStageObj.file.split("/")[
        currentStageObj.file.split("/").length - 1
      ];
    const stageFilePath = path.join(
      __dirname,
      "..",
      "..",
      "static",
      "pdf",
      "services",
      stageFileName
    );
    await mergePdfFile([stageFilePath, filePath], filePath)
      .then(async () => {
        if (foundBooking.stages[nextStage + 1]) {
          await BookingModel.updateOne(
            { userId: id, serviceId },
            { currentStage: foundBooking.stages[nextStage + 1]._id }
          );
          return response
            .status(200)
            .send({ message: "تم الانتقال للمرحلة التالية بنجاح" });
        } else {
          await BookingModel.updateOne(
            { userId: id, serviceId },
            { status: "endAdvisor" }
          );
          return response
            .status(200)
            .send({ message: "تم الانتهاء من الخدمة" });
        }
      })
      .catch((error) => {
        return response.status(500).send({
          message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
          error,
        });
      });

    const files = foundBooking.files;
    await BookingModel.updateOne(
      { _id: foundBooking._id },
      { files: [...files, `${domain}/static/pdf/stages/${pdfName}`] }
    );
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const getCurrentStage = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const id = request.id;
    const role = request.role;
    const { serviceId } = request.params;

    if (!id || !role) {
      return response.status(401).send({ message: "Unauthorized" });
    }

    if (role !== "user") {
      return response.status(403).send({ message: "Forbidden" });
    }

    const foundBooking = await BookingModel.findOne({
      serviceId,
      userId: id,
    });

    if (!foundBooking) {
      return response.status(400).send({ message: "الحجز غير موجود" });
    }

    if (foundBooking.status === "pending") {
      return response
        .status(200)
        .send({ message: "الخدمة بانتظار موافقة المشرف", status: "pending" });
    }

    if (foundBooking.status !== "inProgress") {
      return next();
    }

    const stage = await getStageInformation(foundBooking.currentStage, id);

    return response.status(200).send({
      bookingStatus: foundBooking.status,
      bookingId: foundBooking._id,
      conversationId: foundBooking.conversationId,
      ...stage,
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما، يرجى المحاولة لاحقًا",
      error,
    });
  }
};

export const getBookingInformation = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const id = request.id;
  const { serviceId } = request.params;

  const foundBooking = await BookingModel.findOne({
    serviceId,
    userId: id,
  });

  if (foundBooking!.status !== "endAdvisor") {
    return next();
  }

  const stages = await Promise.all(
    foundBooking!.stages.map((stage) => getStageInformation(stage._id, id!))
  );
  let finalPdfFile = "";

  if (foundBooking!.finalPdfFile.length === 0) {
    const files = foundBooking!.files.map((file) =>
      path.join(
        __dirname,
        "..",
        "..",
        "static",
        "pdf",
        "stages",
        file.slice(file.lastIndexOf("/"))
      )
    );
    const storePath = path.join(
      __dirname,
      "..",
      "..",
      "static",
      "pdf",
      "booking",
      `${foundBooking!._id}.pdf`
    );

    await mergePdfFile(files, storePath);
    finalPdfFile = `${domain}/static/pdf/booking/${foundBooking!._id}.pdf`;

    await BookingModel.updateOne(
      { _id: foundBooking!.id },
      { finalPdfFile: `${domain}/static/pdf/booking/${foundBooking!._id}.pdf` }
    );
  } else {
    finalPdfFile = foundBooking!.finalPdfFile;
  }
  return response.status(200).send({
    bookingStatus: foundBooking!.status,
    bookingId: foundBooking!._id,
    conversationId: foundBooking!.conversationId,
    finalPdfFile,
    stages,
  });
};

export const getArbitrationInformation = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const id = request.id;
  const { serviceId } = request.params;
  const foundBooking = await BookingModel.findOne({
    serviceId,
    userId: id,
  });

  if (
    foundBooking!.status !== "endArbitration" &&
    foundBooking!.status !== "arbitration" &&
    foundBooking!.status !== "arbitrationPending"
  ) {
    return next();
  }

  const stages = await Promise.all(
    foundBooking!.stages.map((stage) => getStageInformation(stage._id, id!))
  );

  return response.status(200).send({
    bookingStatus: foundBooking!.status,
    bookingId: foundBooking!._id,
    conversationId:
      foundBooking!.status === "arbitrationPending"
        ? null
        : foundBooking?.arbitrationConversationId
        ? foundBooking!.arbitrationConversationId
        : "",
    finalPdfFile: foundBooking!.finalPdfFile,
    stages,
  });
};

export const getDesignInformation = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const id = request.id;
  const { serviceId } = request.params;
  const foundBooking = await BookingModel.findOne({
    serviceId,
    userId: id,
  });

  if (
    foundBooking!.status !== "designPending" &&
    foundBooking!.status !== "design"
  ) {
    return next();
  }

  const stages = await Promise.all(
    foundBooking!.stages.map((stage) => getStageInformation(stage._id, id!))
  );

  return response.status(200).send({
    bookingStatus: foundBooking!.status,
    bookingId: foundBooking!._id,
    conversationId:
      foundBooking!.status === "designPending"
        ? null
        : foundBooking?.designConversationId
        ? foundBooking!.designConversationId
        : "",
    finalPdfFile: foundBooking!.finalPdfFile,
    stages,
  });
};

export const getCompleteBookingInformation = async (
  request: Request,
  response: Response
) => {
  const id = request.id;
  const { serviceId } = request.params;
  const foundBooking = await BookingModel.findOne({
    serviceId,
    userId: id,
  });

  const stages = await Promise.all(
    foundBooking!.stages.map((stage) => getStageInformation(stage._id, id!))
  );

  return response.status(200).send({
    bookingStatus: foundBooking!.status,
    bookingId: foundBooking!._id,
    finalPdfFile: foundBooking!.finalPdfFile,
    stages,
  });
};

export const addOrEditAnswer = async (request: Request, response: Response) => {
  try {
    const { answers } = request.body;
    const { id, role } = request;

    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "user")
      return response.status(403).send({ message: "Forbidden" });

    if (answers.length === 0)
      return response
        .status(400)
        .send({ message: "يجب الاجابة على سؤال واحد على الأقل" });

    for (let i = 0; i < answers.length; i++) {
      const foundQuestion = await QuestionModel.findById(answers[i].questionId);

      if (!foundQuestion) continue;
      if (answers[i].answer.length === 0) continue;

      const update = {
        answer: answers[i].answer,
        userId: id,
        stageId: foundQuestion.stage.id,
        question: {
          id: answers[i].questionId,
          questionText: foundQuestion.questionText,
        },
      };

      const foundAnswer = await AnswerModel.findOneAndUpdate(
        { "question.id": answers[i].questionId, userId: id },
        update,
        { upsert: true, new: true }
      );
    }

    return response.status(200).send({
      message: "تم التعديل بنجاح",
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما، يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const getMyBooking = async (request: Request, response: Response) => {
  const { id, role } = request;

  if (!id || !role) {
    return response.status(401).send({ message: "Unauthorized" });
  }

  if (role !== "user") {
    return response.status(403).send({ message: "Forbidden" });
  }

  try {
    const foundBooking = await BookingModel.find({ userId: id })
      .lean()
      .select("advisorId serviceId status");

    if (foundBooking.length === 0) {
      return response.status(200).send([]);
    }

    const userBooking = await Promise.all(
      foundBooking.map(async (booking) => {
        const foundService = await ServiceModel.findById(
          booking.serviceId
        ).select("name");
        const foundAdmin = await AdminModel.findById(booking.advisorId)
          .select("firstName")
          .select("lastName");
        const GetBooking = {
          ...booking,
          serviceName: foundService?.name,
          advisorFirstName: foundAdmin?.firstName,
          advisorLastName: foundAdmin?.lastName,
        };
        return GetBooking;
      })
    );

    return response.status(200).send(userBooking);
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    return response.status(500).send({ message: "Internal Server Error" });
  }
};

export const closeDesignBooking = async (
  request: Request,
  response: Response
) => {
  const { id, role } = request;
  const { bookingId } = request.body;

  if (!id || !role)
    return response.status(401).send({ message: "Unauthorized" });

  if (role !== "user")
    return response.status(403).send({ message: "Forbidden" });

  try {
    const foundBooking = await BookingModel.findById(bookingId);
    if (!foundBooking)
      return response.status(400).send({ message: "الحجز غير موجود" });

    if (foundBooking.status !== "design")
      return response.status(400).send({ message: "لا يمكن اغلاق الخدمة" });

    await BookingModel.updateOne(
      { _id: foundBooking },
      { status: "completed" }
    );

    return response.status(200).send({ message: "تم تعديل حالة الخدمة بنجاح" });
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    return response.status(500).send({ message: "Internal Server Error" });
  }
};

export const closeArbitrationBooking = async (
  request: Request,
  response: Response
) => {
  const { id, role } = request;
  const { bookingId } = request.body;

  if (!id || !role)
    return response.status(401).send({ message: "Unauthorized" });

  if (role !== "user")
    return response.status(403).send({ message: "Forbidden" });

  try {
    const foundBooking = await BookingModel.findById(bookingId);
    if (!foundBooking)
      return response.status(400).send({ message: "الحجز غير موجود" });

    if (foundBooking.status !== "arbitration")
      return response.status(400).send({ message: "لا يمكن اغلاق الخدمة" });

    await BookingModel.updateOne(
      { _id: foundBooking },
      { status: "endArbitration" }
    );

    return response.status(200).send({ message: "تم تعديل حالة الخدمة بنجاح" });
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    return response.status(500).send({ message: "Internal Server Error" });
  }
};
