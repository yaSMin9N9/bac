import nodemailer from "nodemailer";
import config from "config";
const senderEmail = config.get<string>("senderEmail");
const senderPassword = config.get<string>("senderPassword");
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: senderEmail,
    pass: senderPassword,
  },
});

export default transporter;
