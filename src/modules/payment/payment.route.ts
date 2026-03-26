import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { PaymentController } from "./payment.controller.js";

const router = Router();

router.get(
  "/my-history",
  authMiddleware("USER"),
  PaymentController.getMyPayments
);

export const PaymentRoutes = router;