import { Router } from "express";
import { createService, getServices } from "../controller/service.controller";
import { addStage, getStages } from "../controller/stage.controller";
import fileUpload from "express-fileupload";
import {
  addGuidance,
  getStageGuidances,
} from "../controller/guidance.controller";

const adminServices = Router();

adminServices.get("/getServices", getServices);
adminServices.get("/getStages", getStages);
adminServices.post(
  "/addService",
  fileUpload({ createParentPath: true }),
  createService
);
adminServices.post("/addStage", addStage);
adminServices.post("/addGuidance", addGuidance);
adminServices.get("/getGuidances/:stageId", getStageGuidances);

export default adminServices;
