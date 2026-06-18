import { useState, useEffect, useCallback } from "react";
import reviewService from "@/services/review.service";
import {
  CreateReviewRequestDTO,
  ReviewResponseDTO,
  VehicleReviewSummaryDTO,
  OwnerReviewSummaryDTO,
} from "@/types/review";

/**
 * Hook to fetch and manage reviews list for a vehicle
 */
export function useVehicleReviews(vehicleId: number) {
  const [reviews, setReviews] = useState<ReviewResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await reviewService.getReviewsByVehicle(vehicleId);
      setReviews(data);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
}

/**
 * Hook to fetch and manage review summary for a vehicle
 */
export function useVehicleReviewSummary(vehicleId: number) {
  const [summary, setSummary] = useState<VehicleReviewSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await reviewService.getVehicleReviewSummary(vehicleId);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || "Failed to load rating summary.");
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}

/**
 * Hook to fetch and manage owner aggregate rating
 */
export function useOwnerRating(ownerId: number) {
  const [summary, setSummary] = useState<OwnerReviewSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRating = useCallback(async () => {
    if (!ownerId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await reviewService.getOwnerReviewSummary(ownerId);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || "Failed to load owner rating.");
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchRating();
  }, [fetchRating]);

  return { rating: summary, loading, error, refetch: fetchRating };
}

/**
 * Hook to submit a review
 */
export function useCreateReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateReviewRequestDTO): Promise<ReviewResponseDTO> => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewService.createReview(data);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to submit review.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createReview: create, loading, error };
}

/**
 * Hook to delete a review
 */
export function useDeleteReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (reviewId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await reviewService.deleteReview(reviewId);
    } catch (err: any) {
      setError(err.message || "Failed to delete review.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteReview: remove, loading, error };
}
