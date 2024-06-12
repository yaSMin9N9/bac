import { Router } from "express";
import { getUserServices } from "../controller/service.controller";
import { getAdvisors, getArbitrators } from "../controller/admin.controller";
import validateResource from "../middleware/validateResource";
import { getAdvisorsSchema } from "../schema/service.schema";

const UserServicesRouter = Router();

UserServicesRouter.get("/", getUserServices);
UserServicesRouter.get(
  "/getAdvisors/:serviceId",
  validateResource(getAdvisorsSchema),
  getAdvisors
);
UserServicesRouter.get("/getArbitrators", getArbitrators);

export default UserServicesRouter;
