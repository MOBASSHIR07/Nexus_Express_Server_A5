
import { Router } from "express";

import { PaymentController } from "./payment.controller.js";

const router = Router();


router.post("/webhook", PaymentController.handleWebhook);

export const PaymentWebhookRoutes = router;
