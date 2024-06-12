import mongoose from "mongoose";
import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z.object({
    message: z.string({ required_error: "حقل الرسالة مطلوب" }).optional(),
  }),
  files: z.object(
    {
      media: z
        .object({
          name: z.string({ required_error: "حقل الاسم مطلوب" }),
          size: z.number(),
        })
        .nullable()
        .refine(
          (data) => {
            if (!data) return true;
            return ["png", "webp", "jpg", "jpeg", "svg", "pdf"].includes(
              data.name.slice(data.name.lastIndexOf(".") + 1)
            );
          },
          {
            message: "لاحقة الملف غير مدعومة يرجى اختبار صورة او ملف pdf",
            path: ["name"],
          }
        )
        .refine(
          (data) => {
            if (!data) return true;
            return data.size < 2 * 1024 * 1024;
          },
          {
            message: "حجم الصورة يجب ان لا يتجاوز 2 ميغابايت",
            path: ["size"],
          }
        ),
    },
    {
      required_error: "حقل الصورة مطلوب",
      invalid_type_error: "حقل الصورة مطلوب",
    }
  ),
});
export const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z
      .string({ required_error: "حقل معرف المحادثة مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المحادثة غير صالح"
      ),
  }),
});
