import Stripe from "stripe";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../errors/AppError.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// 1️⃣ Checkout Session Create
const createPaymentSession = async (parcelId: string, userId: string) => {
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId }
  });

  if (!parcel) throw new AppError(404, "Parcel not found");
  if (parcel.senderId !== userId) throw new AppError(403, "Unauthorized");
  if (parcel.paymentStatus === "PAID") {
    throw new AppError(400, "This parcel is already paid");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: parcel.title,
            description: `Tracking: ${parcel.trackingCode}`
          },
          unit_amount: Math.round(Number(parcel.price) * 100)
        },
        quantity: 1
      }
    ],
    metadata: {
      parcelId: parcel.id,
      userId
    },
    success_url: `${process.env.FRONTEND_URL}/payment/success?parcelId=${parcel.id}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
  });

  return { paymentUrl: session.url };
};

// 2️⃣ Webhook Handle


const handleWebhookEvent = async (rawBody: Buffer, signature: string) => {
  let event: Stripe.Event;
  

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.log("❌ Webhook signature verification failed:", err.message);
    throw new AppError(400, `Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const parcelId = session.metadata?.parcelId;
    const userId = session.metadata?.userId;

    if (!parcelId || !userId) throw new AppError(400, "Missing metadata");

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          userId,
          parcelId,
          transactionId: session.payment_intent as string,
          amount: Number(session.amount_total) / 100
        }
      });

      await tx.parcel.update({
        where: { id: parcelId },
        data: { paymentStatus: "PAID" }
      });

      const tracking = await tx.tracking.findUnique({ where: { parcelId } });
      
      if (tracking) {
        await tx.trackingStep.create({
          data: {
            trackingId: tracking.id,
            status: "PENDING",
            message: "Payment confirmed. Your parcel is now ready for rider assignment.",
          }
        });
      }
    });
    
    console.log(`✅ Webhook Success: Parcel ${parcelId} is now PAID`);
  }
};

// 3️⃣ Payment History
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
  createPaymentSession,
  handleWebhookEvent,
  getMyPaymentHistoryFromDB
};