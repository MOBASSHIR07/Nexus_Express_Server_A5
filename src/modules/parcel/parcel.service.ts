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

export const ParcelService = {
  createParcelIntoDB,
  getMyParcelsFromDB,
};