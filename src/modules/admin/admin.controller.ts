import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { AdminService } from "./admin.service.js";

const getAllParcels = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllParcelsFromDB(req.query);

  res.status(200).json({
    success: true,
    message: "All parcels retrieved successfully!",
    meta: result.meta,
    data: result.data
  });
});

const approveRider = catchAsync(async (req: Request, res: Response) => {
  const { riderId } = req.params;
  const result = await AdminService.approveRiderIntoDB(riderId as string);

  res.status(200).json({
    success: true,
    message: "Rider approved and user role updated successfully!",
    data: result
  });
});

const assignRider = catchAsync(async (req: Request, res: Response) => {
  const { parcelId, riderId } = req.body;
  const result = await AdminService.assignRiderToParcelIntoDB(parcelId, riderId);

  res.status(200).json({
    success: true,
    message: "Rider assigned to parcel successfully!",
    data: result
  });
});

export const AdminController = {
  getAllParcels,
  approveRider,
  assignRider
};