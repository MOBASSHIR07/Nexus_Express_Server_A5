import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { ReviewService } from "./review.service.js";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await ReviewService.createReviewIntoDB(user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Thank you for your feedback! ⭐",
    data: result
  });
});

export const ReviewController = {
  createReview
};