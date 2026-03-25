import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { ParcelService } from "./parcel.service.js";

const createParcel = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await ParcelService.createParcelIntoDB(user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Parcel booked successfully! 🚀",
    data: result,
  });
});

const getMyParcels = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await ParcelService.getMyParcelsFromDB(user.id);

  res.status(200).json({
    success: true,
    message: "Parcels retrieved successfully!",
    data: result,
  });
});

export const ParcelController = {
  createParcel,
  getMyParcels,
};