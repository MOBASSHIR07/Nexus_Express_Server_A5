import { z } from "zod";

const applyRiderZodSchema = z.object({
  body: z.object({
    rider: z.object({
      phone: z.string().min(11).max(14),
      district: z.string().min(3),
      region: z.string().min(3),
      vehicle: z.string().min(2)
    })
  })
});

const updateStatusZodSchema = z.object({
  body: z.object({
    parcelId: z.string(),
    status: z.enum(["ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"])
  })
});

export const RiderValidations = {
  applyRiderZodSchema,
  updateStatusZodSchema
};