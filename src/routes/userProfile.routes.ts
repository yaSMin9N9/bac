import { Router } from "express";
import {
  changePassword,
  editProfile,
} from "../controller/userProfile.controller";
import verifyJwtToken from "../middleware/verifyJwtToken";
import fileUpload from "express-fileupload";
import validateResource from "../middleware/validateResource";
import {
  changePasswordSchema,
  editProfileSchema,
} from "../schema/userProfile.schema";

const userProfile = Router();

userProfile.post(
  "/changePassword",
  verifyJwtToken,
  validateResource(changePasswordSchema),
  changePassword
);
userProfile.put(
  "/editProfile",
  fileUpload({ createParentPath: true }),
  validateResource(editProfileSchema),
  verifyJwtToken,
  editProfile
);

export default userProfile;
