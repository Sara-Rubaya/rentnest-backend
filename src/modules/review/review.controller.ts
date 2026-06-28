import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./review.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const { rentalRequestId, rating, comment } = req.body;
  const result = await ReviewService.create(req.user!.id, rentalRequestId, rating, comment);
  sendResponse(res, { statusCode: 201, success: true, message: "Review submitted successfully", data: result });
});

export const ReviewController = { create };
