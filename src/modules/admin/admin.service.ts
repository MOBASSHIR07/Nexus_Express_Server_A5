import { prisma } from "../../lib/prisma.js";
import AppError from "../../errors/AppError.js";
import { getQueryOptions } from "../../utils/queryHelpers.js";

const getAllParcelsFromDB = async (query: any) => {
  const searchableFields = ["trackingCode", "receiverName", "receiverPhone"];
  const { skip, take, orderBy, searchConditions } = getQueryOptions(query, searchableFields);

  const result = await prisma.parcel.findMany({
    where: searchConditions,
    skip,
    take,
    orderBy,
    include: {
      sender: { select: { name: true, email: true } },
      rider: { include: { user: { select: { name: true } } } },
      tracking: true
    }
  });

  const total = await prisma.parcel.count({ where: searchConditions });

  return {
    meta: { page: Number(query.page) || 1, limit: take, total },
    data: result
  };
};

const approveRiderIntoDB = async (riderId: string) => {
  return await prisma.$transaction(async (tx) => {
    const riderProfile = await tx.rider.findUnique({ 
      where: { id: riderId } 
    });

    if (!riderProfile) {
      throw new AppError(404, "Rider application not found!");
    }

    const updatedRider = await tx.rider.update({
      where: { id: riderId },
      data: { isApproved: true }
    });

    await tx.user.update({
      where: { id: riderProfile.userId },
      data: { role: "RIDER" }
    });

    return updatedRider;
  });
};

const assignRiderToParcelIntoDB = async (parcelId: string, riderId: string) => {
  return await prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUnique({ where: { id: parcelId } });

    if (!parcel) {
      throw new AppError(404, "Parcel not found!");
    }

    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: { 
        riderId,
        deliveryStatus: "RIDER_ASSIGNED" 
      }
    });

    const tracking = await tx.tracking.findUnique({ where: { parcelId } });

    if (tracking) {
      await tx.trackingStep.create({
        data: {
          trackingId: tracking.id,
          status: "RIDER_ASSIGNED",
          message: "A rider has been assigned to your parcel and is on the way."
        }
      });
    }

    return updatedParcel;
  });
};

export const AdminService = {
  getAllParcelsFromDB,
  approveRiderIntoDB,
  assignRiderToParcelIntoDB
};