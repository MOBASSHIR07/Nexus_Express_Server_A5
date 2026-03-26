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
  const result = await ParcelService.getMyParcelsFromDB(user.id, req.query);

  res.status(200).json({
    success: true,
    message: "Parcels retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const cancelParcel = catchAsync(async (req, res) => {
  const user = (req as any).user;
  const { parcelId } = req.params;
  const result = await ParcelService.cancelParcelByUserFromDB(user.id, parcelId as string);

  res.status(200).json({
    success: true,
    message: "Parcel cancelled successfully",
    data: result
  });
});
const trackParcel = catchAsync(async (req, res) => {
  const { trackingCode } = req.params;
  

  const result = await ParcelService.trackParcelFromDB(trackingCode as string);

   res.status(200).json({
    success: true,
    message: "Tracking data retrieved successfully",
    data: result
  });
});

export const ParcelController = {
  createParcel,
  getMyParcels,
  cancelParcel,
  trackParcel
};