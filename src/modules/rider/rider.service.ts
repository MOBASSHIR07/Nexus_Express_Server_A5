import { prisma } from "../../lib/prisma.js";
import AppError from "../../errors/AppError.js";

const applyForRiderIntoDB = async (userId: string, payload: any) => {
  const { rider } = payload;

  return await prisma.$transaction(async (tx) => {
    const existingRider = await tx.rider.findUnique({
      where: { userId }
    });

    if (existingRider) {
      throw new AppError(400, "You have already applied for a rider profile!");
    }

    const newRider = await tx.rider.create({
      data: {
        userId,
        phone: rider.phone,
        district: rider.district,
        region: rider.region,
        vehicle: rider.vehicle,
      }
    });

    await tx.user.update({
      where: { id: userId },
      data: { role: "RIDER" }
    });

    return newRider;
  });
};

export const RiderService = {
  applyForRiderIntoDB
};