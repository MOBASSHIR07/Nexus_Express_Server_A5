import { z } from "zod";

const applyRiderZodSchema = z.object({
  body: z.object({
    rider: z.object({
      phone: z.string().min(11, "Phone number must be at least 11 characters"),
      district: z.string().min(3, "District is required"),
      region: z.string().min(3, "Region is required"),
      vehicle: z.string().min(2, "Vehicle details are required")
    })
  })
});

export const RiderValidations = {
  applyRiderZodSchema
};