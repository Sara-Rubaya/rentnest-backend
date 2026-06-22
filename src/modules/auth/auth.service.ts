import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import ApiError from "../../utils/ApiError";
import { env } from "../../config/env";
import { Role } from "@prisma/client";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "TENANT" | "LANDLORD";
}

const generateToken = (id: string, email: string, role: Role) => {
  return jwt.sign({ id, email, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
};

const register = async (payload: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      role: payload.role,
    },
  });

  const token = generateToken(user.id, user.email, user.role);
  const { password, ...safeUser } = user;

  return { user: safeUser, token };
};

const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status === "BANNED") {
    throw new ApiError(403, "This account has been banned. Contact support.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user.id, user.email, user.role);
  const { password: _pw, ...safeUser } = user;

  return { user: safeUser, token };
};

const getMe = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const { password, ...safeUser } = user;
  return safeUser;
};

export const AuthService = { register, login, getMe };
