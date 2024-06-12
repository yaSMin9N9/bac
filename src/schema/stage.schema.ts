import mongoose from "mongoose";
import { z } from "zod";

export const createStageSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "حقل اسم المرحلة مطلوب" })
      .min(1, "حقل اسم المرحلة مطلوب"),
    title: z
      .string({ required_error: "حقل النبذة مطلوب" })
      .min(1, "حقل النبذة مطلوب"),
    description: z
      .string({ required_error: "حقل الشرح مطلوب" })
      .min(1, "حقل الشرح مطلوب"),
    canSkip: z
      .string({ required_error: "حقل هل تحتوي الخدمة على فيديوهات مطلوب" })
      .refine((data) => data === "true" || data === "false", "الحقل غير صالح"),
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .min(1, "حقل معرف الخدمة مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
      ),
  }),
  files: z.object(
    {
      pdfFile: z
        .object({
          name: z.string({ required_error: "حقل الاسم مطلوب" }),
          size: z.number(),
        })
        .refine(
          (data) =>
            ["pdf"].includes(data.name.slice(data.name.lastIndexOf(".") + 1)),
          {
            message: "يجب ادخال ملف pdf حصراً",
            path: ["name"],
          }
        )
        .refine((data) => data.size < 2 * 1024 * 1024, {
          message: "حجم الصورة يجب ان لا يتجاوز 2 ميغابايت",
          path: ["size"],
        }),
    },
    {
      required_error: "حقل الملف مطلوب",
      invalid_type_error: "حقل الملف مطلوب",
    }
  ),
});

export const editStageSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "حقل اسم المرحلة مطلوب" })
      .min(1, "حقل اسم المرحلة مطلوب"),
    title: z
      .string({ required_error: "حقل النبذة مطلوب" })
      .min(1, "حقل النبذة مطلوب"),
    description: z
      .string({ required_error: "حقل الشرح مطلوب" })
      .min(1, "حقل الشرح مطلوب"),
      canSkip: z
      .string({ required_error: "حقل هل تحتوي الخدمة على فيديوهات مطلوب" })
      .refine((data) => data === "true" || data === "false", "الحقل غير صالح"),  }),
  params: z.object({
    stageId: z
      .string({ required_error: "حقل معرف المرحلة مطلوب" })
      .min(1, "حقل معرف المرحلة مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المرحلة غير صالح"
      ),
  }),
  files: z
    .object({
      pdfFile: z
        .object({
          name: z.string(),
          size: z.number(),
        })
        .nullable()
        .refine(
          (data) => {
            if (!data) return true;
            return ["pdf"].includes(
              data.name.slice(data.name.lastIndexOf(".") + 1)
            );
          },
          {
            message: "يجب ادخال ملف pdf حصراً",
            path: ["name"],
          }
        )
        .refine(
          (data) => {
            if (!data) return true;
            return data.size < 2 * 1024 * 1024;
          },
          {
            message: "حجم الصورة يجب أن لا يتجاوز 2 ميغابايت",
            path: ["size"],
          }
        ),
    })
    .nullable(),
});
export const changeStatusStageSchema = z.object({
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

export const getStagesSchema = z.object({
  params: z.object({
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .min(1, "حقل معرف الخدمة مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
      ),
  }),
});
