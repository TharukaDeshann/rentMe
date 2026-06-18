/**
 * Review & Rating TypeScript types
 * Mirrors backend DTO contracts exactly.
 */

export interface CreateReviewRequestDTO {
  bookingId: number;
  rating: number; // 1–5
  comment?: string;
}

export interface ReviewResponseDTO {
  reviewId: number;
  bookingId: number;
  vehicleId: number;
  vehicleOwnerId: number;
  reviewerId: number;
  reviewerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface VehicleReviewSummaryDTO {
  vehicleId: number;
  averageRating: number;
  totalReviews: number;
}

export interface OwnerReviewSummaryDTO {
  ownerId: number;
  averageRating: number;
  totalReviews: number;
}
