import { Router } from "express";
import {
  addVideo,
  deleteVideo,
  getVideo,
  updateVideo,
} from "../controller/video.controller";
import validateResource from "../middleware/validateResource";
import verifyJwtToken from "../middleware/verifyJwtToken";
import {
  createVideoSchema,
  deleteVideoSchema,
  getVideoSchema,
  updateVideoSchema,
} from "../schema/video.schema";

const VideoRouter = Router();

VideoRouter.get(
  "/:stageId",
  validateResource(getVideoSchema),
  verifyJwtToken,
  getVideo
);
VideoRouter.post(
  "/",
  validateResource(createVideoSchema),
  verifyJwtToken,
  addVideo
);
VideoRouter.delete(
  "/:stageId",
  validateResource(deleteVideoSchema),
  verifyJwtToken,
  deleteVideo
);
VideoRouter.put(
  "/:videoId",
  validateResource(updateVideoSchema),
  verifyJwtToken,
  updateVideo
);

export default VideoRouter;
