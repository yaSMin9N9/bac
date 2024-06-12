import { z } from "zod";

export const getPaymentsSchema = z.object({
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
    status: z.string().optional(),
  }),
});
