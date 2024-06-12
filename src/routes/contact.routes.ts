import { Router } from "express";
import { createContact } from "../controller/contact.controller";
import validateResource from "../middleware/validateResource";
import { createContactSchema } from "../schema/contact.schema";

const UserContactRoute = Router();

UserContactRoute.post(
  "/",
  validateResource(createContactSchema),
  createContact
);

export default UserContactRoute;
