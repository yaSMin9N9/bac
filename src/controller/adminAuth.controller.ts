import bcrypt from "bcrypt";
import config from "config";
import { Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import AdminModel from "../models/admin.model";
import AdminOtpModel from "../models/adminOtp.model";
import { sendOtpEmail } from "../service/adminAuth.service";
import { cookieMaxAge, signJwtCookie } from "../service/jwt.service";
import CompleteAdminProfileModel from "../models/completeAdminProfile.model";

const refreshTokenSecret = config.get<string>("refreshTokenSecret");
const salt = parseInt(config.get<string>("saltWorkFactor"));

export const adminLogin = async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body;
    const foundAdmin = await AdminModel.findOne({ email });
    if (!foundAdmin)
      return response.status(406).send({ message: "الحساب غير موجود" });
    const compare = await foundAdmin.comparePassword(password);
    if (!compare)
      return response.status(408).send({ message: "كلمة المرور خاطئة" });

    const { firstName, lastName, email: adminEmail, role, image } = foundAdmin;
    let profile = null;
    if (foundAdmin.role === "advisor" || foundAdmin.role === "arbitrator") {
      const completeProfile = await CompleteAdminProfileModel.findOne({
        adminId: foundAdmin._id,
      }).lean();
      if (completeProfile) profile = completeProfile;
    }
    const { accessToken, refreshToken } = signJwtCookie({
      id: foundAdmin._id,
      role: foundAdmin.role,
    });
    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: cookieMaxAge,
    });
    return response.status(200).send({
      message: "تم تسجيل الدخول بنجاح",
      admin: {
        id: foundAdmin._id,
        firstName,
        lastName,
        email: adminEmail,
        role,
        image,
        accessToken,
        profile,
      },
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const logout = async (request: Request, response: Response) => {
  try {
    const cookie = request.cookies;
    if (!cookie.refreshToken)
      return response.status(200).send({ message: "تم تسجيل الخروج بنجاح" });
    response.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return response.status(200).send({ message: "تم تسجيل الخروج بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const refresh = async (request: Request, response: Response) => {
  try {
    const cookie = request.cookies;
    if (!cookie.refreshToken)
      return response.status(401).json({ message: "Unauthorized" });
    verify(
      cookie.refreshToken as string,
      refreshTokenSecret,
      async (error, decoded) => {
        if (error)
          return response.status(401).json({ message: "Unauthorized" });
        if (!decoded)
          return response.status(401).json({ message: "Unauthorized" });
        const tokenData = decoded as JwtPayload;
        const id = tokenData.userInfo.id;
        const foundAdmin = await AdminModel.findById(id).lean();
        if (!foundAdmin)
          return response.status(401).json({ message: "Unauthorized" });
        const { accessToken } = signJwtCookie({
          id: foundAdmin._id,
          role: foundAdmin.role,
        });
        let profile = null;
        if (foundAdmin.role === "advisor" || foundAdmin.role === "arbitrator") {
          const completeProfile = await CompleteAdminProfileModel.findOne({
            adminId: foundAdmin._id,
          }).lean();
          if (completeProfile) profile = completeProfile;
        }
        return response.status(200).send({
          admin: {
            id: foundAdmin._id,
            firstName: foundAdmin.firstName,
            lastName: foundAdmin.lastName,
            email: foundAdmin.email,
            role: foundAdmin.role,
            image: foundAdmin.image,
            accessToken,
            profile,
          },
        });
      }
    );
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const adminResendCode = async (request: Request, response: Response) => {
  try {
    const { adminId } = request.body;
    const foundAdmin = await AdminModel.findById(adminId).exec();
    if (!foundAdmin)
      return response.status(406).send({ message: "الحساب غير موجود" });
    await AdminOtpModel.deleteMany({ adminId });
    await sendOtpEmail({ email: foundAdmin.email, _id: adminId });
    return response.status(200).send({
      message: "تم ارسال رمز التحقق إلى بريدك الالكتروني",
      adminId,
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const adminForgotPassword = async (
  request: Request,
  response: Response
) => {
  try {
    const { email } = request.body;
    const foundAdmin = await AdminModel.findOne({ email }).lean();
    if (!foundAdmin)
      return response.status(406).send({ message: "الحساب غير موجود" });
    await AdminOtpModel.deleteMany({ email });
    await sendOtpEmail({
      email: foundAdmin.email,
      _id: foundAdmin._id,
    });
    return response.status(200).send({
      message: "تم ارسال رمز التحقق إلى بريدك الالكتروني",
      adminId: foundAdmin._id,
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const adminResetPassword = async (
  request: Request,
  response: Response
) => {
  try {
    const { otp, password, adminId } = request.body;
    const foundAdmin = await AdminModel.findOne({ _id: adminId }).lean();
    if (!foundAdmin)
      return response.status(406).send({ message: "الحساب غير موجود" });
    const adminOtp = await AdminOtpModel.find({ adminId });
    if (adminOtp.length === 0)
      return response
        .status(408)
        .send({ error: "لم يتم ارسال رمز التحقق إلى هذا الحساب" });
    const { expiresAt, otp: hashedOTP } = adminOtp[adminOtp.length - 1];
    const validOTP = await bcrypt.compare(otp, hashedOTP);
    if (!validOTP)
      return response.status(408).send({ error: "رمز التحقق غير صحيح" });
    if (expiresAt.getTime() < Date.now()) {
      await AdminOtpModel.deleteMany({ adminId });
      return response
        .status(406)
        .send({ error: "تم انتهاء مدة رمز التحقق يرجى طلب رمز جديد" });
    }
    await AdminOtpModel.deleteMany({ adminId });
    const hash = await bcrypt.hash(password, salt);
    await AdminModel.updateOne({ _id: adminId }, { password: hash });
    return response.status(200).send({ message: "تم تعديل كلمة المرور بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const adminCheckCode = async (request: Request, response: Response) => {
  try {
    const { otp, adminId } = request.body;
    const foundAdmin = await AdminModel.findOne({ _id: adminId }).exec();
    if (!foundAdmin)
      return response.status(406).send({ message: "الحساب غير موجود" });
    const adminOtp = await AdminOtpModel.find({ adminId });
    if (adminOtp.length === 0)
      return response
        .status(406)
        .send({ message: "لم يتم ارسال رمز التحقق إلى هذا الحساب" });
    const { expiresAt, otp: hashedOTP } = adminOtp[adminOtp.length - 1];
    const validOTP = await bcrypt.compare(otp, hashedOTP);
    if (!validOTP)
      return response.status(408).send({ message: "رمز التحقق غير صحيح" });
    if (expiresAt.getTime() < Date.now()) {
      return response
        .status(406)
        .send({ message: "تم انتهاء مدة رمز التحقق يرجى طلب رمز جديد" });
    }
    return response
      .status(200)
      .send({ message: "رمز التحقق صحيح يمكنك الآن إعادة تعيين كلمة المرور" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};
