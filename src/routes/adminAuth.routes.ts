import { Router } from "express";
import {
  adminCheckCode,
  adminForgotPassword,
  adminLogin,
  adminResendCode,
  adminResetPassword,
  logout,
  refresh
} from "../controller/adminAuth.controller";
import validateResource from "../middleware/validateResource";
import {
  checkCodeSchema,
  forgotPasswordSchema,
  loginSchema,
  resendCodeSchema,
  resetPasswordSchema,
} from "../schema/adminAuth.schema";

const adminAuthRouter = Router();

adminAuthRouter.post(
  "/forgotPassword",
  validateResource(forgotPasswordSchema),
  adminForgotPassword
);
adminAuthRouter.post(
  "/resetPassword",
  validateResource(resetPasswordSchema),
  adminResetPassword
);
adminAuthRouter.post(
  "/checkCode",
  validateResource(checkCodeSchema),
  adminCheckCode
);
adminAuthRouter.post(
  "/resend",
  validateResource(resendCodeSchema),
  adminResendCode
);
adminAuthRouter.post("/login", validateResource(loginSchema), adminLogin);
adminAuthRouter.get("/refresh", refresh);
adminAuthRouter.get("/logout", logout);

export default adminAuthRouter;
