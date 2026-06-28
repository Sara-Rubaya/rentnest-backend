import prisma from "../../config/prisma";
import ApiError from "../../utils/ApiError";

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
};

const updateUserStatus = async (id: string, status: "ACTIVE" | "BANNED") => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role === "ADMIN") {
    throw new ApiError(400, "Cannot change status of an admin account");
  }
  const updated = await prisma.user.update({ where: { id }, data: { status } });
  const { password, ...safeUser } = updated;
  return safeUser;
};

const getAllProperties = async () => {
  return prisma.property.findMany({
    include: { landlord: { select: { id: true, name: true, email: true } }, category: true },
    orderBy: { createdAt: "desc" },
  });
};

const getAllRentals = async () => {
  return prisma.rentalRequest.findMany({
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const AdminService = { getAllUsers, updateUserStatus, getAllProperties, getAllRentals };
