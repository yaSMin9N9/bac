import { Router } from "express";
import fileUpload from "express-fileupload";
import {
  AddAdmin,
  completeAdminProfile,
  deleteAdmin,
  editAdminProfile,
  getAdminInformation,
  getAllAdmins,
} from "../controller/admin.controller";
import validateResource from "../middleware/validateResource";
import verifyJwtToken from "../middleware/verifyJwtToken";
import {
  completeProfileSchema,
  createAdminSchema,
  deleteAdminSchema,
  editAdminProfileSchema,
  getAdminDataSchema,
  getAdminsSchema,
} from "../schema/admin.schema";

const AdminRouter = Router();

AdminRouter.get(
  "/",
  verifyJwtToken,
  validateResource(getAdminsSchema),
  getAllAdmins
);
AdminRouter.post(
  "/",
  // verifyJwtToken,
  fileUpload({ createParentPath: true }),
  validateResource(createAdminSchema),
  AddAdmin
);
AdminRouter.post(
  "/completeProfile",
  verifyJwtToken,
  fileUpload({ createParentPath: true }),
  validateResource(completeProfileSchema),
  completeAdminProfile
);
AdminRouter.post(
  "/editAdminProfile",
  verifyJwtToken,
  fileUpload({ createParentPath: true }),
  validateResource(editAdminProfileSchema),
  editAdminProfile
);
AdminRouter.delete(
  "/:adminId",
  verifyJwtToken,
  validateResource(deleteAdminSchema),
  deleteAdmin
);
AdminRouter.get(
  "/:type/:adminId",
  verifyJwtToken,
  validateResource(getAdminDataSchema),
  getAdminInformation
);

export default AdminRouter;
