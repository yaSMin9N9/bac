import { Request, Response } from "express";
import AdminModel from "../models/admin.model";
import PaymentModel from "../models/payment.model";
import ServiceModel from "../models/service.model";
import UserModel from "../models/user.model";
import BookingModel from "../models/booking.model";

export const getPayments = async (request: Request, response: Response) => {
  const { id, role: role } = request;
  if (!id) return response.status(401).send({ message: "Unauthorized" });
  if (!role) return response.status(401).send({ message: "Unauthorized" });
  if (role !== "superAdmin")
    return response.status(401).send({ message: "Forbidden" });
  const page = request.query.page
    ? parseInt(request.query.page as string) - 1
    : 0;
  const count = request.query.count
    ? parseInt(request.query.count as string)
    : 5;
  const status = request.query.status || "";
  let query: any = {};
  if (status) {
    query = {
      status,
    };
  }
  const foundPayments = await PaymentModel.find(query)
    .skip(page * count)
    .limit(count)
    .sort({ createdAt: "desc" })
    .select("-updatedAt");
  const totalCounts = await PaymentModel.countDocuments(query);
  let payments: any[] = [];

  for (let i = 0; i < foundPayments.length; i++) {
    const service = await ServiceModel.findById(foundPayments[i].serviceId)
      .select("-hasVideos -status -createdAt -updatedAtx")
      .lean();
    const user = await UserModel.findById(foundPayments[i].userId)
      .select("firstName lastName")
      .lean();
    const admin = await AdminModel.findById(foundPayments[i].adminId)
      .select("-password -createdAt -role -updatedAt")
      .lean();
    const booking = await BookingModel.findOne({
      serviceId: foundPayments[i].serviceId,
      userId: foundPayments[i].userId
    })
      .select("_id")
      .lean();

    payments[i] = {
      _id: foundPayments[i]._id,
      status: foundPayments[i].status,
      bookingId: booking ? booking._id : "",
      createdAt: foundPayments[i].createdAt,
      serviceType: foundPayments[i].serviceType,
      fieldReason: foundPayments[i].fieldReason,
      attachment: foundPayments[i].attachment,
      price: foundPayments[i].price,
      type: foundPayments[i].type,
      service: `${service?.name || ""}`,
      user: `${user?.firstName || ""} ${user?.lastName || ""}`,
      admin: `${admin?.firstName || ""} ${admin?.lastName || ""}`,
    };
  }

  response.status(200).json({
    payments,
    pagination: {
      total: totalCounts,
      page: page + 1,
      count,
      lastPage: Math.ceil(totalCounts / count) || 1,
    },
  });
};
