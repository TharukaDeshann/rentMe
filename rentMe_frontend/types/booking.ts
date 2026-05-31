/**
 * Vehicle & Booking TypeScript types
 * Mirrors the backend DTOs exactly — field names must match API responses.
 */

// ─── Vehicle ─────────────────────────────────────────────────────────────────

export type VehicleType =
  | "SEDAN"
  | "SUV"
  | "TRUCK"
  | "VAN"
  | "MOTORCYCLE"
  | "HATCHBACK"
  | "COUPE"
  | "CONVERTIBLE"
  | "MINIVAN"
  | "PICKUP";

  export const VEHICLE_TYPES: VehicleType[] = [
  "SEDAN",
  "SUV",
  "TRUCK",
  "VAN",
  "MOTORCYCLE",
  "HATCHBACK",
  "COUPE",
  "CONVERTIBLE",
  "MINIVAN",
  "PICKUP",
];

export interface Vehicle {
  vehicleId: number;
  make: string;
  model: string;
  type: VehicleType;
  capacity: number;
  dailyPrice: number;
  description?: string;
  pictures?: string;
  pickupLocation: string;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  isListed: boolean;
  vehicleOwnerId: number;
  ownerName: string;
  ownerEmail: string;
  ownerContactNumber: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export interface Booking {
  bookingId: number;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  dailyPrice: number;
  totalAmount: number;
  notes?: string;
  cancellationReason?: string;
  // Vehicle summary
  vehicleId: number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleType: string;
  vehiclePickupLocation: string;
  vehiclePictures?: string;
  // Renter summary
  renterId: number;
  renterName: string;
  renterEmail: string;
  renterContactNumber: string;
  // Owner summary
  vehicleOwnerId: number;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface BookingRequestDTO {
  vehicleId: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  notes?: string;
}

export interface BookingStatusUpdateDTO {
  newStatus: "APPROVED" | "CANCELLED";
  cancellationReason?: string;
}

// ─── API Error shape ──────────────────────────────────────────────────────────

export interface ApiError {
  success: false;
  message: string;
}