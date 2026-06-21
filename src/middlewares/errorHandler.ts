import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import ApiError from "../utils/ApiError";
import { env } from "../config/env";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorDetails: unknown = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errorDetails;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = `Duplicate value for field: ${(err.meta?.target as string[])?.join(", ")}`;
      errorDetails = err.meta;
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Requested resource not found";
      errorDetails = err.meta;
    } else {
      statusCode = 400;
      message = "Database request error";
      errorDetails = { code: err.code, meta: err.meta };
    }
  } else if (err instanceof Error) {
    message = err.message;
    if (env.nodeEnv === "development") {
      errorDetails = { stack: err.stack };
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};

export default errorHandler;
