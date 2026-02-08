/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiClient, { getErrorMessage } from "../lib/api/axios";
import {
  LoginRequest,
  RegisterRequest,
  GoogleLoginRequest,
  AuthResponse,
} from "@/types";

/**
 * Login with email and password
 * @param credentials - Email and password
 * @returns AuthResponse with user info
 */
export const login = async (
  credentials: LoginRequest,
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );

    // Store user info in localStorage
    if (response.data.success && typeof window !== "undefined") {
      localStorage.setItem("user_id", response.data.userId.toString());
      localStorage.setItem("user_email", response.data.email);
      localStorage.setItem("user_role", response.data.role);
      if (response.data.authProvider) {
        localStorage.setItem("auth_provider", response.data.authProvider);
      }
    }

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Register a new user
 * @param userData - User registration data
 * @returns AuthResponse with user info
 */
export const register = async (
  userData: RegisterRequest,
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      userData,
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Login with Google OAuth
 * @param googleToken - Google OAuth token
 * @returns AuthResponse with user info
 */
export const googleLogin = async (
  googleToken: string,
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>("/auth/google", {
      token: googleToken,
    });

    // Store user info in localStorage
    if (response.data.success && typeof window !== "undefined") {
      localStorage.setItem("user_id", response.data.userId.toString());
      localStorage.setItem("user_email", response.data.email);
      localStorage.setItem("user_role", response.data.role);
      if (response.data.authProvider) {
        localStorage.setItem("auth_provider", response.data.authProvider);
      }
    }

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Logout user
 * Clears local storage and cookies
 */
export const logout = async (): Promise<void> => {
  try {
    // Call backend logout endpoint if you have one
    // await apiClient.post('/auth/logout');

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_role");
      localStorage.removeItem("auth_provider");
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear localStorage even if API call fails
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_role");
      localStorage.removeItem("auth_provider");
    }
  }
};

/**
 * Check if user is authenticated
 * @returns boolean indicating authentication status
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;

  const userId = localStorage.getItem("user_id");
  const email = localStorage.getItem("user_email");
  const role = localStorage.getItem("user_role");

  return !!(userId && email && role);
};

/**
 * Get current user info from localStorage
 * @returns User info or null
 */
export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;

  const userId = localStorage.getItem("user_id");
  const email = localStorage.getItem("user_email");
  const role = localStorage.getItem("user_role");
  const authProvider = localStorage.getItem("auth_provider");

  if (!userId || !email || !role) return null;

  return {
    userId: parseInt(userId),
    email,
    role,
    authProvider: authProvider || "LOCAL",
  };
};

const authService = {
  login,
  register,
  googleLogin,
  logout,
  isAuthenticated,
  getCurrentUser,
};

export default authService;
