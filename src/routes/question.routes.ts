import { Router } from "express";
import {
  addQuestion,
  deleteQuestion,
  getStageQuestion,
  updateQuestion,
} from "../controller/question.controller";
import validateResource from "../middleware/validateResource";
import {
  createQuestionSchema,
  deleteQuestionSchema,
  getQuestionSchema,
  updateQuestionSchema,
} from "../schema/question.schema";
import verifyJwtToken from "../middleware/verifyJwtToken";

const QuestionRouter = Router();

QuestionRouter.get(
  "/:stageId",
  validateResource(getQuestionSchema),
  verifyJwtToken,
  getStageQuestion
);
QuestionRouter.post(
  "/",
  validateResource(createQuestionSchema),
  verifyJwtToken,
  addQuestion
);
QuestionRouter.delete(
  "/:questionId",
  validateResource(deleteQuestionSchema),
  verifyJwtToken,
  deleteQuestion
);
QuestionRouter.put(
  "/:questionId",
  validateResource(updateQuestionSchema),
  verifyJwtToken,
  updateQuestion
);

export default QuestionRouter;
