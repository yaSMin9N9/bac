import bcrypt from "bcrypt";
import config from "config";
import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { JwtPayload, verify, decode } from "jsonwebtoken";
import UserModel from "../models/user.model";
import UserOtpModel from "../models/userOtp.model";
import { storeFile } from "../service/file.service";
import { cookieMaxAge, signJwtCookie } from "../service/jwt.service";
import {
  createUser,
  findAndUpdateUser,
  getGoogleOAuthTokens,
  getGoogleUser,
} from "../service/user.service";
import { sendOtpVerificationEmail } from "../service/userAuth.service";

const refreshTokenSecret = config.get<string>("refreshTokenSecret");
const salt = parseInt(config.get<string>("saltWorkFactor"));
const frontDomain = config.get<string>("frontDomain");

export const userRegister = async (request: Request, response: Response) => {
  try {
    const file = request.files!.image as UploadedFile;
    const { email, firstName, lastName, password } = request.body;
    const foundUser = await UserModel.findOne({ email }).exec();
    if (foundUser)
      return response
        .status(406)
        .send({ message: "البريد الالكتروني موجود مسبقاً" });
    const image = storeFile("users", file);
    const user = await createUser({
      email,
      firstName,
      lastName,
      password,
      image,
    });
    await sendOtpVerificationEmail({ email, _id: user._id });
    return response.status(201).send({
      message: "تم ارسال رمز التحقق إلى بريدك الالكتروني",
      userId: user._id,
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const verifyOtp = async (request: Request, response: Response) => {
  try {
    const { userId, otp } = request.body;
    const userOtp = await UserOtpModel.find({ userId });
    if (userOtp.length === 0)
      return response
        .status(406)
        .send({ error: "لم يتم ارسال رمز التحقق إلى هذا الحساب" });
    const { expiresAt, otp: hashedOTP } = userOtp[userOtp.length - 1];
    if (expiresAt.getTime() < Date.now()) {
      await UserOtpModel.deleteMany({ userId });
      return response
        .status(406)
        .send({ error: "تم انتهاء مدة رمز التحقق يرجى طلب رمز جديد" });
    }
    const validOTP = await bcrypt.compare(otp, hashedOTP);
    if (!validOTP)
      return response.status(408).send({ error: "رمز التحقق غير صحيح" });
    await UserModel.updateOne({ _id: userId }, { isVerified: true });
    await UserOtpModel.deleteMany({ userId });
    const foundUser = await UserModel.findOne({ _id: userId }).exec();
    if (!foundUser) return response.status(500);
    const { firstName, lastName, email, image, _id, createdAt } = foundUser;
    const { accessToken, refreshToken } = signJwtCookie({
      id: userId._id,
      role: "user",
    });
    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: cookieMaxAge,
    });

    return response.status(200).send({
      message: "تم التحقق من الحساب بنجاح",
      user: { firstName, lastName, email, image, _id, createdAt, accessToken },
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const userLogin = async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body;
    const foundUser = await UserModel.findOne({ email }).exec();
    if (!foundUser)
      return response.status(406).send({ message: "الحساب غير موجود" });
    const compare = await foundUser.comparePassword(password);
    if (!compare)
      return response.status(408).send({ message: "كلمة المرور خاطئة" });
    if (!foundUser.isVerified)
      return response
        .status(409)
        .send({ message: "يجب تأكيد الحساب قبل المتابعة" });

    const {
      firstName,
      lastName,
      email: userEmail,
      image,
      _id,
      createdAt,
    } = foundUser;
    const { accessToken, refreshToken } = signJwtCookie({
      id: _id,
      role: "user",
    });
    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: cookieMaxAge,
    });

    return response.status(200).send({
      message: "تم تسجيل الدخول بنجاح",
      user: {
        firstName,
        lastName,
        email: userEmail,
        image,
        createdAt,
        accessToken,
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
        const foundUser = await UserModel.findById(id).exec();
        if (!foundUser)
          return response.status(401).json({ message: "Unauthorized" });
        const { accessToken } = signJwtCookie({
          id: foundUser._id,
          role: "user",
        });

        return response.status(200).send({
          user: {
            accessToken,
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            email: foundUser.email,
            image: foundUser.image,
            createdAt: foundUser.createdAt,
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

export const userResendCode = async (request: Request, response: Response) => {
  try {
    const { userId } = request.body;
    const foundUser = await UserModel.findById(userId).exec();
    if (!foundUser)
      return response.status(406).send({ message: "الحساب غير موجود" });
    await UserOtpModel.deleteMany({ userId });
    await sendOtpVerificationEmail({ email: foundUser.email, _id: userId });
    return response.status(200).send({
      message: "تم ارسال رمز التحقق إلى بريدك الالكتروني",
      userId,
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const userForgotPassword = async (
  request: Request,
  response: Response
) => {
  try {
    const { email } = request.body;
    const foundUser = await UserModel.findOne({ email }).exec();
    if (!foundUser)
      return response.status(406).send({ message: "الحساب غير موجود" });
    await UserOtpModel.deleteMany({ email });
    await sendOtpVerificationEmail(
      {
        email: foundUser.email,
        _id: foundUser._id,
      },
      true
    );
    return response.status(200).send({
      message: "تم ارسال رمز التحقق إلى بريدك الالكتروني",
      userId: foundUser._id,
    });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const userResetPassword = async (
  request: Request,
  response: Response
) => {
  try {
    const { otp, password, userId } = request.body;
    const foundUser = await UserModel.findOne({ _id: userId }).exec();
    if (!foundUser)
      return response.status(406).send({ message: "الحساب غير موجود" });
    const userOtp = await UserOtpModel.find({ userId });
    if (userOtp.length === 0)
      return response
        .status(406)
        .send({ error: "لم يتم ارسال رمز التحقق إلى هذا الحساب" });
    const { expiresAt, otp: hashedOTP } = userOtp[userOtp.length - 1];
    const validOTP = await bcrypt.compare(otp, hashedOTP);
    if (!validOTP)
      return response.status(408).send({ error: "رمز التحقق غير صحيح" });
    if (expiresAt.getTime() < Date.now()) {
      await UserOtpModel.deleteMany({ userId });
      return response
        .status(406)
        .send({ error: "تم انتهاء مدة رمز التحقق يرجى طلب رمز جديد" });
    }
    await UserOtpModel.deleteMany({ userId });
    const hash = await bcrypt.hash(password, salt);
    await UserModel.updateOne({ _id: userId }, { password: hash });
    return response.status(200).send({ message: "تم تعديل كلمة المرور بنجاح" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const userCheckCode = async (request: Request, response: Response) => {
  try {
    const { otp, userId } = request.body;
    const foundUser = await UserModel.findOne({ _id: userId }).exec();
    if (!foundUser)
      return response.status(406).send({ message: "الحساب غير موجود" });
    const userOtp = await UserOtpModel.find({ userId });
    if (userOtp.length === 0)
      return response
        .status(406)
        .send({ error: "لم يتم ارسال رمز التحقق إلى هذا الحساب" });
    const { expiresAt, otp: hashedOTP } = userOtp[userOtp.length - 1];
    const validOTP = await bcrypt.compare(otp, hashedOTP);
    if (!validOTP)
      return response.status(408).send({ error: "رمز التحقق غير صحيح" });
    if (expiresAt.getTime() < Date.now()) {
      await UserOtpModel.deleteMany({ userId });
      return response
        .status(406)
        .send({ error: "تم انتهاء مدة رمز التحقق يرجى طلب رمز جديد" });
    }
    return response
      .status(200)
      .send({ message: "رمز التحقق صحيح يمكنك الآن تغيير كلمة المرور" });
  } catch (error) {
    return response.status(500).send({
      message: "حدث خطأ ما, يرجى المحاولة لاحقاً",
      error,
    });
  }
};

export const loginWithGoogle = async (request: Request, response: Response) => {
  try {
    const code = request.query.code as string;
    const { id_token, access_token } = await getGoogleOAuthTokens({ code });
    const googleUser = await getGoogleUser({ access_token, id_token });
    if (!googleUser.verified_email) {
      return response.status(403).send("الحساب غير مفعّل");
    }
    const user = await findAndUpdateUser(
      {
        email: googleUser.email,
      },
      {
        email: googleUser.email,
        firstName: googleUser.given_name
          ? googleUser.given_name
          : googleUser.name,
        lastName: googleUser.family_name ? googleUser.family_name : "",
        image: googleUser.picture,
        isVerified: true,
      },
      { upsert: true, new: true }
    );

    if (!user) return response.redirect(`${frontDomain}/auth/error`);

    const { accessToken, refreshToken } = signJwtCookie({
      id: user?._id,
      role: "user",
    });

    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: cookieMaxAge,
    });
    return response.redirect(`${frontDomain}?token=${accessToken}`);
  } catch (error) {
    return response.redirect(`${frontDomain}/auth/error`);
  }
};
