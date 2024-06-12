import mongoose from "mongoose";
import { z } from "zod";

export const addServiceSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "حقل الاسم مطلوب" })
      .min(1, "حقل الاسم مطلوب"),
    price: z
      .string({ required_error: "حقل السعر مطلوب" })
      .min(1, "حقل السعر مطلوب"),
    arbitrationPrice: z
      .string({ required_error: "حقل سعر التحكيم مطلوب" })
      .min(1, "حقل سعر التحكيم مطلوب"),
    designPrice: z
      .string({ required_error: "حقل سعر التصميم مطلوب" })
      .min(1, "حقل سعر التصميم مطلوب"),
    hasVideos: z
      .string({ required_error: "حقل هل تحتوي الخدمة على فيديوهات مطلوب" })
      .refine(
        (data) => data === "true" || data === "false",
        "حقل هل تحتوي الخدمة على فيديوهات غير صالح"
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

export const changeServiceStatusSchema = z.object({
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

export const getAdvisorsSchema = z.object({
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

export const editServiceSchema = z.object({
  params: z.object({
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .min(1, "حقل معرف الخدمة مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
      ),
  }),
  body: z.object({
    name: z
      .string({ required_error: "حقل الاسم مطلوب" })
      .min(1, "حقل الاسم مطلوب"),
    price: z
      .string({ required_error: "حقل السعر مطلوب" })
      .min(1, "حقل السعر مطلوب"),
    arbitrationPrice: z
      .string({ required_error: "حقل سعر التحكيم مطلوب" })
      .min(1, "حقل سعر التحكيم مطلوب"),
    designPrice: z
      .string({ required_error: "حقل سعر التصميم مطلوب" })
      .min(1, "حقل سعر التصميم مطلوب"),
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
export const deleteServiceSchema = z.object({
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

export const addAdvisorSchema = z.object({
  body: z.object({
    advisorId: z
      .string({ required_error: "حقل معرف المستشار مطلوب" })
      .min(1, "حقل معرف المستشار مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المستشار غير صالح"
      ),
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .min(1, "حقل معرف الخدمة مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
      ),
  }),
});
