/**
 * User-related TypeScript types
 * Centralized user type definitions for consistency across the application
 */

export enum UserRole {
  ADMIN = "ADMIN",
  VEHICLE_OWNER = "VEHICLE_OWNER",
  RENTER = "RENTER",
}

export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
}

export interface User {
  userId: number;
  fullName: string;
  email: string;
  contactNumber: string;
  role: UserRole;
  authProvider: AuthProvider;
  dateOfBirth?: string;
  profilePicture?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  roles?: string[];           // multi-role set from backend
  verificationStatus?: string; // for vehicle owners
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  // Additional profile-specific fields can be added here
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  profilePicture?: string;
}
