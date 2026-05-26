/**
 * Vehicle & Booking Service
 * All API calls for vehicles and bookings.
 * Follows the same pattern as auth.service.ts and user.service.ts.
 */

import apiClient, { getErrorMessage } from "@/lib/api/axios";
import {
  Vehicle,
  VehicleType,
  Booking,
  BookingRequestDTO,
  BookingStatusUpdateDTO,
} from "@/types/booking";

// ─── Vehicle APIs ─────────────────────────────────────────────────────────────

/**
 * GET /public/vehicles — list available vehicles with optional filters
 */
export const getAvailableVehicles = async (
  type?: VehicleType,
  maxPrice?: number
): Promise<Vehicle[]> => {
  try {
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (maxPrice !== undefined) params.maxPrice = String(maxPrice);

    const response = await apiClient.get<Vehicle[]>("/public/vehicles", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /public/vehicles/:id — single vehicle detail
 */
export const getVehicleById = async (vehicleId: number): Promise<Vehicle> => {
  try {
    const response = await apiClient.get<Vehicle>(
      `/public/vehicles/${vehicleId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /public/vehicles/map — vehicles in a lat/lng bounding box
 */
export const getVehiclesInBounds = async (
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number
): Promise<Vehicle[]> => {
  try {
    const response = await apiClient.get<Vehicle[]>("/public/vehicles/map", {
      params: { minLat, maxLat, minLng, maxLng },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /owner/vehicles — owner's own vehicles
 */
export const getMyVehiclesAsOwner = async (): Promise<Vehicle[]> => {
  try {
    const response = await apiClient.get<Vehicle[]>("/owner/vehicles");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// ─── Booking APIs (Renter) ────────────────────────────────────────────────────

/**
 * POST /bookings — renter creates a booking request
 */
export const createBooking = async (
  data: BookingRequestDTO
): Promise<Booking> => {
  try {
    const response = await apiClient.post<Booking>("/bookings", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /bookings/my — renter's own bookings
 */
export const getMyBookingsAsRenter = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.get<Booking[]>("/bookings/my");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /bookings/:id — single booking (renter, owner, or admin)
 */
export const getBookingById = async (bookingId: number): Promise<Booking> => {
  try {
    const response = await apiClient.get<Booking>(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * PATCH /bookings/:id/cancel — renter cancels their PENDING booking
 */
export const cancelBookingAsRenter = async (
  bookingId: number,
  cancellationReason?: string
): Promise<Booking> => {
  try {
    const response = await apiClient.patch<Booking>(
      `/bookings/${bookingId}/cancel`,
      { cancellationReason }
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// ─── Booking APIs (Owner) ─────────────────────────────────────────────────────

/**
 * GET /owner/bookings — all bookings across owner's vehicles
 */
export const getMyBookingsAsOwner = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.get<Booking[]>("/owner/bookings");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /owner/bookings/pending — PENDING requests awaiting owner decision
 */
export const getPendingBookingRequests = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.get<Booking[]>("/owner/bookings/pending");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * PATCH /owner/bookings/:id/status — owner approves or rejects
 */
export const updateBookingStatusAsOwner = async (
  bookingId: number,
  data: BookingStatusUpdateDTO
): Promise<Booking> => {
  try {
    const response = await apiClient.patch<Booking>(
      `/owner/bookings/${bookingId}/status`,
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// ─── Default export (matches auth.service / user.service pattern) ─────────────

const bookingService = {
  getAvailableVehicles,
  getVehicleById,
  getVehiclesInBounds,
  getMyVehiclesAsOwner,
  createBooking,
  getMyBookingsAsRenter,
  getBookingById,
  cancelBookingAsRenter,
  getMyBookingsAsOwner,
  getPendingBookingRequests,
  updateBookingStatusAsOwner,
};

export default bookingService;