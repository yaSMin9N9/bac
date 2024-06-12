import mongoose from "mongoose";
import { z } from "zod";

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
    adminId: z
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
      otp: z
        .string({ required_error: "حقل رمز التحقق مطلوب" })
        .min(6, "رمز التحقق يجب ان يتكون من ستة خانات")
        .max(6, "رمز التحقق يجب ان يتكون من ستة خانات"),
      password: z
        .string({ required_error: "حقل كلمة المرور مطلوب" })
        .min(6, "كلمة المرور يجب ان تكون اكبر من خمسة محارف"),
      confirmPassword: z
        .string({ required_error: "حقل تأكيد كلمة المرور مطلوب" })
        .min(1, "حقل تأكيد كلمة المرور مطلوب"),
      adminId: z
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
export const checkCodeSchema = z.object({
  body: z.object({
    otp: z
      .string({ required_error: "حقل رمز التحقق مطلوب" })
      .min(6, "رمز التحقق يجب ان يتكون من ستة خانات")
      .max(6, "رمز التحقق يجب ان يتكون من ستة خانات"),
    adminId: z
      .string({ required_error: "الحقل مطلوب" })
      .min(1, "الحقل مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المستخدم غير صالح"
      ),
  }),
});
