import AppError from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";

const createReviewIntoDB = async (userId: string, payload: { parcelId: string; rating: number; comment?: string }) => {
  const { parcelId, rating, comment } = payload;

  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId },
    include: { rider: true }
  });

  if (!parcel) throw new AppError(404, "Parcel not found");
  if (parcel.senderId !== userId) throw new AppError(403, "You can only review your own parcels");
  if (parcel.deliveryStatus !== "DELIVERED") {
    throw new AppError(400, "You can only review after the parcel is delivered");
  }
  if (!parcel.riderId) throw new AppError(400, "No rider was assigned to this parcel");

  const existingReview = await prisma.review.findFirst({
    where: { parcelId }
  });
  if (existingReview) throw new AppError(400, "You have already reviewed this delivery");

  return await prisma.review.create({
    data: {
      parcelId,
      riderId: parcel.riderId,
      senderId: userId,
      rating,
      comment: comment ?? null, 
    }
  });
};

export const ReviewService = {
  createReviewIntoDB
};