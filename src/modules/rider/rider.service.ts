import { prisma } from "../../lib/prisma.js";
import AppError from "../../errors/AppError.js";
import { getQueryOptions } from "../../utils/queryHelpers.js";
import { sendEmail } from "../../utils/sendEmail.js";

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


const updateParcelStatusIntoDB = async (riderUserId: string, payload: { parcelId: string; status: string }) => {
  const { parcelId, status } = payload;


  const rider = await prisma.rider.findUnique({
    where: { userId: riderUserId }
  });

  if (!rider || !rider.isApproved) {
    throw new AppError(403, "Rider not approved or not found");
  }


  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId },
    include: {
      sender: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  if (!parcel || parcel.riderId !== rider.id) {
    throw new AppError(403, "Unauthorized access to this parcel");
  }

  return await prisma.$transaction(async (tx) => {

    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: { deliveryStatus: status as any }
    });

    const tracking = await tx.tracking.findUnique({ where: { parcelId } });
    if (tracking) {
      await tx.trackingStep.create({
        data: {
          trackingId: tracking.id,
          status,
          location: rider.district,
          message: `Parcel status updated to ${status.toLowerCase()}`
        }
      });
       // see is it in right place
    await tx.tracking.update({
      where: { parcelId },
      data: { status: status as any }
    });
    }
   


    if (status === "DELIVERED") {
      let riderCommission = 0;
      const totalPaid = Number(parcel.price);


      if (parcel.category === "PARCEL") {
        riderCommission = 50;
      } else {

        riderCommission = totalPaid * 0.30;
      }


      await tx.rider.update({
        where: { id: rider.id },
        data: {
          //   totalEarned: { increment: riderCommission },
          withdrawableBalance: { increment: riderCommission },
          status: "AVAILABLE"
        }
      });


      await tx.riderPayment.create({
        data: {
          riderId: rider.id,
          parcelId: parcelId,
          amount: riderCommission,
          status: "PENDING"
        }
      });

      // Send email to sender
      if (parcel?.sender?.email) {
        sendEmail(
          parcel.sender.email,
          "Your parcel has been delivered!",
          {
            senderName: parcel.sender.name,
            trackingCode: parcel.trackingCode,
            parcelTitle: parcel.title,
            receiverName: parcel.receiverName,
            deliveryAddress: parcel.deliveryAddress,
            frontendUrl: process.env.FRONTEND_URL || "http://localhost:5000"
          },
          "delivery-confirmation"
        ).catch(err => console.error("Email sending failed:", err));
      }
    }

    return updatedParcel;
  });
};

const createWithdrawRequest = async (riderUserId: string, payload: { amount: number; method: any; accountNumber: string }) => {
  const { amount, method, accountNumber } = payload;

  const rider = await prisma.rider.findUnique({
    where: { userId: riderUserId }
  });

  if (!rider) throw new AppError(404, "Rider not found");


  const existingPendingRequest = await prisma.withdrawRequest.findFirst({
    where: {
      riderId: rider.id,
      status: "PENDING"
    }
  });

  if (existingPendingRequest) {
    throw new AppError(400, "You already have a pending withdraw request. Please wait for admin approval.");
  }

  if (Number(rider.withdrawableBalance) < amount) {
    throw new AppError(400, "Insufficient balance! Your current balance is " + rider.withdrawableBalance);
  }


  return await prisma.withdrawRequest.create({
    data: {
      riderId: rider.id,
      amount,
      method,
      accountNumber,
      status: "PENDING"
    }
  });
};



const respondToAssignedParcelIntoDB = async (riderUserId: string, payload: { parcelId: string; response: 'ACCEPTED' | 'REJECTED' }) => {
  const { parcelId, response } = payload;

  const rider = await prisma.rider.findUnique({ where: { userId: riderUserId } });
  if (!rider) throw new AppError(404, "Rider not found");

  const parcel = await prisma.parcel.findUnique({ where: { id: parcelId } });
  if (!parcel || parcel.riderId !== rider.id) {
    throw new AppError(403, "Unauthorized access to this parcel");
  }

  if (parcel.deliveryStatus === "CANCELLED") {
    throw new AppError(400, "This parcel has already been cancelled by the user");
  }

  return await prisma.$transaction(async (tx) => {
    if (response === 'ACCEPTED') {
      const updatedParcel = await tx.parcel.update({
        where: { id: parcelId },
        data: { deliveryStatus: "PICKED_UP" }
      });

      await tx.rider.update({
        where: { id: rider.id },
        data: { status: "BUSY" }
      });

      const tracking = await tx.tracking.findUnique({ where: { parcelId } });
      if (tracking) {
        await tx.trackingStep.create({
          data: {
            trackingId: tracking.id,
            status: "PICKED_UP",
            location: rider.district,
            message: "Rider has accepted and picked up the parcel"
          }
        });
         // see is it in right place
      await tx.tracking.update({
        where: { parcelId },
        data: { status: "PICKED_UP" }
      });
      }
     
      return updatedParcel;
    } else {
      const updatedParcel = await tx.parcel.update({
        where: { id: parcelId },
        data: {
          riderId: null,
          deliveryStatus: "PENDING"
        }
      });

      await tx.rider.update({
        where: { id: rider.id },
        data: { status: "AVAILABLE" }
      });

      return updatedParcel;
    }
  });
};

const getRiderDashboardStatsFromDB = async (riderUserId: string) => {
  const rider = await prisma.rider.findUnique({
    where: { userId: riderUserId },
    include: {
      _count: { select: { assignedParcels: true } }
    }
  });

  if (!rider) throw new AppError(404, "Rider not found");

  const deliveredCount = await prisma.parcel.count({
    where: { riderId: rider.id, deliveryStatus: "DELIVERED" }
  });

  const pendingWithdrawAmount = await prisma.withdrawRequest.aggregate({
    where: { riderId: rider.id, status: "PENDING" },
    _sum: { amount: true }
  });

  const withdrawHistory = await prisma.withdrawRequest.findMany({
    where: { riderId: rider.id },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return {
    statistics: {
      totalAssigned: rider._count.assignedParcels,
      totalDelivered: deliveredCount,
      totalEarned: rider.totalEarned,
      withdrawableBalance: rider.withdrawableBalance,
      pendingWithdraw: pendingWithdrawAmount._sum.amount || 0
    },
    withdrawHistory
  };
};

export const RiderService = {
  applyForRiderIntoDB,
  getMyAssignedParcelsFromDB,
  updateParcelStatusIntoDB,
  createWithdrawRequest,
  respondToAssignedParcelIntoDB,
  getRiderDashboardStatsFromDB

};