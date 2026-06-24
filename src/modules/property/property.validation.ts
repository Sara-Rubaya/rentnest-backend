import { z } from "zod";

const create = z.object({
  body: z.object({
    title: z.string({ required_error: "Title is required" }).min(3, "Title must be at least 3 characters"),
    description: z.string({ required_error: "Description is required" }).min(10, "Description must be at least 10 characters"),
    location: z.string({ required_error: "Location is required" }).min(2, "Location is required"),
    price: z.number({ required_error: "Price is required" }).positive("Price must be a positive number"),
    type: z.string({ required_error: "Property type is required" }),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    categoryId: z.string().uuid("Invalid category id").optional(),
  }),
});

const update = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    location: z.string().min(2).optional(),
    price: z.number().positive().optional(),
    type: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional(),
    categoryId: z.string().uuid().optional(),
  }),
});

export const PropertyValidation = { create, update };
