import { Router } from "express";
import { getPayments } from "../controller/payment.controller";
import validateResource from "../middleware/validateResource";
import verifyJwtToken from "../middleware/verifyJwtToken";
import { getPaymentsSchema } from "../schema/payment.schema";

const PaymentRouter = Router();

PaymentRouter.get(
  "/",
  validateResource(getPaymentsSchema),
  verifyJwtToken,
  getPayments
);

export default PaymentRouter;
