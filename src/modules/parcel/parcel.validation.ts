import { z } from "zod";

const createParcelZodSchema = z.object({
  body: z.object({
    parcel: z.object({
      title: z.string().min(3, "Title must be at least 3 characters").max(50, "Title must be at most 50 characters"),
      weight: z.number().positive("Weight cannot be negative"),
      price: z.number().positive("Price cannot be negative"),
      pickupAddress: z.string().min(10, "Address must be at least 10 characters")
    }),
    receiver: z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      phone: z.string().min(11, "Contact number must be at least 11 characters").max(14, "Contact number must be at most 14 characters"),
      address: z.string().min(10, "Address must be at least 10 characters")
    })
  })
});

export const ParcelValidations = {
  createParcelZodSchema
};