/**
 * Authentication-related TypeScript types
 * Centralized auth type definitions for API requests/responses
 */

import { UserRole, AuthProvider } from "./user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  contactNumber: string;
  role?: UserRole;
  dateOfBirth?: string;
}

export interface GoogleLoginRequest {
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  userId: number;
  email: string;
  role: UserRole;
  authProvider?: AuthProvider;
}

export interface ValidationError {
  success: false;
  message: string;
  errors: Record<string, string>;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    userId: number;
    email: string;
    role: UserRole;
    authProvider: AuthProvider;
  } | null;
  loading: boolean;
}
