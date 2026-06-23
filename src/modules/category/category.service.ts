import prisma from "../../config/prisma";
import ApiError from "../../utils/ApiError";

const create = async (name: string) => {
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    throw new ApiError(409, "Category already exists");
  }
  return prisma.category.create({ data: { name } });
};

const getAll = async () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

export const CategoryService = { create, getAll };
