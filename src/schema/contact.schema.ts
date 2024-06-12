import mongoose from "mongoose";
import { z } from "zod";

export const createContactSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "حقل الاسم مطلوب" })
      .min(1, "حقل الاسم مطلوب"),
    email: z
      .string({ required_error: "حقل البريد الالكتروني مطلوب" })
      .min(1, "حقل البريد الالكتروني مطلوب"),
    subject: z.string({ required_error: "الحقل مطلوب" }).optional(),
    comment: z.string({ required_error: "الحقل مطلوب" }).min(1, "الحقل مطلوب"),
  }),
});

export const getContactUsMessagesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "يجب ان يتكون الحقل من ارقام فقط")
      .refine((data) => parseInt(data) > 0, "يجب ان يكون العدد اكبر من الصفر")
      .optional(),
    count: z
      .string()
      .regex(/^\d+$/, "يجب ان يتكون الحقل من ارقام فقط")
      .refine((data) => parseInt(data) > 0, "يجب ان يكون العدد اكبر من الصفر")
      .optional(),
  }),
});
export const deleteContactUsMessageSchema = z.object({
  params: z.object({
    messageId: z
      .string({ required_error: "حقل معرف الرسالة مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الرسالة غير صالح"
      ),
  }),
});
