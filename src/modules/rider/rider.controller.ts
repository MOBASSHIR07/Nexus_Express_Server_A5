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
  const { parcelId, status } = req.body;
  const result = await RiderService.updateParcelStatusIntoDB(user.id, parcelId, status);

  res.status(200).json({
    success: true,
    message: "Status updated successfully",
    data: result
  });
});

export const RiderController = {
  applyForRider,
  getMyAssignedParcels,
  updateStatus
};