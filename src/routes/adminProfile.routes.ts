import { Router } from "express";
import {
  changePassword,
  editProfile,
} from "../controller/adminProfile.controller";
import verifyJwtToken from "../middleware/verifyJwtToken";
import fileUpload from "express-fileupload";
import validateResource from "../middleware/validateResource";
import {
  changePasswordSchema,
  editProfileSchema,
} from "../schema/userProfile.schema";

const adminProfile = Router();

adminProfile.post(
  "/changePassword",
  verifyJwtToken,
  validateResource(changePasswordSchema),
  changePassword
);
adminProfile.put(
  "/editProfile",
  fileUpload({ createParentPath: true }),
  validateResource(editProfileSchema),
  verifyJwtToken,
  editProfile
);

export default adminProfile;
