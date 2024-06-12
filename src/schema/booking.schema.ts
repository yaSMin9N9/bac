import mongoose from "mongoose";
import { z } from "zod";

export const bookingRegisterByBankSchema = z.object({
  body: z.object({
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
      ),
    advisorId: z
      .string({ required_error: "حقل معرف المستشار مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المستشار غير صالح"
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
export const designRegisterByBankSchema = z.object({
  body: z.object({
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
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
export const arbitrationRegisterByBankSchema = z.object({
  body: z.object({
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
      ),
    arbitratorId: z
      .string({ required_error: "حقل معرف المحكم مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المحكم غير صالح"
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

export const skipStageSchema = z.object({
  body: z.object({
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
      ),
    userId: z
      .string({ required_error: "حقل معرف المستخدم مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المستخدم غير صالح"
      ),
  }),
});
export const userSkipStageSchema = z.object({
  body: z.object({
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
      ),
  }),
});
export const closeBookingSchema = z.object({
  body: z.object({
    bookingId: z
      .string({ required_error: "حقل معرف الحجز مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الحجز غير صالح"
      ),
  }),
});

export const getCurrentStageSchema = z.object({
  params: z.object({
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
      ),
  }),
});

export const getFilesSchema = z.object({
  params: z.object({
    bookingId: z
      .string({ required_error: "حقل معرف الحجز مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الحجز غير صالح"
      ),
    serviceType: z
      .string({ required_error: "حقل نوع الخدمة مطلوب مطلوب" })
      .refine(
        (data) => ["advisor", "design", "arbitration"].includes(data),
        "نوع الخدمة غير صالح"
      ),
  }),
});

export const addOrEditAnswerSchema = z.object({
  body: z.object({
    answers: z.array(
      z.object({
        questionId: z
          .string({ required_error: "حقل معرف السؤال مطلوب" })
          .refine(
            (id) => mongoose.Types.ObjectId.isValid(id),
            "معرف السؤال غير صالح"
          ),
        answer: z.string({ required_error: "حقل الجواب مطلوب" }),
      }),
      { required_error: "حقل الاجابة مطلوب" }
    ),
  }),
});

export const acceptOrRejectBookingSchema = z.object({
  body: z.object({
    bookingId: z
      .string({ required_error: "حقل معرف الحجز مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الحجز غير صالح"
      ),
  }),
});

export const getBookingStagesSchema = z.object({
  params: z.object({
    bookingId: z
      .string({ required_error: "حقل معرف الحجز مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الحجز غير صالح"
      ),
  }),
});
export const adminSkipSchema = z.object({
  body: z.object({
    bookingId: z
      .string({ required_error: "حقل معرف الحجز مطلوب" })
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الحجز غير صالح"
      ),
  }),
});

export const getBookingsSchema = z.object({
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
    status: z
      .string()
      .refine(
        (data) =>
          ["pending", "inProgress", "done"].find((status) => status === data),
        "حقل الحالة غير صالح"
      )
      .optional(),
  }),
});
