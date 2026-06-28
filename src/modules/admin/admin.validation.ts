import { z } from "zod";

const updateUserStatus = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "BANNED"], {
      errorMap: () => ({ message: "Status must be either ACTIVE or BANNED" }),
    }),
  }),
});

export const AdminValidation = { updateUserStatus };
