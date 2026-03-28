import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { PaymentService } from "./payment.service.js";

// 1️⃣ Checkout Session Create
const createPayment = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { parcelId } = req.body;
  const result = await PaymentService.createPaymentSession(parcelId, user.id);

  res.status(200).json({
    success: true,
    message: "Payment session created successfully",
    data: result
  });
});

// 2️⃣ Webhook —
const handleWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  try {
    await PaymentService.handleWebhookEvent(req.body, signature);
    res.status(200).json({ received: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// 3️⃣ Payment History
const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await PaymentService.getMyPaymentHistoryFromDB(user.id);

  res.status(200).json({
    success: true,
    message: "Payment history retrieved successfully",
    data: result
  });
});

export const PaymentController = {
  createPayment,
  handleWebhook,
  getMyPayments
};