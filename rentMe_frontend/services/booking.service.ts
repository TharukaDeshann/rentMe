/**
 * Booking Service
 * All API calls for bookings.
 */

import apiClient, { getErrorMessage } from "@/lib/api/axios";
import {
  Booking,
  BookingRequestDTO,
  BookingStatusUpdateDTO,
} from "@/types/booking";

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
export const getBookingById = async (bookingId: number | string): Promise<Booking> => {
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
  bookingId: number | string,
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
  bookingId: number | string,
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

/**
 * GET /admin/bookings — list all bookings for admin
 */
export const getAllBookingsAdmin = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.get<Booking[]>("/admin/bookings");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * PATCH /admin/bookings/:id/status — update booking status or cancel by admin
 */
export const adminUpdateBookingStatus = async (
  bookingId: number | string,
  data: any
): Promise<Booking> => {
  try {
    const response = await apiClient.patch<Booking>(
      `/admin/bookings/${bookingId}/status`,
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const markBookingAsPickedUp = async (
  bookingId: number | string
): Promise<{ bookingId: number; actualPickUpTime: string }> => {
  try {
    const response = await apiClient.patch<{ bookingId: number; actualPickUpTime: string }>(
      `/owner/bookings/${bookingId}/pickup`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const uploadBookingConditionImages = async (
  bookingId: number | string,
  files: File[]
): Promise<import("@/types/document").Document[]> => {
  try {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));

    const response = await apiClient.post<import("@/types/document").Document[]>(
      `/owner/bookings/${bookingId}/condition-images`,
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

const bookingService = {
  createBooking,
  getMyBookingsAsRenter,
  getBookingById,
  cancelBookingAsRenter,
  getMyBookingsAsOwner,
  getPendingBookingRequests,
  updateBookingStatusAsOwner,
  getAllBookingsAdmin,
  adminUpdateBookingStatus,
  markBookingAsPickedUp,
  uploadBookingConditionImages,
};

export default bookingService;
