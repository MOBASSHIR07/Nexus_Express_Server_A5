import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { AdminController } from "./admin.controller.js";

const router = Router();

router.get(
  "/parcels", 
  authMiddleware("ADMIN"), 
  AdminController.getAllParcels
);

router.patch(
  "/approve-rider/:riderId", 
  authMiddleware("ADMIN"), 
  AdminController.approveRider
);

router.patch(
  "/assign-rider", 
  authMiddleware("ADMIN"), 
  AdminController.assignRider
);

export const AdminRoutes = router;