import { prisma } from "../../lib/prisma.js";

const getMyPaymentHistoryFromDB = async (userId: string) => {
  return await prisma.payment.findMany({
    where: { userId },
    include: {
      parcel: {
        select: {
          title: true,
          trackingCode: true,
          price: true,
          deliveryStatus: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

export const PaymentService = {
  getMyPaymentHistoryFromDB
};