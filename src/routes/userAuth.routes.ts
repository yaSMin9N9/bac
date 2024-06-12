import { Router } from "express";
import fileUpload from "express-fileupload";
import {
  loginWithGoogle,
  logout,
  refresh,
  userCheckCode,
  userForgotPassword,
  userLogin,
  userRegister,
  userResendCode,
  userResetPassword,
  verifyOtp,
} from "../controller/userAuth.controller";
import validateResource from "../middleware/validateResource";
import {
  checkCodeSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendCodeSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../schema/userAuth.schema";

const userAuthRouter = Router();

userAuthRouter.post(
  "/register",
  fileUpload({ createParentPath: true }),
  validateResource(registerSchema),
  userRegister
);

userAuthRouter.post(
  "/forgotPassword",
  validateResource(forgotPasswordSchema),
  userForgotPassword
);

userAuthRouter.get(
  "/oauth/google",
  loginWithGoogle
);

userAuthRouter.post(
  "/checkCode",
  validateResource(checkCodeSchema),
  userCheckCode
);
userAuthRouter.post(
  "/resetPassword",
  validateResource(resetPasswordSchema),
  userResetPassword
);
userAuthRouter.post("/verify", validateResource(verifyOtpSchema), verifyOtp);
userAuthRouter.post(
  "/resend",
  validateResource(resendCodeSchema),
  userResendCode
);
userAuthRouter.post("/login", validateResource(loginSchema), userLogin);
userAuthRouter.get("/refresh", refresh);
userAuthRouter.get("/logout", logout);

export default userAuthRouter;
