import Stripe from "stripe";
import prisma from "../../config/prisma";
import stripe from "../../config/stripe";
import ApiError from "../../utils/ApiError";
import { env } from "../../config/env";

// Create a Stripe Checkout session for an APPROVED rental request
const createPayment = async (userId: string, rentalRequestId: string) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rentalRequest) {
    throw new ApiError(404, "Rental request not found");
  }
  if (rentalRequest.tenantId !== userId) {
    throw new ApiError(403, "You are not allowed to pay for this rental request");
  }
  if (rentalRequest.status !== "APPROVED") {
    throw new ApiError(400, "Payment can only be made for an approved rental request");
  }
  if (rentalRequest.payment) {
    throw new ApiError(409, "A payment already exists for this rental request");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Rent: ${rentalRequest.property.title}` },
          unit_amount: Math.round(rentalRequest.property.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { rentalRequestId, userId },
    success_url: `${env.clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.clientUrl}/payment/cancel`,
  });

  const payment = await prisma.payment.create({
    data: {
      transactionId: session.id,
      amount: rentalRequest.property.price,
      provider: "STRIPE",
      status: "PENDING",
      rentalRequestId,
      userId,
    },
  });

  return { checkoutUrl: session.url, sessionId: session.id, payment };
};

// Handle Stripe webhook event: checkout.session.completed
const handleWebhookEvent = async (event: Stripe.Event) => {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await finalizePayment(session.id, session.payment_method_types?.[0]);
  }
  return null;
};

// Manual verification fallback (useful when testing via Postman without a live webhook)
const verifySession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status === "paid") {
    return finalizePayment(sessionId, session.payment_method_types?.[0]);
  }
  throw new ApiError(400, `Payment not completed yet. Current status: ${session.payment_status}`);
};

const finalizePayment = async (sessionId: string, method?: string) => {
  const payment = await prisma.payment.findUnique({ where: { transactionId: sessionId } });
  if (!payment) {
    throw new ApiError(404, "Payment record not found for this session");
  }
  if (payment.status === "COMPLETED") {
    return payment;
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "COMPLETED", paidAt: new Date(), method: method || "card" },
  });

  await prisma.rentalRequest.update({
    where: { id: payment.rentalRequestId },
    data: { status: "ACTIVE" },
  });

  return updated;
};

const getMyPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    include: { rentalRequest: { include: { property: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string, userId: string, role: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { rentalRequest: { include: { property: true } } },
  });
  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }
  if (role !== "ADMIN" && payment.userId !== userId) {
    throw new ApiError(403, "You are not allowed to view this payment");
  }
  return payment;
};

export const PaymentService = { createPayment, handleWebhookEvent, verifySession, getMyPayments, getById };
