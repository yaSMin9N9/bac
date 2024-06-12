import { Router } from "express";
import {
  addGuidance,
  deleteGuidance,
  getStageGuidances,
  updateGuidance,
} from "../controller/guidance.controller";
import validateResource from "../middleware/validateResource";
import verifyJwtToken from "../middleware/verifyJwtToken";
import {
  createGuidanceSchema,
  deleteGuidanceSchema,
  getGuidanceSchema,
  updateGuidanceSchema,
} from "../schema/guidance..schema";

const GuidanceRouter = Router();

GuidanceRouter.get(
  "/:stageId",
  validateResource(getGuidanceSchema),
  verifyJwtToken,
  getStageGuidances
);
GuidanceRouter.post(
  "/",
  validateResource(createGuidanceSchema),
  verifyJwtToken,
  addGuidance
);
GuidanceRouter.delete(
  "/:guidanceId",
  validateResource(deleteGuidanceSchema),
  verifyJwtToken,
  deleteGuidance
);
GuidanceRouter.put(
  "/:guidanceId",
  validateResource(updateGuidanceSchema),
  verifyJwtToken,
  updateGuidance
);

export default GuidanceRouter;
