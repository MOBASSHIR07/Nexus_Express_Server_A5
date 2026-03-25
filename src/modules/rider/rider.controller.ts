import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { RiderService } from "./rider.service.js";

const applyForRider = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await RiderService.applyForRiderIntoDB(user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    data: result
  });
});

const getMyAssignedParcels = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await RiderService.getMyAssignedParcelsFromDB(user.id, req.query);

  res.status(200).json({
    success: true,
    message: "Assigned parcels retrieved successfully",
    meta: result.meta,
    data: result.data
  });
});



const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await RiderService.updateParcelStatusIntoDB(user.id, req.body);

  res.status(200).json({
    success: true,
    message: "Status updated and earnings calculated",
    data: result
  });
});
const createWithdrawRequest = catchAsync(async (req, res) => {
  const userId = (req.user as any).id; 
  const result = await RiderService.createWithdrawRequest(userId, req.body);

  res.status(201).json({
    success: true,
    message: "Withdraw request sent successfully!",
    data: result,
  });
});

export const RiderController = {
  applyForRider,
  getMyAssignedParcels,
  updateStatus,
  createWithdrawRequest

  
};