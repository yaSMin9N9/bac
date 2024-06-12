import { Router } from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
} from "../controller/user.controller";
import validateResource from "../middleware/validateResource";
import { deleteUsersSchema, getUsersSchema } from "../schema/user.schema";
import fileUpload from "express-fileupload";
import { registerSchema } from "../schema/userAuth.schema";

const userRouter = Router();

userRouter.get("/", validateResource(getUsersSchema), getAllUsers);
userRouter.post(
  "/",
  fileUpload({ createParentPath: true }),
  validateResource(registerSchema),
  createUser
);
userRouter.delete("/:id", validateResource(deleteUsersSchema), deleteUser);

export default userRouter;
