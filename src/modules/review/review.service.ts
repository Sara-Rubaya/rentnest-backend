import prisma from "../../config/prisma";
import ApiError from "../../utils/ApiError";

const create = async (tenantId: string, rentalRequestId: string, rating: number, comment?: string) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { review: true },
  });

  if (!rentalRequest) {
    throw new ApiError(404, "Rental request not found");
  }
  if (rentalRequest.tenantId !== tenantId) {
    throw new ApiError(403, "You are not allowed to review this rental");
  }
  if (rentalRequest.status !== "ACTIVE" && rentalRequest.status !== "COMPLETED") {
    throw new ApiError(400, "You can only review a rental after payment / completion");
  }
  if (rentalRequest.review) {
    throw new ApiError(409, "A review already exists for this rental");
  }

  return prisma.review.create({
    data: {
      rentalRequestId,
      propertyId: rentalRequest.propertyId,
      tenantId,
      rating,
      comment,
    },
  });
};

export const ReviewService = { create };
