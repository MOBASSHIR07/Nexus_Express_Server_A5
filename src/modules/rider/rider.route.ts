import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import validateRequest from "../../middleware/validateRequest.js";
import { RiderValidations } from "./rider.validation.js";
import { RiderController } from "./rider.controller.js";

const router = Router();

router.post(
  "/apply",
  authMiddleware("USER"),
  validateRequest(RiderValidations.applyRiderZodSchema),
  RiderController.applyForRider
);

router.get(
  "/my-parcels",
  authMiddleware("RIDER"),
  RiderController.getMyAssignedParcels
);

router.patch(
  "/update-status",
  authMiddleware("RIDER"),
  validateRequest(RiderValidations.updateStatusZodSchema),
  RiderController.updateStatus
);

router.post(
  "/withdraw-request",
   authMiddleware("RIDER"),
  RiderController.createWithdrawRequest
);

export const RiderRoutes = router;