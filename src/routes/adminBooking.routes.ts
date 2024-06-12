import { Router } from "express";
import {
  acceptArbitrationBooking,
  acceptBooking,
  acceptDesignBooking,
  adminCloseArbitrationBooking,
  adminCloseDesignBooking,
  getAdminBooking,
  getArbitrationInformation,
  getBooking,
  getBookingInformation,
  getCompleteBookingInformation,
  getCurrentBookingStages,
  getDesignInformation,
  rejectArbitrationBooking,
  rejectBooking,
  rejectDesignBooking,
  skipStage,
} from "../controller/adminBooking.controller";
import validate from "../middleware/validateResource";
import verifyJwtToken from "../middleware/verifyJwtToken";
import {
  acceptOrRejectBookingSchema,
  adminSkipSchema,
  closeBookingSchema,
  getBookingStagesSchema,
  getBookingsSchema,
} from "../schema/booking.schema";

const AdminBookingRouter = Router();

AdminBookingRouter.get(
  "/",
  verifyJwtToken,
  validate(getBookingsSchema),
  getBooking
);
AdminBookingRouter.get(
  "/service-provider",
  verifyJwtToken,
  validate(getBookingsSchema),
  getAdminBooking
);
AdminBookingRouter.post(
  "/skip",
  verifyJwtToken,
  validate(adminSkipSchema),
  skipStage
);
AdminBookingRouter.get(
  "/service-provider/:bookingId",
  verifyJwtToken,
  validate(getBookingStagesSchema),
  getCurrentBookingStages,
  getBookingInformation,
  getArbitrationInformation,
  getDesignInformation,
  getCompleteBookingInformation
);

AdminBookingRouter.post(
  "/booking/accept",
  verifyJwtToken,
  validate(acceptOrRejectBookingSchema),
  acceptBooking
);

AdminBookingRouter.post(
  "/design/accept",
  verifyJwtToken,
  validate(acceptOrRejectBookingSchema),
  acceptDesignBooking
);

AdminBookingRouter.post(
  "/arbitration/accept",
  verifyJwtToken,
  validate(acceptOrRejectBookingSchema),
  acceptArbitrationBooking
);

AdminBookingRouter.post(
  "/booking/reject",
  verifyJwtToken,
  validate(acceptOrRejectBookingSchema),
  rejectBooking
);
AdminBookingRouter.post(
  "/design/reject",
  verifyJwtToken,
  validate(acceptOrRejectBookingSchema),
  rejectDesignBooking
);
AdminBookingRouter.post(
  "/arbitration/reject",
  verifyJwtToken,
  validate(acceptOrRejectBookingSchema),
  rejectArbitrationBooking
);

AdminBookingRouter.post(
  "/design/close",
  verifyJwtToken,
  validate(closeBookingSchema),
  adminCloseDesignBooking
);
AdminBookingRouter.post(
  "/arbitration/close",
  verifyJwtToken,
  validate(closeBookingSchema),
  adminCloseArbitrationBooking
);

export default AdminBookingRouter;
