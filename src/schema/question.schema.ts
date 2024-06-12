import mongoose from "mongoose";
import { z } from "zod";

export const createQuestionSchema = z.object({
  body: z.object({
    questionText: z
      .string({ required_error: "حقل السؤال مطلوب" })
      .min(1, "حقل السؤال مطلوب"),
    stageId: z
      .string({ required_error: "حقل معرف المرحلة مطلوب" })
      .min(1, "حقل معرف المرحلة مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المرحلة غير صالح"
      ),
  }),
});

export const deleteQuestionSchema = z.object({
  params: z.object({
    questionId: z
      .string({ required_error: "حقل معرف السؤال مطلوب" })
      .min(1, "حقل معرف السؤال مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف السؤال غير صالح"
      ),
  }),
});

export const updateQuestionSchema = z.object({
  body: z.object({
    questionText: z
      .string({ required_error: "حقل السؤال مطلوب" })
      .min(1, "حقل السؤال مطلوب"),
  }),
  params: z.object({
    questionId: z
      .string({ required_error: "حقل السؤال مطلوب" })
      .min(1, "حقل معرف السؤال مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف السؤال غير صالح"
      ),
  }),
});

export const getQuestionSchema = z.object({
  params: z.object({
    stageId: z
      .string({ required_error: "حقل معرف المرحلة مطلوب" })
      .min(1, "حقل معرف المرحلة مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المرحلة غير صالح"
      ),
  }),
});
