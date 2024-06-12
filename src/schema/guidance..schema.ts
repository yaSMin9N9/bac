import mongoose from "mongoose";
import { z } from "zod";

export const createGuidanceSchema = z.object({
  body: z.object({
    guidance: z
      .string({ required_error: "حقل الإرشاد مطلوب" })
      .min(1, "حقل الإرشاد مطلوب"),
    stageId: z
      .string({ required_error: "حقل معرف المرحلة مطلوب" })
      .min(1, "حقل معرف المرحلة مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المرحلة غير صالح"
      ),
  }),
});

export const deleteGuidanceSchema = z.object({
  params: z.object({
    guidanceId: z
      .string({ required_error: "حقل معرف الإرشاد مطلوب" })
      .min(1, "حقل معرف الإرشاد مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الإرشاد غير صالح"
      ),
  }),
});

export const updateGuidanceSchema = z.object({
  body: z.object({
    guidance: z
      .string({ required_error: "حقل الإرشاد مطلوب" })
      .min(1, "حقل الإرشاد مطلوب"),
  }),
  params: z.object({
    guidanceId: z
      .string({ required_error: "حقل معرف الإرشاد مطلوب" })
      .min(1, "حقل معرف الإرشاد مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الإرشاد غير صالح"
      ),
  }),
});

export const getGuidanceSchema = z.object({
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
