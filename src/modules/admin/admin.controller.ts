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

const approveWithdrawRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params ;
  const result = await AdminService.approveWithdrawRequest(requestId as string);

  res.status(200).json({
    success: true,
    message: "Withdraw request approved!",
    data: result,
  });
});

const getAdminDashboard = catchAsync(async (req, res) => {
  const result = await AdminService.getAdminDashboardStatsFromDB();

  res.status(200).json({
    success: true,
    message: "Admin dashboard statistics retrieved successfully",
    data: result
  });
});

const changeRole = catchAsync(async (req, res) => {
  const admin = (req as any).user; 
  const { userId } = req.params;  
  const { role } = req.body;      

  const result = await AdminService.changeUserRoleIntoDB(
    admin.id, 
    userId as string, 
    role 
  );

  res.status(200).json({
    success: true,
    message: "User role updated successfully!",
    data: result
  });
});
 const getAllRiders = catchAsync(async (req, res) => {
  const result = await AdminService.getAllRidersFromDB(req.query);
  res.status(200).json({ success: true, message: "Riders retrieved successfully!", data: result });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await AdminService.getAllUsersFromDB(req.query);
  res.status(200).json({ success: true, message: "Users retrieved successfully!", data: result });
});

const getAllWithdrawRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllWithdrawRequestsFromDB();

  res.status(200).json({
    success: true,
    message: "Withdraw requests retrieved successfully!",
    data: result
  });
})



export const AdminController = {
  getAllParcels,
  approveRider,
  assignRider,
  approveWithdrawRequest,
  getAdminDashboard,
  changeRole,
  getAllRiders,
  getAllUsers,
  getAllWithdrawRequests
};