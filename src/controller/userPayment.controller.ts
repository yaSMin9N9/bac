import config from "config";
import axios, { AxiosError } from "axios";
import { Request, Response } from "express";
import ServiceModel from "../models/service.model";
import BookingModel from "../models/booking.model";
import PaymentModel from "../models/payment.model";
import StageModel from "../models/stage.model";
import ConversationModel from "../models/conversation.model";
import AdminModel from "../models/admin.model";

const publishable_api_key = config.get<string>("paymentApiKey");
const domain = config.get<string>("domain");
const frontDomain = config.get<string>("frontDomain");

export const madaPaymentBooking = async (
  request: Request,
  response: Response
) => {
  const { id, role } = request;
  const { serviceId, number, name, cvc, month, year, advisorId } = request.body;

  if (!id || !role) {
    return response.status(401).send({ message: "Unauthorized" });
  }

  if (role !== "user") {
    return response.status(403).send({ message: "Forbidden" });
  }

  try {
    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService || !foundService.status)
      return response.status(400).send({ message: "الخدمة غير موجودة" });

    const foundBooking = await BookingModel.findOne({ serviceId, userId: id });

    if (foundBooking)
      return response.status(400).send({ message: "الحجز موجود" });

    const foundAdmin = await AdminModel.findById(advisorId);
    if (!foundAdmin || foundAdmin.role !== "advisor")
      return response.status(400).send({ message: "حساب المستشار غير موجود" });

    const foundStages = await StageModel.find({
      "service.id": serviceId,
      status: true,
    });
    if (foundStages.length === 0)
      return response.status(400).send({ message: "الخدمة غير مكتملة" });

    const url = "https://api.moyasar.com/v1/payments";
    const amount = foundService.price * 100;
    const callback_url = `${domain}/user/payment/mada/booking/callback`;
    const description = `الدفع لطلب الخدمة ${foundService.name} من منصة دفّة`;

    try {
      const { data } = await axios.post(url, {
        publishable_api_key,
        amount,
        callback_url,
        description,
        source: {
          type: "creditcard",
          name,
          number,
          year,
          month,
          cvc,
        },
      });
      await PaymentModel.create({
        userId: id,
        adminId: foundAdmin._id,
        status: "initiated",
        price: foundService.price,
        type: "card",
        serviceType: "booking",
        paymentId: data.id,
        serviceId,
      });
      return response.status(200).send({ url: data.source.transaction_url });
    } catch (err) {
      const error = err as AxiosError;
      if (!error.response) {
        return response
          .status(400)
          .send({ message: "لا يوجد استجابة يرجى المحاولة لاحقاً" });
      } else {
        return response
          .status(error.response.status)
          .send({ message: "يرجى التحقق من معلومات البطاقة" });
      }
    }
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما، يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const madaPaymentArbitration = async (
  request: Request,
  response: Response
) => {
  const { id, role } = request;
  const { serviceId, number, name, cvc, month, year, arbitratorId } =
    request.body;

  if (!id || !role) {
    return response.status(401).send({ message: "Unauthorized" });
  }

  if (role !== "user") {
    return response.status(403).send({ message: "Forbidden" });
  }

  try {
    const foundAdmin = await AdminModel.findById(arbitratorId);
    if (!foundAdmin || foundAdmin.role !== "arbitrator")
      return response.status(400).send({ message: "حساب المحكم غير موجود" });

    const foundService = await ServiceModel.findById(serviceId);
    if (!foundService)
      return response.status(400).send({ message: "الخدمة غير موجودة" });

    const foundBooking = await BookingModel.findOne({ serviceId, userId: id });

    if (!foundBooking)
      return response.status(400).send({ message: "الحجز غير موجود" });

    if (foundBooking.status !== "endAdvisor")
      return response.status(400).send({ message: "عذراً لا يمكنك المتابعة" });

    const url = "https://api.moyasar.com/v1/payments";
    const amount = foundService.arbitrationPrice * 100;

    const callback_url = `${domain}/user/payment/mada/arbitration/callback`;
    const description = `الدفع لطلب خدمة التحكيم من منصة دفّة`;

    try {
      const { data } = await axios.post(url, {
        publishable_api_key,
        amount,
        callback_url,
        description,
        source: {
          type: "creditcard",
          name,
          number,
          year,
          month,
          cvc,
        },
      });
      await PaymentModel.create({
        userId: id,
        adminId: foundAdmin._id,
        status: "initiated",
        price: foundService.arbitrationPrice,
        type: "card",
        serviceType: "arbitration",
        paymentId: data.id,
        serviceId,
      });
      return response.status(200).send({ url: data.source.transaction_url });
    } catch (err) {
      const error = err as AxiosError;
      if (!error.response) {
        return response
          .status(400)
          .send({ message: "لا يوجد استجابة يرجى المحاولة لاحقاً" });
      } else {
        return response
          .status(error.response.status)
          .send({ message: "يرجى التحقق من معلومات البطاقة" });
      }
    }
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما، يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const madaPaymentBookingCallback = async (
  request: Request,
  response: Response
) => {
  try {
    const id = request.query.id || "";
    const status = request.query.status || "";
    const message = request.query.message || "";

    const foundPayment = await PaymentModel.findOne({
      paymentId: id,
      status: "initiated",
    });

    if (!foundPayment)
      return response.status(400).send({ message: "لم يتم العثور على الخدمة" });

    if (status === "paid") {
      await PaymentModel.updateOne(
        { _id: foundPayment._id },
        { status: "success" }
      );

      const foundStages = await StageModel.find({
        "service.id": foundPayment.serviceId,
        status: true,
      });

      const currentStage = foundStages[0]._id;

      const conversation = await ConversationModel.create({
        userId: foundPayment.userId,
        adminId: foundPayment.adminId,
        adminRole: "advisor",
      });

      await BookingModel.create({
        userId: foundPayment.userId,
        advisorId: foundPayment.adminId,
        serviceId: foundPayment.serviceId,
        conversationId: conversation._id,
        status: "inProgress",
        currentStage,
        stages: foundStages,
      });

      return response.redirect(`${frontDomain}?status=success`);
    } else {
      await PaymentModel.updateOne(
        { _id: foundPayment._id },
        { status: "field", fieldReason: message }
      );
      return response.redirect(
        `${frontDomain}?status=failed&message=${message}`
      );
    }
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما، يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const madaPaymentArbitrationCallback = async (
  request: Request,
  response: Response
) => {
  try {
    const id = request.query.id || "";
    const status = request.query.status || "";
    const message = request.query.message || "";

    const foundPayment = await PaymentModel.findOne({
      paymentId: id,
      status: "initiated",
    });

    if (!foundPayment)
      return response.status(400).send({ message: "لم يتم العثور على الخدمة" });

    const foundBooking = await BookingModel.findOne({
      userId: foundPayment.userId,
      serviceId: foundPayment.serviceId,
    });

    if (!foundBooking)
      return response.status(400).send({ message: "الحجز غير موجود" });

    if (status === "paid") {
      await PaymentModel.updateOne(
        { _id: foundPayment._id },
        { status: "success" }
      );

      const conversation = await ConversationModel.create({
        userId: foundPayment.userId,
        adminId: foundPayment.adminId,
        adminRole: "arbitrator",
      });

      await BookingModel.updateOne(
        { _id: foundBooking._id },
        {
          status: "arbitration",
          arbitrationConversationId: conversation._id,
        }
      );

      return response.redirect(`${frontDomain}?status=success`);
    } else {
      await PaymentModel.updateOne(
        { _id: foundPayment._id },
        { status: "field", fieldReason: message }
      );
      return response.redirect(
        `${frontDomain}?status=failed&message=${message}`
      );
    }
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما، يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const madaPaymentDesign = async (
  request: Request,
  response: Response
) => {
  const { id, role } = request;
  const { serviceId, number, name, cvc, month, year } = request.body;

  if (!id || !role) {
    return response.status(401).send({ message: "Unauthorized" });
  }

  if (role !== "user") {
    return response.status(403).send({ message: "Forbidden" });
  }

  try {
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

    const foundBooking = await BookingModel.findOne({ serviceId, userId: id });

    if (!foundBooking)
      return response.status(400).send({ message: "الحجز غير موجود" });

    if (
      foundBooking.status !== "endArbitration" &&
      foundBooking.status !== "endAdvisor"
    )
      return response.status(400).send({ message: "عذراً لا يمكنك المتابعة" });

    const url = "https://api.moyasar.com/v1/payments";
    const amount = foundService.designPrice * 100;

    const callback_url = `${domain}/user/payment/mada/arbitration/callback`;
    const description = `الدفع لطلب خدمة التصميم من منصة دفّة`;

    try {
      const { data } = await axios.post(url, {
        publishable_api_key,
        amount,
        callback_url,
        description,
        source: {
          type: "creditcard",
          name,
          number,
          year,
          month,
          cvc,
        },
      });
      await PaymentModel.create({
        userId: id,
        adminId: designerId,
        status: "initiated",
        price: foundService.designPrice,
        type: "card",
        serviceType: "design",
        paymentId: data.id,
        serviceId,
      });
      return response.status(200).send({ url: data.source.transaction_url });
    } catch (err) {
      const error = err as AxiosError;
      if (!error.response) {
        return response
          .status(400)
          .send({ message: "لا يوجد استجابة يرجى المحاولة لاحقاً" });
      } else {
        return response
          .status(error.response.status)
          .send({ message: "يرجى التحقق من معلومات البطاقة" });
      }
    }
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما، يرجى المحاولة لاحقاً",
      error,
    });
  }
};


export const madaPaymentDesignCallback = async (
  request: Request,
  response: Response
) => {
  try {
    const id = request.query.id || "";
    const status = request.query.status || "";
    const message = request.query.message || "";

    const foundPayment = await PaymentModel.findOne({
      paymentId: id,
      status: "initiated",
    });

    if (!foundPayment)
      return response.status(400).send({ message: "لم يتم العثور على الخدمة" });

    const foundBooking = await BookingModel.findOne({
      userId: foundPayment.userId,
      serviceId: foundPayment.serviceId,
    });

    if (!foundBooking)
      return response.status(400).send({ message: "الحجز غير موجود" });

    if (status === "paid") {
      await PaymentModel.updateOne(
        { _id: foundPayment._id },
        { status: "success" }
      );

      const conversation = await ConversationModel.create({
        userId: foundPayment.userId,
        adminId: foundPayment.adminId,
        adminRole: "designer",
      });

      await BookingModel.updateOne(
        { _id: foundBooking._id },
        {
          status: "design",
          designConversationId: conversation._id,
        }
      );

      return response.redirect(`${frontDomain}?status=success`);
    } else {
      await PaymentModel.updateOne(
        { _id: foundPayment._id },
        { status: "field", fieldReason: message }
      );
      return response.redirect(
        `${frontDomain}?status=failed&message=${message}`
      );
    }
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما، يرجى المحاولة لاحقاً",
      error,
    });
  }
};