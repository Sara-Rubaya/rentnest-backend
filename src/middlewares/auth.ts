import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import { env } from "../config/env";
import prisma from "../config/prisma";
import { Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const auth = (...allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "Authentication token is missing");
      }

      const token = authHeader.split(" ")[1];
      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
      } catch {
        throw new ApiError(401, "Invalid or expired token");
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        throw new ApiError(401, "User belonging to this token no longer exists");
      }
      if (user.status === "BANNED") {
        throw new ApiError(403, "This account has been banned");
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        throw new ApiError(403, "You do not have permission to perform this action");
      }

      req.user = { id: user.id, email: user.email, role: user.role };
      next();
    } catch (err) {
      next(err);
    }
  };
};
