import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RentalService } from "./rental.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const { propertyId, moveInDate, message } = req.body;
  const result = await RentalService.create(req.user!.id, propertyId, moveInDate, message);
  sendResponse(res, { statusCode: 201, success: true, message: "Rental request submitted successfully", data: result });
});

const getMyRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getMyRequests(req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Rental requests retrieved successfully", data: result });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getById(req.params.id, req.user!.id, req.user!.role);
  sendResponse(res, { statusCode: 200, success: true, message: "Rental request retrieved successfully", data: result });
});

export const RentalController = { create, getMyRequests, getById };
