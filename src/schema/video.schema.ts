import mongoose from "mongoose";
import { z } from "zod";

export const createVideoSchema = z.object({
  body: z.object({
    url: z
      .string({ required_error: "حقل رابط الفيديو مطلوب" })
      .min(1, "حقل رابط الفيديو مطلوب")
      .refine(
        (data) => !isNaN(parseInt(data)) && data.length >= 9,
        "رابط الفيديو غير صالح"
      ),
    stageId: z
      .string({ required_error: "حقل معرف المرحلة مطلوب" })
      .min(1, "حقل معرف المرحلة مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المرحلة غير صالح"
      ),
  }),
});

export const deleteVideoSchema = z.object({
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

export const updateVideoSchema = z.object({
  body: z.object({
    url: z
      .string({ required_error: "حقل رابط الفيديو مطلوب" })
      .min(1, "حقل رابط الفيديو مطلوب")
      .refine(
        (data) => !isNaN(parseInt(data)) && data.length >= 9,
        "رابط الفيديو غير صالح"
      ),
  }),
  params: z.object({
    videoId: z
      .string({ required_error: "حقل معرف الفيديو مطلوب" })
      .min(1, "حقل معرف الفيديو مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الفيديو غير صالح"
      ),
  }),
});

export const getVideoSchema = z.object({
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
