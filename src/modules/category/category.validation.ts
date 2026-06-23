import { z } from "zod";

const create = z.object({
  body: z.object({
    name: z.string({ required_error: "Category name is required" }).min(2, "Name must be at least 2 characters"),
  }),
});

export const CategoryValidation = { create };
