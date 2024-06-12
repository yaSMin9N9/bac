import bcrypt from "bcrypt";
import config from "config";
import { Types } from "mongoose";
import transporter from "../../config/nodeMailerConfig";
import AdminOtpModel from "../models/adminOtp.model";
import log from "../utils/logger";

const senderEmail = config.get<string>("senderEmail");
const saltWorkFactor = parseInt(config.get<string>("saltWorkFactor"));

export const sendOtpEmail = async (req: {
  _id: Types.ObjectId;
  email: string;
}) => {
  const { email, _id } = req;
  try {
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    const mailOptions = {
      from: senderEmail,
      to: email,
      subject: "reset password",
      html: `<p>enter <strong>${otp}</strong> in the app to reset your password</p>`,
    };
    const hashedOTP = await bcrypt.hash(otp, saltWorkFactor);
    await AdminOtpModel.create({
      adminId: _id,
      otp: hashedOTP,
      expiresAt: Date.now() + 1000 * 60 * 60,
    });
    transporter.sendMail(mailOptions);
  } catch (error) {
    log.error(error);
    throw new Error(error as any);
  }
};
