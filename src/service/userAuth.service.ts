import bcrypt from "bcrypt";
import config from "config";
import { Types } from "mongoose";
import { SendMailOptions } from "nodemailer";
import transporter from "../../config/nodeMailerConfig";
import UserOtpModel from "../models/userOtp.model";
import log from "../utils/logger";

const senderEmail = config.get<string>("senderEmail");

export const sendOtpVerificationEmail = async (
  req: {
    _id: Types.ObjectId;
    email: string;
  },
  forgotPassword?: boolean
) => {
  const { email, _id } = req;
  try {
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    let mailOptions: SendMailOptions = {
      from: senderEmail,
      to: email,
      subject: "Verify your email",
      html: `<p>enter <strong>${otp}</strong> in the app to verify your account</p>`,
    };
    if (forgotPassword) {
      mailOptions = {
        from: senderEmail,
        to: email,
        subject: "reset password",
        html: `<p>enter <strong>${otp}</strong> in the app to reset your password</p>`,
      };
    }
    const saltRound = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRound);
    await UserOtpModel.create({
      userId: _id,
      otp: hashedOTP,
      expiresAt: Date.now() + 1000 * 60 * 60,
    });
    transporter.sendMail(mailOptions);
  } catch (error) {
    log.error(error);
    throw new Error(error as any);
  }
};
