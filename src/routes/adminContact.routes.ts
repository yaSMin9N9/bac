import { Router } from "express";
import validateResource from "../middleware/validateResource";
import verifyJwtToken from "../middleware/verifyJwtToken";
import { createContactSchema, deleteContactUsMessageSchema, getContactUsMessagesSchema } from "../schema/contact.schema";
import {
  createContact,
  deleteMessage,
  getContactUsMessages,
} from "../controller/contact.controller";

const AdminContactRoute = Router();

AdminContactRoute.get(
  "/",
  verifyJwtToken,
  validateResource(getContactUsMessagesSchema),
  getContactUsMessages
);

AdminContactRoute.delete(
  "/:messageId",
  verifyJwtToken,
  validateResource(deleteContactUsMessageSchema),
  deleteMessage
);

export default AdminContactRoute;
