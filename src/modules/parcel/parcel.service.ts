import AppError from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { getQueryOptions } from "../../utils/queryHelpers.js";

const createParcelIntoDB = async (userId: string, payload: any) => {
  const { parcel, receiver } = payload;
  const { category, weight, title, pickupAddress } = parcel;
  
  let calculatedPrice = 0;

  if (category === "PARCEL") {
    calculatedPrice = 200;
  } else if (category === "CARGO") {
    calculatedPrice = weight * 100;
  }

  return await prisma.$transaction(async (tx) => {
    const result = await tx.parcel.create({
      data: {
        title,
        category,
        weight,
        price: calculatedPrice,
        pickupAddress,
        receiverName: receiver.name,
        receiverPhone: receiver.phone,
        deliveryAddress: receiver.address,
        senderId: userId,
        trackingCode: `NEX-${Date.now()}`
      }
    });

    await tx.tracking.create({
      data: {
        parcelId: result.id,
        status: "PENDING"
      }
    });

    return result;
  });
};


const getMyParcelsFromDB = async (userId: string, query: any) => {
  const searchableFields = ["title", "receiverName", "trackingCode"];
  const { skip, take, orderBy, searchConditions } = getQueryOptions(query, searchableFields);

  const whereConditions = {
    AND: [
      { senderId: userId },
      searchConditions,
    ],
  };

  const result = await prisma.parcel.findMany({
    where: whereConditions,
    skip,
    take,
    orderBy,
    include: {
      tracking: {
        include: {
          steps: {
            orderBy: {
              timestamp: "desc",
            },
          },
        },
      },
    },
  });

  const total = await prisma.parcel.count({
    where: whereConditions,
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

const cancelParcelByUserFromDB = async (userId: string, parcelId: string) => {
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId }
  });

  if (!parcel) throw new AppError(404, "Parcel not found");
  if (parcel.senderId !== userId) throw new AppError(403, "You can only cancel your own parcels");

  if (parcel.deliveryStatus === "CANCELLED") {
    throw new AppError(400, "This parcel is already cancelled");
  }

  const restrictedStatuses = ["PICKED_UP", "IN_TRANSIT", "DELIVERED"];
  if (restrictedStatuses.includes(parcel.deliveryStatus)) {
    throw new AppError(400, `Cannot cancel parcel as it is already ${parcel.deliveryStatus.toLowerCase()}`);
  }

  return await prisma.$transaction(async (tx) => {
    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: { deliveryStatus: "CANCELLED" }
    });

    if (parcel.riderId) {
      await tx.rider.update({
        where: { id: parcel.riderId },
        data: { status: "AVAILABLE" }
      });
    }

    const tracking = await tx.tracking.findUnique({ where: { parcelId } });
    if (tracking) {
      await tx.trackingStep.create({
        data: {
          trackingId: tracking.id,
          status: "CANCELLED",
          message: "The sender has cancelled this delivery request"
        }
      });
    }

    return updatedParcel;
  });
};

export const ParcelService = {
  createParcelIntoDB,
  getMyParcelsFromDB,
  cancelParcelByUserFromDB
};