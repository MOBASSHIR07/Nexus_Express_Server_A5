import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { ReviewController } from "./review.controller.js";

const router = Router();

router.post(
  "/create-review",
  authMiddleware("USER"),
  ReviewController.createReview
);

export const ReviewRoutes = router;