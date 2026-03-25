import { prisma } from "../../lib/prisma.js";

const createParcelIntoDB = async (userId: string, payload: any) => {
  const { parcel, receiver } = payload;
  const trackingCode = `NEX-${Date.now()}`;

  return await prisma.$transaction(async (tx) => {
    const newParcel = await tx.parcel.create({
      data: {
        senderId: userId,
        title: parcel.title,
        weight: Number(parcel.weight),
        price: Number(parcel.price),
        pickupAddress: parcel.pickupAddress,
        receiverName: receiver.name,
        receiverPhone: receiver.phone,
        deliveryAddress: receiver.address,
        trackingCode,
      },
    });

    await tx.tracking.create({
      data: {
        parcelId: newParcel.id,
        status: "PENDING",
        steps: {
          create: {
            status: "Parcel Booked",
            location: parcel.pickupAddress,
            message: "Your delivery request has been successfully registered.",
          },
        },
      },
    });

    return newParcel;
  });
};

const getMyParcelsFromDB = async (userId: string) => {
  return await prisma.parcel.findMany({
    where: {
      senderId: userId,
    },
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
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const ParcelService = {
  createParcelIntoDB,
  getMyParcelsFromDB,
};