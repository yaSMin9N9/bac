import config from "config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import corsOptions from "../config/corsOptions";
import databaseConnect from "../config/databaseConnect";
import AdminRouter from "./routes/admin.routes";
import adminAuthRouter from "./routes/adminAuth.routes";
import AdminBookingRouter from "./routes/adminBooking.routes";
import adminProfile from "./routes/adminProfile.routes";
import UserBookingRouter from "./routes/booking.routes";
import UserConversationRouter from "./routes/conversation.routes";
import GuidanceRouter from "./routes/guidance.routes";
import PaymentRouter from "./routes/payement.routes";
import QuestionRouter from "./routes/question.routes";
import servicesRouter from "./routes/service.routes";
import StageRouter from "./routes/stage.routes";
import userRouter from "./routes/user.routes";
import userAuthRouter from "./routes/userAuth.routes";
import userProfile from "./routes/userProfile.routes";
import UserServicesRouter from "./routes/userServices.routes";
import VideoRouter from "./routes/video.routes";
import logger from "./utils/logger";
import UserPaymentRouter from "./routes/userPayment.routes";
import AdminConversationRouter from "./routes/adminConversation.routes";
import UserContactRoute from "./routes/contact.routes";
import AdminContactRoute from "./routes/adminContact.routes";

const port = config.get<number>("port");
const app = express();
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/user/auth", userAuthRouter);
app.use("/user/profile", userProfile);
app.use("/user/services", UserServicesRouter);
app.use("/user/booking", UserBookingRouter);
app.use("/user/conversation", UserConversationRouter);
app.use("/user/payment", UserPaymentRouter);
app.use("/user/contact", UserContactRoute);

app.use("/admin/services", servicesRouter);
app.use("/admin/auth", adminAuthRouter);
app.use("/admin/profile", adminProfile);
app.use("/admin/users", userRouter);
app.use("/admin/admins", AdminRouter);
app.use("/admin/videos", VideoRouter);
app.use("/admin/guidances", GuidanceRouter);
app.use("/admin/questions", QuestionRouter);
app.use("/admin/stages", StageRouter);
app.use("/admin/booking", AdminBookingRouter);
app.use("/admin/payment", PaymentRouter);
app.use("/admin/conversation", AdminConversationRouter);
app.use("/admin/contact", AdminContactRoute);

app.use("/static", express.static("static"));
app.all("*", (_, res) => res.status(404).send({ message: "404 not found" }));

databaseConnect();

mongoose.connection.once("open", () => {
  logger.info(`connected to database`);
  app.listen(port, async () => {
    logger.info(`app running at http://localhost:${port}`);
  });
});

mongoose.connection.on("error", (error) => {
  logger.error(error);
});
