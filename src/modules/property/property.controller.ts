import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PropertyService } from "./property.service";

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { properties, meta } = await PropertyService.getAll(req.query as Record<string, string>);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Properties retrieved successfully",
    meta,
    data: properties,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getById(req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Property retrieved successfully", data: result });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.create(req.user!.id, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Property created successfully", data: result });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.update(req.params.id, req.user!.id, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "Property updated successfully", data: result });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await PropertyService.remove(req.params.id, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Property removed successfully", data: null });
});

const getMyProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getMyProperties(req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Your properties retrieved successfully", data: result });
});

export const PropertyController = { getAll, getById, create, update, remove, getMyProperties };
