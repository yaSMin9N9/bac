import { Router } from "express";
import fileUpload from "express-fileupload";
import { getMessages, sendMessage } from "../controller/message.controller";
import validate from "../middleware/validateResource";
import verifyJwtToken from "../middleware/verifyJwtToken";
import { getMessagesSchema } from "../schema/message.schema";

const UserConversationRouter = Router();

UserConversationRouter.get(
  "/:conversationId",
  verifyJwtToken,
  validate(getMessagesSchema),
  getMessages
);

UserConversationRouter.post(
  "/",
  fileUpload({ createParentPath: true }),
  verifyJwtToken,
  sendMessage
);

export default UserConversationRouter;
