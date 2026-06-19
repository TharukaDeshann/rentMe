/**
 * User Service
 * Handles all user-related API calls
 */

import apiClient, { getErrorMessage } from "../lib/api/axios";
import { User, UpdateUserRequest } from "@/types";
import { PageResponse } from "@/types/pagination";

/**
 * Get ALL users — Admin only
 * GET /users
 */
export const getAllUsers = async (
  page?: number,
  size?: number
): Promise<PageResponse<User>> => {
  try {
    const response = await apiClient.get<PageResponse<User>>("/users", {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get current authenticated user profile
 * @returns User profile data
 */
export const getCurrentUserProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>("/users/me");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get user profile by ID
 * @param userId - User ID
 * @returns User profile data
 */
export const getUserById = async (userId: number): Promise<User> => {
  try {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update user profile
 * @param userId - User ID
 * @param updates - Fields to update
 * @returns Updated user profile
 */
export const updateUser = async (
  userId: number,
  updates: UpdateUserRequest,
): Promise<User> => {
  try {
    const response = await apiClient.put<User>(`/users/${userId}`, updates);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Delete (deactivate) user account
 * @param userId - User ID
 */
export const deleteUser = async (userId: number): Promise<void> => {
  try {
    await apiClient.delete(`/users/${userId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Reactivate a deactivated user — Admin only
 * @param userId - User ID
 */
export const reactivateUser = async (userId: number): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>(`/users/${userId}/reactivate`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Upload profile picture for a user
 * @param userId - User ID
 * @param file - File object to upload
 * @returns Updated user profile containing the new profile picture URL
 */
export const uploadProfilePicture = async (
  userId: number,
  file: File,
): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<User>(
      `/users/${userId}/profile-picture`,
      formData,
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

const userService = {
  getAllUsers,
  getCurrentUserProfile,
  getUserById,
  updateUser,
  deleteUser,
  reactivateUser,
  uploadProfilePicture,
};

export default userService;
