import { Router } from "express";
import fileUpload from "express-fileupload";
import { getMessages, sendMessage } from "../controller/message.controller";
import validate from "../middleware/validateResource";
import verifyJwtToken from "../middleware/verifyJwtToken";
import { getMessagesSchema } from "../schema/message.schema";

const AdminConversationRouter = Router();

AdminConversationRouter.get(
  "/:conversationId",
  verifyJwtToken,
  validate(getMessagesSchema),
  getMessages
);

AdminConversationRouter.post(
  "/",
  fileUpload({ createParentPath: true }),
  verifyJwtToken,
  sendMessage
);

export default AdminConversationRouter;
