import mongoose from "mongoose";
import { z } from "zod";

export const registerSchema = z.object({
  body: z
    .object({
      firstName: z
        .string({ required_error: "حقل الاسم مطلوب" })
        .min(1, "حقل الاسم مطلوب"),
      lastName: z
        .string({ required_error: "حقل الكنية مطلوب" })
        .min(1, "حقل الكنية مطلوب"),
      email: z
        .string({ required_error: "حقل البريد الالكتروني مطلوب" })
        .min(1, "حقل البريد الالكتروني مطلوب")
        .email("صيغة البريد الالكتروني غير صالحة"),
      password: z
        .string({ required_error: "حقل كلمة المرور مطلوب" })
        .min(6, "كلمة المرور يجب ان تكون اكبر من خمسة محارف"),
      confirmPassword: z
        .string({ required_error: "حقل تأكيد كلمة المرور مطلوب" })
        .min(1, "حقل تأكيد كلمة المرور مطلوب"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "لا يوجد تطابق مع كلمة المرور",
      path: ["confirmPassword"],
    }),
  files: z.object(
    {
      image: z
        .object({
          name: z.string({ required_error: "حقل الاسم مطلوب" }),
          size: z.number(),
        })
        .refine(
          (data) =>
            ["png", "webp", "jpg", "jpeg", "svg"].includes(
              data.name.slice(data.name.lastIndexOf(".") + 1)
            ),
          {
            message: "لاحقة الصورة غير مدعومة",
            path: ["name"],
          }
        )
        .refine((data) => data.size < 2 * 1024 * 1024, {
          message: "حجم الصورة يجب ان لا يتجاوز 2 ميغابايت",
          path: ["size"],
        }),
    },
    {
      required_error: "حقل الصورة مطلوب",
      invalid_type_error: "حقل الصورة مطلوب",
    }
  ),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "حقل البريد الالكتروني مطلوب" })
      .min(1, "حقل البريد الالكتروني مطلوب")
      .email("صيغة البريد الالكتروني غير صالحة"),
    password: z
      .string({ required_error: "حقل كلمة المرور مطلوب" })
      .min(6, "كلمة المرور يجب ان تكون اكبر من خمسة محارف"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "حقل البريد الالكتروني مطلوب" })
      .min(1, "حقل البريد الالكتروني مطلوب")
      .email("صيغة البريد الالكتروني غير صالحة"),
  }),
});

export const resendCodeSchema = z.object({
  body: z.object({
    userId: z
      .string({ required_error: "الحقل مطلوب" })
      .min(1, "الحقل مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المستخدم غير صالح"
      ),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    userId: z
      .string({ required_error: "الحقل مطلوب" })
      .min(1, "الحقل مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المستخدم غير صالح"
      ),
    otp: z
      .string({ required_error: "حقل رمز التحقق مطلوب" })
      .min(6, "رمز التحقق يجب ان يتكون من ستة خانات")
      .max(6, "رمز التحقق يجب ان يتكون من ستة خانات"),
  }),
});

export const checkCodeSchema = z.object({
  body: z.object({
    otp: z
      .string({ required_error: "حقل رمز التحقق مطلوب" })
      .min(6, "رمز التحقق يجب ان يتكون من ستة خانات")
      .max(6, "رمز التحقق يجب ان يتكون من ستة خانات"),
    userId: z
      .string({ required_error: "الحقل مطلوب" })
      .min(1, "الحقل مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المستخدم غير صالح"
      ),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      password: z
        .string({ required_error: "حقل كلمة المرور مطلوب" })
        .min(6, "كلمة المرور يجب ان تكون اكبر من خمسة محارف"),
      confirmPassword: z
        .string({ required_error: "حقل تأكيد كلمة المرور مطلوب" })
        .min(1, "حقل تأكيد كلمة المرور مطلوب"),
      otp: z
        .string({ required_error: "حقل رمز التحقق مطلوب" })
        .min(6, "رمز التحقق يجب ان يتكون من ستة خانات")
        .max(6, "رمز التحقق يجب ان يتكون من ستة خانات"),
      userId: z
        .string({ required_error: "الحقل مطلوب" })
        .min(1, "الحقل مطلوب")
        .refine(
          (id) => mongoose.Types.ObjectId.isValid(id),
          "معرف المستخدم غير صالح"
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "لا يوجد تطابق مع كلمة المرور",
      path: ["confirmPassword"],
    }),
});
