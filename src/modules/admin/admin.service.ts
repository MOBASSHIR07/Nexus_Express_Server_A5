import { prisma } from "../../lib/prisma.js";
import AppError from "../../errors/AppError.js";
import { getQueryOptions } from "../../utils/queryHelpers.js";
import { UserRole } from "./userRole.js";

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

    const parcel = await tx.parcel.findUnique({
      where: { id: parcelId }
    });

    if (!parcel) {
      throw new AppError(404, "Parcel not found!");
    }


    if (parcel.paymentStatus === "UNPAID") {
      throw new AppError(400, "Cannot assign a rider to an unpaid parcel. Please wait for the payment.");
    }


    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: {
        riderId,
        deliveryStatus: "RIDER_ASSIGNED"
      }
    });


    await tx.rider.update({
      where: { id: riderId },
      data: { status: "BUSY" }
    });


    const tracking = await tx.tracking.findUnique({
      where: { parcelId }
    });

    if (tracking) {
      await tx.trackingStep.create({
        data: {
          trackingId: tracking.id,
          status: "RIDER_ASSIGNED",
          message: "A professional rider has been assigned and is preparing to pick up your parcel."
        }
      });
       // see is it in right place
        await tx.tracking.update({
      where: { parcelId },
      data: { status: "RIDER_ASSIGNED" }
    });

    }
   
  
    return updatedParcel;
  });
};

const approveWithdrawRequest = async (requestId: string) => {
  return await prisma.$transaction(async (tx) => {

    const request = await tx.withdrawRequest.findUnique({
      where: { id: requestId },
      include: { rider: true }
    });

    if (!request || request.status !== "PENDING") {
      throw new AppError(400, "Invalid request or already processed");
    }


    await tx.rider.update({
      where: { id: request.riderId },
      data: {
        totalEarned: { increment: request.amount },
        withdrawableBalance: { decrement: request.amount }
      }
    });


    const updatedRequest = await tx.withdrawRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        processedAt: new Date()
      }
    });


    await tx.riderPayment.updateMany({
      where: {
        riderId: request.riderId,
        status: "PENDING"
      },
      data: { status: "PAID" }
    });

    return updatedRequest;
  });
};


const getAdminDashboardStatsFromDB = async () => {
  const totalParcels = await prisma.parcel.count();
  const totalUsers = await prisma.user.count({ where: { role: "USER" } });
  const totalRiders = await prisma.rider.count({ where: { isApproved: true } });

  const revenueData = await prisma.parcel.aggregate({
    _sum: { price: true }
  });

  const riderPayments = await prisma.riderPayment.aggregate({
    _sum: { amount: true }
  });

  const parcelStatusStats = await prisma.parcel.groupBy({
    by: ['deliveryStatus'],
    _count: { id: true }
  });

  const pendingWithdraws = await prisma.withdrawRequest.count({
    where: { status: "PENDING" }
  });

  // Calculation logic with safety check
  const totalRevenue = Number(revenueData._sum.price || 0);
  const totalRiderCost = Number(riderPayments._sum.amount || 0); // Corrected property

  return {
    summary: {
      totalUsers,
      totalRiders,
      totalParcels,
      totalRevenue,
      totalRiderCost,
      netProfit: totalRevenue - totalRiderCost
    },
    parcelStats: parcelStatusStats,
    pendingActions: {
      withdrawRequests: pendingWithdraws
    }
  };
};


const getAllRidersFromDB = async (query: any) => {
  const searchableFields = ["phone", "district"];
  const { skip, take, searchConditions } = getQueryOptions(query, searchableFields);

  const result = await prisma.rider.findMany({
    where: searchConditions,
    skip,
    take,
    orderBy: { appliedAt: "desc" }, 
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  const total = await prisma.rider.count({ where: searchConditions });

  return {
    meta: { page: Number(query.page) || 1, limit: take, total },
    data: result,
  };
};

const getAllUsersFromDB = async (query: any) => {
  const searchableFields = ["name", "email"];
  const { skip, take, searchConditions } = getQueryOptions(query, searchableFields);

  const result = await prisma.user.findMany({
    where: searchConditions,
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const total = await prisma.user.count({ where: searchConditions });

  return {
    meta: {
      page: Number(query.page) || 1,
      limit: take,
      total,
    },
    data: result,
  };
};



const changeUserRoleIntoDB = async (
  adminId: string,
  targetUserId: string,
  newRole: UserRole
) => {

  if (adminId === targetUserId) {
    throw new AppError(400, "You cannot change your own role. Please contact another admin.");
  }


  const user = await prisma.user.findUnique({
    where: { id: targetUserId }
  });

  if (!user) {
    throw new AppError(404, "Target user not found!");
  }


  return await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole }
  });
};


export const AdminService = {
  getAllParcelsFromDB,
  approveRiderIntoDB,
  assignRiderToParcelIntoDB,
  approveWithdrawRequest,
  getAdminDashboardStatsFromDB,
  getAllRidersFromDB,
  getAllUsersFromDB,
  changeUserRoleIntoDB
};