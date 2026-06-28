import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers();
  sendResponse(res, { statusCode: 200, success: true, message: "Users retrieved successfully", data: result });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.updateUserStatus(req.params.id, req.body.status);
  sendResponse(res, { statusCode: 200, success: true, message: "User status updated successfully", data: result });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllProperties();
  sendResponse(res, { statusCode: 200, success: true, message: "Properties retrieved successfully", data: result });
});

const getAllRentals = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllRentals();
  sendResponse(res, { statusCode: 200, success: true, message: "Rental requests retrieved successfully", data: result });
});

export const AdminController = { getAllUsers, updateUserStatus, getAllProperties, getAllRentals };
