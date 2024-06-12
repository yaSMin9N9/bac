import config from "config";
import { NextFunction, Request, Response } from "express";
import path from "path";
import AdminModel from "../models/admin.model";
import AnswerModel from "../models/answer.model";
import BookingModel from "../models/booking.model";
import ConversationModel from "../models/conversation.model";
import PaymentModel from "../models/payment.model";
import QuestionModel from "../models/question.model";
import ServiceModel from "../models/service.model";
import StageModel from "../models/stage.model";
import UserModel from "../models/user.model";
import {
  generateAnswersPdfFile,
  getStageInformation,
  mergePdfFile,
} from "../service/booking.service";

const domain = config.get<string>("domain");

export const getBooking = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });
    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });

    const page = parseInt(request.query.page as string) - 1 || 0;
    const count = parseInt(request.query.count as string) || 5;
    const status = (request.query.status || "") as string;

    let query: any = {};

    const statusMappings: { [key: string]: any } = {
      pending: {
        $or: [
          { status: "pending" },
          { status: "arbitrationPending" },
          { status: "designPending" },
        ],
      },
      inProgress: {
        $or: [
          { status: "inProgress" },
          { status: "design" },
          { status: "arbitration" },
        ],
      },
      done: {
        $or: [
          { status: "endAdvisor" },
          { status: "endArbitration" },
          { status: "completed" },
        ],
      },
    };

    if (statusMappings[status]) {
      query = {
        $and: [statusMappings[status]],
      };
    }

    const [foundBooking, totalBooking] = await Promise.all([
      BookingModel.find(query)
        .skip(page * count)
        .limit(count)
        .sort({ createdAt: "desc" })
        .select(
          "-conversationId -stages -updatedAt -files -finalPdfFile -arbitrationPdfFile -designPdfFile -currentStage"
        )
        .lean(),
      BookingModel.countDocuments(query),
    ]);
    const bookingPromises = foundBooking.map(async (bookingItem) => {
      const [service, user, advisor, designer, arbitrator] = await Promise.all([
        ServiceModel.findById(bookingItem.serviceId)
          .select("-hasVideos -status -createdAt -updatedAt")
          .lean(),
        UserModel.findById(bookingItem.userId)
          .select("firstName lastName")
          .lean(),
        AdminModel.findById(bookingItem.advisorId)
          .select("-password -createdAt -role -updatedAt")
          .lean(),
        bookingItem.designerId
          ? AdminModel.findById(bookingItem.designerId)
              .select("-password -createdAt -role -updatedAt")
              .lean()
          : null,
        bookingItem.arbitratorId
          ? AdminModel.findById(bookingItem.arbitratorId)
              .select("-password -createdAt -role -updatedAt")
              .lean()
          : null,
      ]);

      const advisorName = `${advisor?.firstName || ""} ${
        advisor?.lastName || ""
      }`;
      const designerName = `${designer?.firstName || ""} ${
        designer?.lastName || ""
      }`;
      const arbitratorName = `${arbitrator?.firstName || ""} ${
        arbitrator?.lastName || ""
      }`;

      return {
        _id: bookingItem._id,
        status: bookingItem.status,
        createdAt: bookingItem.createdAt,
        service: service?.name || "",
        user: `${user?.firstName || ""} ${user?.lastName || ""}`,
        advisor: advisorName,
        designer: designerName,
        arbitrator: arbitratorName,
      };
    });

    const booking = await Promise.all(bookingPromises);

    response.status(200).json({
      booking,
      pagination: {
        total: totalBooking,
        page: page + 1,
        count,
        lastPage: Math.ceil(totalBooking / count) || 1,
      },
    });
  } catch (error) {
    return response
      .status(500)
      .send({ message: "حدث خطأ ما، يرجى المحاولة لاحقاً", error });
  }
};

export const getAdminBooking = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });
    if (role !== "designer" && role !== "advisor" && role !== "arbitrator")
      return response.status(401).send({ message: "Forbidden" });

    const page = parseInt(request.query.page as string) - 1 || 0;
    const count = parseInt(request.query.count as string) || 5;
    const status = (request.query.status || "") as string;

    let query: any = {};

    const statusMappings: { [key: string]: any } = {
      pending: {
        $or: [
          { status: "pending" },
          { status: "arbitrationPending" },
          { status: "designPending" },
        ],
      },
      inProgress: {
        $or: [
          { status: "inProgress" },
          { status: "design" },
          { status: "arbitration" },
        ],
      },
      done: {
        $or: [
          { status: "endAdvisor" },
          { status: "endArbitration" },
          { status: "completed" },
        ],
      },
    };

    if (statusMappings[status]) {
      query = {
        $and: [
          statusMappings[status],
          {
            $or: [{ advisorId: id }, { designerId: id }, { arbitratorId: id }],
          },
        ],
      };
    } else {
      query = {
        $and: [
          {
            $or: [{ advisorId: id }, { designerId: id }, { arbitratorId: id }],
          },
        ],
      };
    }

    const [foundBooking, totalBooking] = await Promise.all([
      BookingModel.find(query)
        .skip(page * count)
        .limit(count)
        .sort({ createdAt: "desc" })
        .select(
          "-conversationId -stages -updatedAt -files -finalPdfFile -arbitrationPdfFile -designPdfFile -currentStage"
        )
        .lean(),
      BookingModel.countDocuments(query),
    ]);
    const bookingPromises = foundBooking.map(async (bookingItem) => {
      const [service, user, advisor, designer, arbitrator] = await Promise.all([
        ServiceModel.findById(bookingItem.serviceId)
          .select("-hasVideos -status -createdAt -updatedAt")
          .lean(),
        UserModel.findById(bookingItem.userId)
          .select("firstName lastName")
          .lean(),
        AdminModel.findById(bookingItem.advisorId)
          .select("-password -createdAt -role -updatedAt")
          .lean(),
        bookingItem.designerId
          ? AdminModel.findById(bookingItem.designerId)
              .select("-password -createdAt -role -updatedAt")
              .lean()
          : null,
        bookingItem.arbitratorId
          ? AdminModel.findById(bookingItem.arbitratorId)
              .select("-password -createdAt -role -updatedAt")
              .lean()
          : null,
      ]);

      const advisorName = `${advisor?.firstName || ""} ${
        advisor?.lastName || ""
      }`;
      const designerName = `${designer?.firstName || ""} ${
        designer?.lastName || ""
      }`;
      const arbitratorName = `${arbitrator?.firstName || ""} ${
        arbitrator?.lastName || ""
      }`;

      return {
        _id: bookingItem._id,
        status: bookingItem.status,
        createdAt: bookingItem.createdAt,
        service: service?.name || "",
        user: `${user?.firstName || ""} ${user?.lastName || ""}`,
        advisor: advisorName,
        designer: designerName,
        arbitrator: arbitratorName,
      };
    });

    const booking = await Promise.all(bookingPromises);

    response.status(200).json({
      booking,
      pagination: {
        total: totalBooking,
        page: page + 1,
        count,
        lastPage: Math.ceil(totalBooking / count) || 1,
      },
    });
  } catch (error) {
    return response
      .status(500)
      .send({ message: "حدث خطأ ما، يرجى المحاولة لاحقاً", error });
  }
};

export const acceptBooking = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    const { bookingId } = request.body;

    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });

    const foundBooking = await BookingModel.findById(bookingId);
    console.log(bookingId, foundBooking)
    if (!foundBooking || foundBooking.status !== "pending")
      return response.status(400).send({ message: "الحجز غير موجود" });

    const foundPayment = await PaymentModel.findOne({
      status: "pending",
      serviceType: "booking",
      userId: foundBooking.userId,
      serviceId: foundBooking.serviceId,
    });

    if (!foundPayment)
      return response.status(406).send({ message: "الطلب غير موجود" });

    foundPayment.status = "success";
    await foundPayment.save();

    await BookingModel.updateOne({ _id: bookingId }, { status: "inProgress" });
    return response.status(200).send({ message: "تم قبول الطلب بنجاح" });
  } catch (error) {
    console.log(error);
    return response
      .status(500)
      .send({ message: "حدث خطأ ما, يرجى المحاولة لاحقاً", error });
  }
};

export const acceptDesignBooking = async (
  request: Request,
  response: Response
) => {
  try {
    const { id, role } = request;
    const { bookingId } = request.body;

    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });

    const foundBooking = await BookingModel.findById(bookingId);
    if (!foundBooking || foundBooking.status !== "designPending")
      return response.status(400).send({ message: "الحجز غير موجود" });

    const foundPayment = await PaymentModel.findOne({
      status: "pending",
      serviceType: "design",
      userId: foundBooking.userId,
      serviceId: foundBooking.serviceId,
    });

    if (!foundPayment)
      return response.status(406).send({ message: "الطلب غير موجود" });

    foundPayment.status = "success";
    await foundPayment.save();

    await BookingModel.updateOne({ _id: bookingId }, { status: "design" });
    return response.status(200).send({ message: "تم قبول الطلب بنجاح" });
  } catch (error) {
    return response
      .status(500)
      .send({ message: "حدث خطأ ما, يرجى المحاولة لاحقاً", error });
  }
};

export const acceptArbitrationBooking = async (
  request: Request,
  response: Response
) => {
  try {
    const { id, role } = request;
    const { bookingId } = request.body;

    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });

    const foundBooking = await BookingModel.findById(bookingId);
    if (!foundBooking || foundBooking.status !== "arbitrationPending")
      return response.status(400).send({ message: "الحجز غير موجود" });

    const foundPayment = await PaymentModel.findOne({
      status: "pending",
      serviceType: "arbitration",
      userId: foundBooking.userId,
      serviceId: foundBooking.serviceId,
    });
    if (!foundPayment)
      return response.status(406).send({ message: "الطلب غير موجود" });

    foundPayment.status = "success";
    await foundPayment.save();

    await BookingModel.updateOne({ _id: bookingId }, { status: "arbitration" });
    return response.status(200).send({ message: "تم قبول الطلب بنجاح" });
  } catch (error) {
    return response
      .status(500)
      .send({ message: "حدث خطأ ما, يرجى المحاولة لاحقاً", error });
  }
};

export const rejectBooking = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    const { bookingId } = request.body;

    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });

    const foundBooking = await BookingModel.findById(bookingId);
    if (!foundBooking || foundBooking.status !== "pending")
      return response.status(400).send({ message: "الحجز غير موجود" });

    const foundPayment = await PaymentModel.findOne({
      status: "pending",
      serviceType: "booking",
      userId: foundBooking.userId,
      serviceId: foundBooking.serviceId,
    });
    if (!foundPayment)
      return response.status(406).send({ message: "الطلب غير موجود" });

    foundPayment.status = "field";
    foundPayment.fieldReason = "تم رفض الطلب من قبل المشرف";
    await foundPayment.save();

    await ConversationModel.deleteOne({ _id: foundBooking.conversationId });
    await BookingModel.deleteOne({ _id: bookingId });
    return response.status(200).send({ message: "تم رفض الطلب بنجاح" });
  } catch (error) {
    return response
      .status(500)
      .send({ message: "حدث خطأ ما, يرجى المحاولة لاحقاً", error });
  }
};

export const rejectDesignBooking = async (
  request: Request,
  response: Response
) => {
  try {
    const { id, role } = request;
    const { bookingId } = request.body;

    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });

    const foundBooking = await BookingModel.findById(bookingId);

    if (!foundBooking || foundBooking.status !== "designPending")
      return response.status(400).send({ message: "الحجز غير موجود" });

    const foundPayment = await PaymentModel.findOne({
      status: "pending",
      serviceType: "design",
      userId: foundBooking.userId,
      serviceId: foundBooking.serviceId,
    });
    if (!foundPayment)
      return response.status(406).send({ message: "الطلب غير موجود" });

    await PaymentModel.updateOne(
      { _id: foundPayment._id },
      { status: "field", fieldReason: "تم رفض الطلب من قبل المشرف" }
    );

    await ConversationModel.deleteOne({
      _id: foundBooking.designConversationId,
    });
    await BookingModel.updateOne(
      { _id: bookingId },
      {
        designConversationId: null,
        designerId: null,
        status: foundBooking.arbitrationConversationId
          ? "endArbitration"
          : "endAdvisor",
      }
    );
    return response.status(200).send({ message: "تم رفض الطلب بنجاح" });
  } catch (error) {
    return response
      .status(500)
      .send({ message: "حدث خطأ ما, يرجى المحاولة لاحقاً", error });
  }
};

export const rejectArbitrationBooking = async (
  request: Request,
  response: Response
) => {
  try {
    const { id, role } = request;
    const { bookingId } = request.body;

    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "admin" && role !== "superAdmin")
      return response.status(401).send({ message: "Forbidden" });

    const foundBooking = await BookingModel.findById(bookingId);
    if (!foundBooking || foundBooking.status !== "arbitrationPending")
      return response.status(400).send({ message: "الحجز غير موجود" });

    const foundPayment = await PaymentModel.findOne({
      status: "pending",
      serviceType: "arbitration",
      userId: foundBooking.userId,
      serviceId: foundBooking.serviceId,
    });
    if (!foundPayment)
      return response.status(406).send({ message: "الطلب غير موجود" });

    await PaymentModel.updateOne(
      { _id: foundPayment._id },
      { status: "field", fieldReason: "تم رفض الطلب من قبل المشرف" }
    );

    await ConversationModel.deleteOne({
      _id: foundBooking.arbitrationConversationId,
    });

    await BookingModel.updateOne(
      { _id: bookingId },
      {
        arbitrationConversationId: null,
        arbitratorId: null,
        status: "endAdvisor",
      }
    );
    return response.status(200).send({ message: "تم رفض الطلب بنجاح" });
  } catch (error) {
    return response
      .status(500)
      .send({ message: "حدث خطأ ما, يرجى المحاولة لاحقاً", error });
  }
};

export const skipStage = async (request: Request, response: Response) => {
  try {
    const { id, role } = request;
    const { bookingId } = request.body;

    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "advisor")
      return response.status(403).send({ message: "Forbidden" });

    const foundBooking = await BookingModel.findById(bookingId);

    if (!foundBooking)
      return response.status(400).send({ message: "الحجز غير موجود" });

    const foundService = await ServiceModel.findById(foundBooking.serviceId);
    if (!foundService)
      return response.status(400).send({ message: "الخدمة غير موجودة" });

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
            { _id:foundBooking },
            { currentStage: foundBooking.stages[nextStage + 1]._id }
          );
          return response
            .status(200)
            .send({ message: "تم الانتقال للمرحلة التالية بنجاح" });
        } else {
          await BookingModel.updateOne(
            { _id:foundBooking },
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

export const getCurrentBookingStages = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id, role } = request;
    const { bookingId } = request.params;

    if (!id || !role)
      return response.status(401).send({ message: "Unauthorized" });

    if (role !== "advisor" && role !== "designer" && role !== "arbitrator")
      return response.status(403).send({ message: "Forbidden" });

    const foundBooking = await BookingModel.findById(bookingId);

    if (!foundBooking)
      return response.status(400).send({ message: "الحجز غير موجود" });

    if (
      foundBooking.status !== "inProgress" &&
      foundBooking.status !== "pending"
    ) {
      return next();
    }

    const foundUser = await UserModel.findById(foundBooking.userId)
      .lean()
      .select("firstName lastName image email");
    if (!foundUser)
      return response.status(400).send({ message: "حساب المستخدم غير موجود" });

    const stage = await getStageInformation(
      foundBooking.currentStage,
      foundBooking.userId
    );

    return response.status(200).send({
      bookingStatus: foundBooking.status,
      bookingId: foundBooking._id,
      finalPdfFile: "",
      conversationId:
        foundBooking.status === "pending" ? null : foundBooking.conversationId,
      arbitrationConversationId: null,
      designConversationId: null,
      user: foundUser,
      stages: [stage],
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
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
  const { bookingId } = request.params;

  const foundBooking = await BookingModel.findById(bookingId);

  if (foundBooking!.status !== "endAdvisor") {
    return next();
  }

  const foundUser = await UserModel.findById(foundBooking!.userId)
    .lean()
    .select("firstName lastName image email");

  const stages = await Promise.all(
    foundBooking!.stages.map((stage) =>
      getStageInformation(stage._id, foundBooking!.userId)
    )
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
    arbitrationConversationId: null,
    designConversationId: null,
    finalPdfFile,
    user: foundUser,
    stages,
  });
};

export const getArbitrationInformation = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const id = request.id;
  const { bookingId } = request.params;

  const foundBooking = await BookingModel.findById(bookingId);

  if (
    foundBooking!.status !== "endArbitration" &&
    foundBooking!.status !== "arbitration" &&
    foundBooking!.status !== "arbitrationPending"
  ) {
    return next();
  }

  const foundUser = await UserModel.findById(foundBooking!.userId)
    .lean()
    .select("firstName lastName image email");

  const stages = await Promise.all(
    foundBooking!.stages.map((stage) =>
      getStageInformation(stage._id, foundBooking!.userId)
    )
  );

  return response.status(200).send({
    bookingStatus: foundBooking!.status,
    bookingId: foundBooking!._id,
    user: foundUser,
    conversationId: foundBooking!.conversationId,
    arbitrationConversationId:
      foundBooking!.status === "arbitrationPending"
        ? null
        : foundBooking?.arbitrationConversationId
        ? foundBooking!.arbitrationConversationId
        : "",
    designConversationId: null,
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
  const { bookingId } = request.params;

  const foundBooking = await BookingModel.findById(bookingId);

  if (
    foundBooking!.status !== "designPending" &&
    foundBooking!.status !== "design"
  ) {
    return next();
  }
  const foundUser = await UserModel.findById(foundBooking!.userId)
    .lean()
    .select("firstName lastName image email");
  const stages = await Promise.all(
    foundBooking!.stages.map((stage) =>
      getStageInformation(stage._id, foundBooking!.userId)
    )
  );

  return response.status(200).send({
    bookingStatus: foundBooking!.status,
    bookingId: foundBooking!._id,
    user: foundUser,
    conversationId: foundBooking!.conversationId,
    arbitrationConversationId: foundBooking!.arbitrationConversationId,
    designConversationId:
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
  const { bookingId } = request.params;

  const foundBooking = await BookingModel.findById(bookingId);

  const stages = await Promise.all(
    foundBooking!.stages.map((stage) =>
      getStageInformation(stage._id, foundBooking!.userId)
    )
  );

  const foundUser = await UserModel.findById(foundBooking!.userId)
    .lean()
    .select("firstName lastName image email");
  return response.status(200).send({
    user: foundUser,
    bookingStatus: foundBooking!.status,
    bookingId: foundBooking!._id,
    finalPdfFile: foundBooking!.finalPdfFile,
    conversationId: foundBooking!.conversationId,
    arbitrationConversationId: foundBooking!.arbitrationConversationId,
    designConversationId: foundBooking!.designConversationId,
    stages,
  });
};

export const adminCloseDesignBooking = async (
  request: Request,
  response: Response
) => {
  const { id, role } = request;
  const { booking } = request.body;

  if (!id || !role)
    return response.status(401).send({ message: "Unauthorized" });

  if (role !== "designer")
    return response.status(403).send({ message: "Forbidden" });

  try {
    const foundBooking = await BookingModel.findById(booking);
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

export const adminCloseArbitrationBooking = async (
  request: Request,
  response: Response
) => {
  const { id, role } = request;
  const { booking } = request.body;

  if (!id || !role)
    return response.status(401).send({ message: "Unauthorized" });

  if (role !== "arbitrator")
    return response.status(403).send({ message: "Forbidden" });

  try {
    const foundBooking = await BookingModel.findById(booking);
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
