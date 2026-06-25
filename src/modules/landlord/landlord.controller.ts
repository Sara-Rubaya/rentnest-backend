import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PropertyService } from "../property/property.service";
import { RentalService } from "../rental/rental.service";

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.create(req.user!.id, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Property created successfully", data: result });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.update(req.params.id, req.user!.id, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "Property updated successfully", data: result });
});

const removeProperty = catchAsync(async (req: Request, res: Response) => {
  await PropertyService.remove(req.params.id, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Property removed successfully", data: null });
});

const getMyProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getMyProperties(req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Your properties retrieved successfully", data: result });
});

const getRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getRequestsForLandlord(req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Rental requests retrieved successfully", data: result });
});

const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.updateStatus(req.params.id, req.user!.id, req.body.status);
  sendResponse(res, { statusCode: 200, success: true, message: `Rental request ${result.status.toLowerCase()} successfully`, data: result });
});

export const LandlordController = {
  createProperty,
  updateProperty,
  removeProperty,
  getMyProperties,
  getRequests,
  updateRequestStatus,
};
