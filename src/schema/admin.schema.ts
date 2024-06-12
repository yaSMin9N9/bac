import mongoose from "mongoose";
import { z } from "zod";

const roles = ["admin", "superAdmin", "designer", "advisor", "arbitrator"];

export const createAdminSchema = z.object({
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
      role: z
        .string({ required_error: "حقل الدور مطلوب" })
        .min(1, "حقل الدور مطلوب")
        .refine(
          (data) => roles.find((role) => role === data),
          "حقل الدور غير صالح"
        ),
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

export const completeProfileSchema = z.object({
  body: z.object({
    description: z
      .string({ required_error: "حقل التوصيف مطلوب" })
      .min(1, "حقل التوصيف مطلوب"),
    cvURL: z
      .string({ required_error: "حقل رابط السيرة الذاتية مطلوب" })
      .min(1, "حقل السيرة الذاتية مطلوب"),
    adminId: z
      .string({ required_error: "حقل معرف المسوؤل مطلوب" })
      .min(1, "حقل معرف المسوؤل مطلوب")
      .refine(
        (data) => mongoose.Types.ObjectId.isValid(data),
        "معرف المسؤول غير صالح"
      ),
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

export const editAdminProfileSchema = z.object({
  body: z.object({
    description: z
      .string({ required_error: "حقل التوصيف مطلوب" })
      .min(1, "حقل التوصيف مطلوب"),
    cvURL: z
      .string({ required_error: "حقل رابط السيرة الذاتية مطلوب" })
      .min(1, "حقل السيرة الذاتية مطلوب"),
    adminId: z
      .string({ required_error: "حقل معرف المسوؤل مطلوب" })
      .min(1, "حقل معرف المسوؤل مطلوب")
      .refine(
        (data) => mongoose.Types.ObjectId.isValid(data),
        "معرف المسؤول غير صالح"
      ),
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
            return ["png", "webp", "jpg", "jpeg", "svg"].includes(
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

export const getAdminsSchema = z.object({
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
    role: z
      .string()
      .refine(
        (data) => roles.find((role) => role === data),
        "حقل الدور غير صالح"
      )
      .optional(),
  }),
});

export const deleteAdminSchema = z.object({
  params: z.object({
    adminId: z
      .string({ required_error: "الحقل مطلوب" })
      .min(1, "الحقل مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المستخدم غير صالح"
      ),
  }),
});

export const getAdminDataSchema = z.object({
  params: z.object({
    adminId: z
      .string({ required_error: "الحقل مطلوب" })
      .min(1, "الحقل مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المستخدم غير صالح"
      ),
    type: z
      .string({ required_error: "الحقل مطلوب" })
      .min(1, "الحقل مطلوب")
      .refine((data) => {
        return ["advisor", "arbitrator"].includes(data);
      }, "حقل النوع غير صالح"),
  }),
});
