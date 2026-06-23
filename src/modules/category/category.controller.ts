import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryService } from "./category.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.create(req.body.name);
  sendResponse(res, { statusCode: 201, success: true, message: "Category created successfully", data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getAll();
  sendResponse(res, { statusCode: 200, success: true, message: "Categories retrieved successfully", data: result });
});

export const CategoryController = { create, getAll };
