import mongoose from "mongoose";
import { z } from "zod";

export const madaBookingSchema = z.object({
  body: z.object({
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .min(1, "حقل معرف الخدمة مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
      ),
      advisorId: z
      .string({ required_error: "حقل معرف المستشار مطلوب" })
      .min(1, "حقل معرف المستشار مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المستشار غير صالح"
      ),
    number: z
      .string({ required_error: "حقل رقم البطاقة مطلوب" })
      .regex(/^\d{16}$/, "رقم البطاقة غير صالح"),
    name: z.string({ required_error: "حقل اسم البطاقة مطلوب" }),
    cvc: z
      .string({ required_error: "الرقم السري للبطاقة مطلوب" })
      .regex(/^\d{3}$/, "رقم السري للبطاقة غير صالح"),
    month: z
      .string({ required_error: "حقل الشهر مطلوب" })
      .refine(
        (data) =>
          [
            "01",
            "02",
            "03",
            "04",
            "05",
            "06",
            "07",
            "08",
            "09",
            "10",
            "11",
            "12",
          ].find((month) => month === data),
        "حقل الشهر غير صالح"
      ),
    year: z
      .string({ required_error: "حقل السنة مطلوب" })
      .regex(/^\d{2}$/, "حقل السنة غير صالح "),
  }),
});

export const madaArbitrationSchema = z.object({
  body: z.object({
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .min(1, "حقل معرف الخدمة مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
      ),
      arbitratorId: z
      .string({ required_error: "حقل معرف المحكم مطلوب" })
      .min(1, "حقل معرف المحكم مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف المحكم غير صالح"
      ),
    number: z
      .string({ required_error: "حقل رقم البطاقة مطلوب" })
      .regex(/^\d{16}$/, "رقم البطاقة غير صالح"),
    name: z.string({ required_error: "حقل اسم البطاقة مطلوب" }),
    cvc: z
      .string({ required_error: "الرقم السري للبطاقة مطلوب" })
      .regex(/^\d{3}$/, "رقم السري للبطاقة غير صالح"),
    month: z
      .string({ required_error: "حقل الشهر مطلوب" })
      .refine(
        (data) =>
          [
            "01",
            "02",
            "03",
            "04",
            "05",
            "06",
            "07",
            "08",
            "09",
            "10",
            "11",
            "12",
          ].find((month) => month === data),
        "حقل الشهر غير صالح"
      ),
    year: z
      .string({ required_error: "حقل السنة مطلوب" })
      .regex(/^\d{2}$/, "حقل السنة غير صالح "),
  }),
});
export const madaDesignSchema = z.object({
  body: z.object({
    serviceId: z
      .string({ required_error: "حقل معرف الخدمة مطلوب" })
      .min(1, "حقل معرف الخدمة مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الخدمة غير صالح"
      ),
    number: z
      .string({ required_error: "حقل رقم البطاقة مطلوب" })
      .regex(/^\d{16}$/, "رقم البطاقة غير صالح"),
    name: z.string({ required_error: "حقل اسم البطاقة مطلوب" }),
    cvc: z
      .string({ required_error: "الرقم السري للبطاقة مطلوب" })
      .regex(/^\d{3}$/, "رقم السري للبطاقة غير صالح"),
    month: z
      .string({ required_error: "حقل الشهر مطلوب" })
      .refine(
        (data) =>
          [
            "01",
            "02",
            "03",
            "04",
            "05",
            "06",
            "07",
            "08",
            "09",
            "10",
            "11",
            "12",
          ].find((month) => month === data),
        "حقل الشهر غير صالح"
      ),
    year: z
      .string({ required_error: "حقل السنة مطلوب" })
      .regex(/^\d{2}$/, "حقل السنة غير صالح "),
  }),
});

export const deleteVideoSchema = z.object({
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

export const updateVideoSchema = z.object({
  body: z.object({
    url: z
      .string({ required_error: "حقل رابط الفيديو مطلوب" })
      .min(1, "حقل رابط الفيديو مطلوب")
      .refine(
        (data) => !isNaN(parseInt(data)) && data.length >= 9,
        "رابط الفيديو غير صالح"
      ),
  }),
  params: z.object({
    videoId: z
      .string({ required_error: "حقل معرف الفيديو مطلوب" })
      .min(1, "حقل معرف الفيديو مطلوب")
      .refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        "معرف الفيديو غير صالح"
      ),
  }),
});

export const getVideoSchema = z.object({
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
