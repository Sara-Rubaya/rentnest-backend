import { z } from "zod";

const create = z.object({
  body: z.object({
    propertyId: z.string({ required_error: "Property id is required" }).uuid("Invalid property id"),
    moveInDate: z.string().datetime().optional(),
    message: z.string().optional(),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"], {
      errorMap: () => ({ message: "Status must be either APPROVED or REJECTED" }),
    }),
  }),
});

export const RentalValidation = { create, updateStatus };
