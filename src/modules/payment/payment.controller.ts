import catchAsync from "../../utils/catchAsync.js";
import { PaymentService } from "./payment.service.js";

const getMyPayments = catchAsync(async (req, res) => {
  const user = (req as any).user;
  const result = await PaymentService.getMyPaymentHistoryFromDB(user.id);

  res.status(200).json({
    success: true,
    message: "Payment history retrieved successfully",
    data: result
  });
});

export const PaymentController = {
  getMyPayments
};