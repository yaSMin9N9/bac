import { Router } from "express";
import fileUpload from "express-fileupload";
import {
  addOrEditAnswer,
  arbitrationRegisterByBank,
  bookingRegisterByBank,
  closeArbitrationBooking,
  closeDesignBooking,
  designRegisterByBank,
  getArbitrationInformation,
  getBookingInformation,
  getCurrentStage,
  getDesignInformation,
  getMyBooking,
  userSkipStage,
} from "../controller/booking.controller";
import validate from "../middleware/validateResource";
import verifyJwtToken from "../middleware/verifyJwtToken";
import {
  addOrEditAnswerSchema,
  arbitrationRegisterByBankSchema,
  bookingRegisterByBankSchema,
  closeBookingSchema,
  designRegisterByBankSchema,
  getCurrentStageSchema,
  getFilesSchema,
  userSkipStageSchema,
} from "../schema/booking.schema";

const UserBookingRouter = Router();

UserBookingRouter.get("/", verifyJwtToken, getMyBooking);
UserBookingRouter.post(
  "/bankRegister",
  fileUpload({ createParentPath: true }),
  verifyJwtToken,
  validate(bookingRegisterByBankSchema),
  bookingRegisterByBank
);
UserBookingRouter.post(
  "/design/bankRegister",
  fileUpload({ createParentPath: true }),
  verifyJwtToken,
  validate(designRegisterByBankSchema),
  designRegisterByBank
);
UserBookingRouter.post(
  "/arbitration/bankRegister",
  fileUpload({ createParentPath: true }),
  verifyJwtToken,
  validate(arbitrationRegisterByBankSchema),
  arbitrationRegisterByBank
);

UserBookingRouter.get(
  "/:serviceId",
  verifyJwtToken,
  validate(getCurrentStageSchema),
  getCurrentStage,
  getBookingInformation,
  getArbitrationInformation,
  getDesignInformation
);

UserBookingRouter.post(
  "/answer",
  verifyJwtToken,
  validate(addOrEditAnswerSchema),
  addOrEditAnswer
);

UserBookingRouter.post(
  "/skip",
  verifyJwtToken,
  validate(userSkipStageSchema),
  userSkipStage
);

UserBookingRouter.post(
  "/skip",
  verifyJwtToken,
  validate(userSkipStageSchema),
  userSkipStage
);
UserBookingRouter.post(
  "/design/close",
  verifyJwtToken,
  validate(closeBookingSchema),
  closeDesignBooking
);
UserBookingRouter.post(
  "/arbitration/close",
  verifyJwtToken,
  validate(closeBookingSchema),
  closeArbitrationBooking
);

export default UserBookingRouter;
