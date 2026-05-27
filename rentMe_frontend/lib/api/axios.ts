/**
 * Axios instance with base configuration and interceptors
 * Centralized HTTP client for all API requests
 */

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// Base API URL from environment variable or default to localhost
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with requests (for JWT in HTTP-only cookies)
});

/**
 * Request interceptor
 * - Add authorization headers if needed
 * - Log requests in development
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      );
    }

    // You can add additional headers here if needed
    // For example, CSRF token or other authentication tokens

    return config;
  },
  (error: AxiosError) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

/**
 * Response interceptor
 * - Handle successful responses
 * - Handle errors globally (401, 403, 500, etc.)
 * - Refresh token logic can be added here
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
      );
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle specific error status codes
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear auth state and redirect to login
          console.error("[API Error] Unauthorized - redirecting to login");

          // Clear localStorage
          if (typeof window !== "undefined") {
            localStorage.removeItem("user_id");
            localStorage.removeItem("user_email");
            localStorage.removeItem("user_role");

            // Redirect to login page (only on client side)
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error("[API Error] Forbidden - insufficient permissions");
          break;

        case 404:
          // Not found
          console.error("[API Error] Resource not found");
          break;

        case 500:
        case 502:
        case 503:
          // Server errors
          console.error("[API Error] Server error");
          break;

        default:
          console.error(`[API Error] ${status}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("[API Error] No response received from server");
    } else {
      // Something happened in setting up the request
      console.error("[API Error]", error.message);
    }

    return Promise.reject(error);
  },
);

/**
 * Helper function to extract error message from API error response
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Backend validation errors
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return Object.entries(errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(", ");
    }

    // Backend general error message
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Backend plain text error
    if (typeof error.response?.data === "string") {
      return error.response.data;
    }

    // Network or timeout errors
    if (error.code === "ECONNABORTED") {
      return "Request timeout. Please try again.";
    }

    if (!error.response) {
      return "Network error. Please check your connection.";
    }

    // Default error message based on status
    return `Error: ${error.response.status} - ${error.response.statusText}`;
  }

  // Generic error
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

export default apiClient;
