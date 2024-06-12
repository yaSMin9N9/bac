import { z } from "zod";

export const editProfileSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: "حقل الاسم مطلوب" }),
    lastName: z.string({ required_error: "حقل الكنية مطلوب" }),
  }),
  files: z
    .object({
      image: z
        .object({
          name: z.string(),
          size: z.number(),
        })
        .nullable()
        .refine(
          (data) => {
            if (!data) return true;
            return  ["png", "webp", "jpg", "jpeg", "svg"].includes(
              data.name.slice(data.name.lastIndexOf(".") + 1)
            );
          },
          {
            message: "لاحقة الصورة غير مدعومة",
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
export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string({ required_error: "حقل كلمة المرور مطلوب" })
        .min(6, "كلمة المرور يجب ان تكون اكبر من خمسة محارف"),
      newPassword: z
        .string({ required_error: "حقل تأكيد كلمة المرور مطلوب" })
        .min(1, "حقل تأكيد كلمة المرور مطلوب"),
      confirmNewPassword: z
        .string({ required_error: "حقل تأكيد كلمة المرور مطلوب" })
        .min(1, "حقل تأكيد كلمة المرور مطلوب"),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "لا يوجد تطابق مع كلمة المرور",
      path: ["confirmNewPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: "حقل كلمة المرور الجديدة متطابق مع كلمة المرور الجدبدة ",
      path: ["newPassword"],
    }),
});
