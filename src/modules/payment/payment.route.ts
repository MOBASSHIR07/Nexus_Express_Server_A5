import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { PaymentController } from "./payment.controller.js";

const router = Router();

// 1️⃣ Webhook — 


// 2️⃣ Checkout Session Create
router.post(
  "/create-payment",
  authMiddleware("USER"),
  PaymentController.createPayment
);

// 3️⃣ Payment History
router.get(
  "/my-history",
  authMiddleware("USER"),
  PaymentController.getMyPayments
);

export const PaymentRoutes = router;