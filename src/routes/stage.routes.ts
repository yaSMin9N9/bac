import { Router } from "express";
import {
  addStage,
  changeStageStatus,
  editStage,
  getStages,
} from "../controller/stage.controller";
import validateResource from "../middleware/validateResource";
import {
  changeStatusStageSchema,
  createStageSchema,
  editStageSchema,
  getStagesSchema,
} from "../schema/stage.schema";
import verifyJwtToken from "../middleware/verifyJwtToken";
import fileUpload from "express-fileupload";

const StageRouter = Router();

StageRouter.get(
  "/:serviceId",
  validateResource(getStagesSchema),
  verifyJwtToken,
  getStages
);
StageRouter.post(
  "/",
  fileUpload({ createParentPath: true }),
  validateResource(createStageSchema),
  verifyJwtToken,
  addStage
);
StageRouter.get(
  "/changeStatus/:stageId",
  validateResource(changeStatusStageSchema),
  verifyJwtToken,
  changeStageStatus
);
StageRouter.put(
  "/:stageId",
  fileUpload({ createParentPath: true }),
  validateResource(editStageSchema),
  verifyJwtToken,
  editStage
);

export default StageRouter;
