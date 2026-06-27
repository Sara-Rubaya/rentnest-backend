import { Request, Response } from "express";
import Stripe from "stripe";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import stripe from "../../config/stripe";
import { env } from "../../config/env";
import ApiError from "../../utils/ApiError";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createPayment(req.user!.id, req.body.rentalRequestId);
  sendResponse(res, { statusCode: 201, success: true, message: "Payment session created successfully", data: result });
});

// Stripe webhook endpoint (must use raw body)
const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripeWebhookSecret);
  } catch (err) {
    throw new ApiError(400, `Webhook signature verification failed: ${(err as Error).message}`);
  }
  await PaymentService.handleWebhookEvent(event);
  res.status(200).json({ received: true });
});

// Manual verification fallback for Postman/local testing
const verifySession = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.verifySession(req.params.sessionId);
  sendResponse(res, { statusCode: 200, success: true, message: "Payment verified successfully", data: result });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getMyPayments(req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Payment history retrieved successfully", data: result });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getById(req.params.id, req.user!.id, req.user!.role);
  sendResponse(res, { statusCode: 200, success: true, message: "Payment retrieved successfully", data: result });
});

export const PaymentController = { createPayment, confirmPayment, verifySession, getMyPayments, getById };
