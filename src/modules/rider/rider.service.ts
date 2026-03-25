import { prisma } from "../../lib/prisma.js";
import AppError from "../../errors/AppError.js";
import { getQueryOptions } from "../../utils/queryHelpers.js";

const applyForRiderIntoDB = async (userId: string, payload: any) => {
  const { rider } = payload;

  const existingRider = await prisma.rider.findUnique({
    where: { userId }
  });

  if (existingRider) {
    throw new AppError(400, "Application already exists");
  }

  return await prisma.rider.create({
    data: {
      userId,
      phone: rider.phone,
      district: rider.district,
      region: rider.region,
      vehicle: rider.vehicle,
      isApproved: false
    }
  });
};

const getMyAssignedParcelsFromDB = async (userId: string, query: any) => {
  const searchableFields = ["title", "trackingCode", "receiverName"];
  const { skip, take, orderBy, searchConditions } = getQueryOptions(query, searchableFields);

  const rider = await prisma.rider.findUnique({
    where: { userId }
  });

  if (!rider) {
    throw new AppError(404, "Rider profile not found");
  }

  const whereConditions = {
    AND: [
      { riderId: rider.id },
      searchConditions,
    ],
  };

  const result = await prisma.parcel.findMany({
    where: whereConditions,
    skip,
    take,
    orderBy,
    include: {
      tracking: true,
      sender: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  const total = await prisma.parcel.count({
    where: whereConditions
  });

  return {
    meta: {
      page: Number(query.page) || 1,
      limit: take,
      total,
    },
    data: result,
  };
};

const updateParcelStatusIntoDB = async (riderUserId: string, parcelId: string, status: string) => {
  const rider = await prisma.rider.findUnique({
    where: { userId: riderUserId }
  });

  if (!rider || !rider.isApproved) {
    throw new AppError(403, "Rider not approved or not found");
  }

  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId }
  });

  if (!parcel || parcel.riderId !== rider.id) {
    throw new AppError(403, "Unauthorized to update this parcel");
  }

  return await prisma.$transaction(async (tx) => {
    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: { deliveryStatus: status as any }
    });

    const tracking = await tx.tracking.findUnique({
      where: { parcelId }
    });

    if (tracking) {
      await tx.trackingStep.create({
        data: {
          trackingId: tracking.id,
          status,
          location: rider.district,
          message: `Parcel status updated to ${status} by rider`
        }
      });
    }

    return updatedParcel;
  });
};

export const RiderService = {
  applyForRiderIntoDB,
  getMyAssignedParcelsFromDB,
  updateParcelStatusIntoDB
};