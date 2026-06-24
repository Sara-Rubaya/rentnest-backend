import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import ApiError from "../../utils/ApiError";

interface PropertyFilters {
  location?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  categoryId?: string;
  search?: string;
  page?: string;
  limit?: string;
}

const getAll = async (filters: PropertyFilters) => {
  const { location, type, minPrice, maxPrice, categoryId, search } = filters;
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.PropertyWhereInput = {
    isAvailable: true,
  };

  if (location) where.location = { contains: location, mode: "insensitive" };
  if (type) where.type = { equals: type, mode: "insensitive" };
  if (categoryId) where.categoryId = categoryId;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { category: true, landlord: { select: { id: true, name: true, email: true, phone: true } } },
    }),
    prisma.property.count({ where }),
  ]);

  return { properties, meta: { page, limit, total } };
};

const getById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      landlord: { select: { id: true, name: true, email: true, phone: true } },
      reviews: { include: { tenant: { select: { id: true, name: true } } } },
    },
  });
  if (!property) {
    throw new ApiError(404, "Property not found");
  }
  return property;
};

const create = async (landlordId: string, payload: Prisma.PropertyUncheckedCreateInput) => {
  return prisma.property.create({ data: { ...payload, landlordId } });
};

const update = async (id: string, landlordId: string, payload: Prisma.PropertyUncheckedUpdateInput) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new ApiError(404, "Property not found");
  }
  if (property.landlordId !== landlordId) {
    throw new ApiError(403, "You are not allowed to update this property");
  }
  return prisma.property.update({ where: { id }, data: payload });
};

const remove = async (id: string, landlordId: string) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new ApiError(404, "Property not found");
  }
  if (property.landlordId !== landlordId) {
    throw new ApiError(403, "You are not allowed to delete this property");
  }
  await prisma.property.delete({ where: { id } });
  return null;
};

const getMyProperties = async (landlordId: string) => {
  return prisma.property.findMany({
    where: { landlordId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
};

export const PropertyService = { getAll, getById, create, update, remove, getMyProperties };
