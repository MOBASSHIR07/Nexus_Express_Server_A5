import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import validateRequest from "../../middleware/validateRequest.js";
import { ParcelValidations } from "./parcel.validation.js";
import { ParcelController } from "./parcel.controller.js";

const router = Router();

router.post(
  "/create-parcel",
  authMiddleware("USER"),
  validateRequest(ParcelValidations.createParcelZodSchema),
  ParcelController.createParcel
);

router.get(
  "/my-parcels",
  authMiddleware("USER", "RIDER"),
  ParcelController.getMyParcels
);

router.patch(
  "/cancel-parcel/:parcelId",
  authMiddleware("USER"),
  ParcelController.cancelParcel
);

router.get(
  "/track/:trackingCode",
  ParcelController.trackParcel 
);

export const ParcelRoutes = router;