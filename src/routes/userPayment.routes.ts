import { Router } from "express";
import {
  madaPaymentArbitration,
  madaPaymentArbitrationCallback,
  madaPaymentBooking,
  madaPaymentBookingCallback,
  madaPaymentDesign,
  madaPaymentDesignCallback,
} from "../controller/userPayment.controller";
import validateResource from "../middleware/validateResource";
import verifyJwtToken from "../middleware/verifyJwtToken";
import {
  madaArbitrationSchema,
  madaBookingSchema,
  madaDesignSchema,
} from "../schema/userPayment.schema";

const UserPaymentRouter = Router();

UserPaymentRouter.post(
  "/mada/booking",
  verifyJwtToken,
  validateResource(madaBookingSchema),
  madaPaymentBooking
);
UserPaymentRouter.get("/mada/booking/callback", madaPaymentBookingCallback);

UserPaymentRouter.post(
  "/mada/arbitration",
  verifyJwtToken,
  validateResource(madaArbitrationSchema),
  madaPaymentArbitration
);
UserPaymentRouter.get(
  "/mada/arbitration/callback",
  madaPaymentArbitrationCallback
);

UserPaymentRouter.post(
  "/mada/design",
  verifyJwtToken,
  validateResource(madaDesignSchema),
  madaPaymentDesign
);
UserPaymentRouter.get(
  "/mada/design/callback",
  madaPaymentDesignCallback
);

export default UserPaymentRouter;
