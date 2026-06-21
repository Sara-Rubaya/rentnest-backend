import { Response } from "express";

interface SuccessResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
  data?: T;
}

const sendResponse = <T>(res: Response, payload: SuccessResponse<T>) => {
  res.status(payload.statusCode).json({
    success: payload.success,
    message: payload.message,
    meta: payload.meta,
    data: payload.data,
  });
};

export default sendResponse;
