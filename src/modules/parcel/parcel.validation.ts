import { z } from "zod";

const createParcelZodSchema = z.object({
  body: z.object({
    parcel: z.object({
      title: z.string().min(3).max(50),
      category: z.enum(["PARCEL", "CARGO"]),
      weight: z.number().positive(),
      pickupAddress: z.string().min(10)
    }),
    receiver: z.object({
      name: z.string().min(2),
      phone: z.string().min(11).max(14),
      address: z.string().min(10)
    })
  })
});

export const ParcelValidations = {
  createParcelZodSchema
};