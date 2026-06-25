import prisma from "../../config/prisma";
import ApiError from "../../utils/ApiError";

const create = async (tenantId: string, propertyId: string, moveInDate?: string, message?: string) => {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    throw new ApiError(404, "Property not found");
  }
  if (!property.isAvailable) {
    throw new ApiError(400, "This property is not currently available");
  }

  return prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId,
      moveInDate: moveInDate ? new Date(moveInDate) : undefined,
      message,
    },
    include: { property: true },
  });
};

// Tenant's own requests
const getMyRequests = async (tenantId: string) => {
  return prisma.rentalRequest.findMany({
    where: { tenantId },
    include: { property: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string, userId: string, role: string) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { property: true, tenant: { select: { id: true, name: true, email: true } }, payment: true },
  });
  if (!request) {
    throw new ApiError(404, "Rental request not found");
  }

  const isOwnerTenant = request.tenantId === userId;
  const isOwnerLandlord = request.property.landlordId === userId;
  if (role !== "ADMIN" && !isOwnerTenant && !isOwnerLandlord) {
    throw new ApiError(403, "You are not allowed to view this rental request");
  }

  return request;
};

// Landlord: all requests for their properties
const getRequestsForLandlord = async (landlordId: string) => {
  return prisma.rentalRequest.findMany({
    where: { property: { landlordId } },
    include: { property: true, tenant: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const updateStatus = async (id: string, landlordId: string, status: "APPROVED" | "REJECTED") => {
  const request = await prisma.rentalRequest.findUnique({ where: { id }, include: { property: true } });
  if (!request) {
    throw new ApiError(404, "Rental request not found");
  }
  if (request.property.landlordId !== landlordId) {
    throw new ApiError(403, "You are not allowed to update this rental request");
  }
  if (request.status !== "PENDING") {
    throw new ApiError(400, `Request has already been ${request.status.toLowerCase()}`);
  }

  return prisma.rentalRequest.update({ where: { id }, data: { status } });
};

export const RentalService = { create, getMyRequests, getById, getRequestsForLandlord, updateStatus };
