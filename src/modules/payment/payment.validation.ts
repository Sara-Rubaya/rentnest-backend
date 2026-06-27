import { z } from "zod";

const createPayment = z.object({
  body: z.object({
    rentalRequestId: z.string({ required_error: "Rental request id is required" }).uuid("Invalid rental request id"),
  }),
});

export const PaymentValidation = { createPayment };
