import { z } from "zod";

const create = z.object({
  body: z.object({
    rentalRequestId: z.string({ required_error: "Rental request id is required" }).uuid("Invalid rental request id"),
    rating: z
      .number({ required_error: "Rating is required" })
      .int("Rating must be an integer")
      .min(1, "Rating must be between 1 and 5")
      .max(5, "Rating must be between 1 and 5"),
    comment: z.string().max(1000, "Comment must be under 1000 characters").optional(),
  }),
});

export const ReviewValidation = { create };
