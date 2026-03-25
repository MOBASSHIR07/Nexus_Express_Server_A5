import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { RiderService } from "./rider.service.js";

const applyForRider = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await RiderService.applyForRiderIntoDB(user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Rider profile created successfully! 🛵",
    data: result
  });
});

export const RiderController = {
  applyForRider
};