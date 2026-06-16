import apiClient, { getErrorMessage } from "@/lib/api/axios";
import { Vehicle, VehicleType } from "@/types/booking";

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
export const getVehicleById = async (vehicleId: number | string): Promise<Vehicle> => {
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

/**
 * POST /owner/vehicles — create new vehicle
 */
export const createVehicle = async (data: any): Promise<Vehicle> => {
  try {
    const response = await apiClient.post<Vehicle>("/owner/vehicles", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * PUT /owner/vehicles/:id — update existing vehicle
 */
export const updateVehicle = async (vehicleId: number | string, data: any): Promise<Vehicle> => {
  try {
    const response = await apiClient.put<Vehicle>(`/owner/vehicles/${vehicleId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * PATCH /owner/vehicles/:id/availability — toggle availability
 */
export const updateVehicleAvailability = async (vehicleId: number | string, data: { isAvailable?: boolean, isListed?: boolean }): Promise<Vehicle> => {
   try {
    const response = await apiClient.patch<Vehicle>(`/owner/vehicles/${vehicleId}/availability`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * DELETE /owner/vehicles/:id — delete a vehicle
 */
export const deleteVehicle = async (vehicleId: number | string): Promise<void> => {
  try {
    await apiClient.delete(`/owner/vehicles/${vehicleId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * GET /admin/vehicles — list all vehicles for admin regardless of status
 */
export const getAllVehiclesAdmin = async (): Promise<Vehicle[]> => {
  try {
    const response = await apiClient.get<Vehicle[]>("/admin/vehicles");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * PATCH /admin/vehicles/:id/availability — toggle availability or listing status by admin
 */
export const adminUpdateVehicleAvailability = async (
  vehicleId: number | string,
  data: { isAvailable?: boolean; isListed?: boolean }
): Promise<Vehicle> => {
  try {
    const response = await apiClient.patch<Vehicle>(
      `/admin/vehicles/${vehicleId}/availability`,
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * DELETE /admin/vehicles/:id — delete a vehicle by admin
 */
export const adminDeleteVehicle = async (
  vehicleId: number | string
): Promise<void> => {
  try {
    await apiClient.delete(`/admin/vehicles/${vehicleId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

const vehicleService = {
  getAvailableVehicles,
  getVehicleById,
  getVehiclesInBounds,
  getMyVehiclesAsOwner,
  createVehicle,
  updateVehicle,
  updateVehicleAvailability,
  deleteVehicle,
  getAllVehiclesAdmin,
  adminUpdateVehicleAvailability,
  adminDeleteVehicle,
};

export default vehicleService;
