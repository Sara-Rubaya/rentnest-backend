import { z } from "zod";

const register = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    role: z.enum(["TENANT", "LANDLORD"], {
      errorMap: () => ({ message: "Role must be either TENANT or LANDLORD" }),
    }),
  }),
});

const login = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export const AuthValidation = { register, login };
