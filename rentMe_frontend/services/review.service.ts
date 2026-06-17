import apiClient, { getErrorMessage } from "@/lib/api/axios";
import {
  CreateReviewRequestDTO,
  ReviewResponseDTO,
  VehicleReviewSummaryDTO,
  OwnerReviewSummaryDTO,
} from "@/types/review";

/**
 * POST /api/v1/reviews — Create a review (Renter only)
 */
export const createReview = async (
  data: CreateReviewRequestDTO
): Promise<ReviewResponseDTO> => {
  try {
    const response = await apiClient.post<ReviewResponseDTO>("/reviews", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * DELETE /api/v1/reviews/:reviewId — Delete a review (Renter owner or Admin)
 */
export const deleteReview = async (reviewId: number): Promise<void> => {
  try {
    await apiClient.delete(`/reviews/${reviewId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /api/v1/public/reviews/vehicle/:vehicleId — List reviews of a vehicle (Public)
 */
export const getReviewsByVehicle = async (
  vehicleId: number | string
): Promise<ReviewResponseDTO[]> => {
  try {
    const response = await apiClient.get<ReviewResponseDTO[]>(
      `/public/reviews/vehicle/${vehicleId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /api/v1/public/reviews/vehicle/:vehicleId/summary — Average rating & total count for a vehicle (Public)
 */
export const getVehicleReviewSummary = async (
  vehicleId: number | string
): Promise<VehicleReviewSummaryDTO> => {
  try {
    const response = await apiClient.get<VehicleReviewSummaryDTO>(
      `/public/reviews/vehicle/${vehicleId}/summary`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /api/v1/public/reviews/owner/:ownerId/average — Average rating for owner (Public)
 */
export const getOwnerAverageRating = async (
  ownerId: number | string
): Promise<number> => {
  try {
    const response = await apiClient.get<number>(
      `/public/reviews/owner/${ownerId}/average`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /api/v1/public/reviews/owner/:ownerId/summary — Average rating & total reviews count for owner (Public)
 */
export const getOwnerReviewSummary = async (
  ownerId: number | string
): Promise<OwnerReviewSummaryDTO> => {
  try {
    const response = await apiClient.get<OwnerReviewSummaryDTO>(
      `/public/reviews/owner/${ownerId}/summary`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /api/v1/admin/reviews — List all reviews (Admin only)
 */
export const getAllReviewsAdmin = async (): Promise<ReviewResponseDTO[]> => {
  try {
    const response = await apiClient.get<ReviewResponseDTO[]>("/admin/reviews");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

const reviewService = {
  createReview,
  deleteReview,
  getReviewsByVehicle,
  getVehicleReviewSummary,
  getOwnerAverageRating,
  getOwnerReviewSummary,
  getAllReviewsAdmin,
};

export default reviewService;
