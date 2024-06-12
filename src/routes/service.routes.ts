import { Router } from "express";
import fileUpload from "express-fileupload";
import {
  addAdvisor,
  changeServiceStatus,
  createService,
  deleteService,
  getServices,
  removeAdvisor,
  updateService,
} from "../controller/service.controller";
import validateResource from "../middleware/validateResource";
import verifyJwtToken from "../middleware/verifyJwtToken";
import {
  addAdvisorSchema,
  addServiceSchema,
  changeServiceStatusSchema,
  deleteServiceSchema,
  editServiceSchema,
} from "../schema/service.schema";

const servicesRouter = Router();

servicesRouter.get("/", verifyJwtToken, getServices);
servicesRouter.get(
  "/changeStatus/:serviceId",
  verifyJwtToken,
  validateResource(changeServiceStatusSchema),
  changeServiceStatus
);
servicesRouter.post(
  "/",
  fileUpload({ createParentPath: true }),
  verifyJwtToken,
  validateResource(addServiceSchema),
  createService
);
servicesRouter.put(
  "/:serviceId",
  fileUpload({ createParentPath: true }),
  verifyJwtToken,
  validateResource(editServiceSchema),
  updateService
);

servicesRouter.delete(
  "/:serviceId",
  verifyJwtToken,
  validateResource(deleteServiceSchema),
  deleteService
);

servicesRouter.post(
  "/addAdvisor",
  verifyJwtToken,
  validateResource(addAdvisorSchema),
  addAdvisor
);
servicesRouter.post(
  "/removeAdvisor",
  verifyJwtToken,
  validateResource(addAdvisorSchema),
  removeAdvisor
);

export default servicesRouter;
