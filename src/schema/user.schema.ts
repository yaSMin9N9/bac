import mongoose from "mongoose";
import { z } from "zod";

export const getUsersSchema = z.object({
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
    search: z.string().optional(),
  }),
});

export const deleteUsersSchema = z.object({
  params: z.object({
    id: z
      .string({ required_error: "الحقل مطلوب" })
      .min(1, "الحقل مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المستخدم غير صالح"
      ),
  }),
});
