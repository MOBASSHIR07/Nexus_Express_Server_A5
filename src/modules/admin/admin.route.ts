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
router.patch(
  "/approve-withdraw/:requestId",
  authMiddleware("ADMIN"),
  AdminController.approveWithdrawRequest
);

router.get(
  "/dashboard",
  authMiddleware("ADMIN"),
  AdminController.getAdminDashboard
);

router.get(
  "/withdraw-requests", 
  authMiddleware("ADMIN"), 
  AdminController.getAllWithdrawRequests 
);

router.get("/riders", authMiddleware("ADMIN"), AdminController.getAllRiders);
router.get("/users", authMiddleware("ADMIN"), AdminController.getAllUsers);
router.patch("/change-role/:userId", authMiddleware("ADMIN"), AdminController.changeRole);

export const AdminRoutes = router;