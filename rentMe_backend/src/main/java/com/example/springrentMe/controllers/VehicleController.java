package com.example.springrentMe.controllers;

import com.example.springrentMe.DTOs.VehicleAvailabilityUpdateDTO;
import com.example.springrentMe.DTOs.VehicleRequestDTO;
import com.example.springrentMe.DTOs.VehicleResponseDTO;
import com.example.springrentMe.models.VehicleType;
import com.example.springrentMe.services.VehicleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Vehicle CRUD endpoints.
 *
 * Public  : GET  /api/v1/public/vehicles/**   (no auth required)
 * Owner   : POST/PUT/DELETE /api/v1/owner/vehicles/**
 */
@RestController
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC ENDPOINTS  (no authentication required)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/public/vehicles
     * List all available + listed vehicles.
     * Optional query params: type, maxPrice
     */
    @GetMapping("/api/v1/public/vehicles")
    public ResponseEntity<List<VehicleResponseDTO>> getAvailableVehicles(
            @RequestParam(required = false) VehicleType type,
            @RequestParam(required = false) BigDecimal maxPrice) {
        List<VehicleResponseDTO> vehicles = vehicleService.searchVehicles(type, maxPrice);
        return ResponseEntity.ok(vehicles);
    }

    /**
     * GET /api/v1/public/vehicles/map
     * Get vehicles within a lat/lng bounding box for the map view.
     */
    @GetMapping("/api/v1/public/vehicles/map")
    public ResponseEntity<List<VehicleResponseDTO>> getVehiclesForMap(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLng) {
        List<VehicleResponseDTO> vehicles =
                vehicleService.getVehiclesInBounds(minLat, maxLat, minLng, maxLng);
        return ResponseEntity.ok(vehicles);
    }

    /**
     * GET /api/v1/public/vehicles/{vehicleId}
     * Get a single vehicle's details.
     */
    @GetMapping("/api/v1/public/vehicles/{vehicleId}")
    public ResponseEntity<VehicleResponseDTO> getVehicleById(@PathVariable Long vehicleId) {
        VehicleResponseDTO vehicle = vehicleService.getVehicleById(vehicleId);
        return ResponseEntity.ok(vehicle);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VEHICLE OWNER ENDPOINTS  (requires VEHICLE_OWNER role)
    // Security config maps /api/v1/owner/** → hasRole("VEHICLE_OWNER")
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/owner/vehicles
     * Create a new vehicle listing.
     * Requires: VEHICLE_OWNER role + APPROVED verification status.
     */
    @PreAuthorize("hasRole('VEHICLE_OWNER')")
    @PostMapping("/api/v1/owner/vehicles")
    public ResponseEntity<?> createVehicle(@Valid @RequestBody VehicleRequestDTO request) {
        try {
            VehicleResponseDTO created = vehicleService.createVehicle(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    /**
     * GET /api/v1/owner/vehicles
     * Get all vehicles belonging to the authenticated owner.
     */
    @PreAuthorize("hasRole('VEHICLE_OWNER')")
    @GetMapping("/api/v1/owner/vehicles")
    public ResponseEntity<List<VehicleResponseDTO>> getMyVehicles() {
        return ResponseEntity.ok(vehicleService.getMyVehicles());
    }

    /**
     * PUT /api/v1/owner/vehicles/{vehicleId}
     * Update vehicle details.
     * Only the owning vehicle owner can update.
     */
    @PreAuthorize("hasRole('VEHICLE_OWNER')")
    @PutMapping("/api/v1/owner/vehicles/{vehicleId}")
    public ResponseEntity<?> updateVehicle(
            @PathVariable Long vehicleId,
            @Valid @RequestBody VehicleRequestDTO request) {
        try {
            VehicleResponseDTO updated = vehicleService.updateVehicle(vehicleId, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    /**
     * PATCH /api/v1/owner/vehicles/{vehicleId}/availability
     * Toggle isAvailable and/or isListed independently of a booking.
     * Useful for owner to manually block/unblock their vehicle.
     */
    @PreAuthorize("hasRole('VEHICLE_OWNER')")
    @PatchMapping("/api/v1/owner/vehicles/{vehicleId}/availability")
    public ResponseEntity<?> updateAvailability(
            @PathVariable Long vehicleId,
            @RequestBody VehicleAvailabilityUpdateDTO request) {
        try {
            VehicleResponseDTO updated = vehicleService.updateAvailability(vehicleId, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    /**
     * DELETE /api/v1/owner/vehicles/{vehicleId}
     * Hard-delete a vehicle listing.
     * Note: prefer PATCH availability (isListed=false) for non-destructive removal.
     */
    @PreAuthorize("hasRole('VEHICLE_OWNER')")
    @DeleteMapping("/api/v1/owner/vehicles/{vehicleId}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long vehicleId) {
        try {
            vehicleService.deleteVehicle(vehicleId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Vehicle deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/admin/vehicles
     * Admin view of all vehicles regardless of status.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/v1/admin/vehicles")
    public ResponseEntity<List<VehicleResponseDTO>> getAllVehiclesAdmin() {
        // Return all vehicles (listed or not, available or not)
        List<VehicleResponseDTO> all = vehicleService.getAllVehiclesAdmin();
        return ResponseEntity.ok(all);
    }

    /**
     * DELETE /api/v1/admin/vehicles/{vehicleId}
     * Admin hard-deletes any vehicle listing.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/v1/admin/vehicles/{vehicleId}")
    public ResponseEntity<?> adminDeleteVehicle(@PathVariable Long vehicleId) {
        try {
            vehicleService.adminDeleteVehicle(vehicleId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Vehicle deleted successfully by admin");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    /**
     * PATCH /api/v1/admin/vehicles/{vehicleId}/availability
     * Admin toggles listing/availability status of any vehicle.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/api/v1/admin/vehicles/{vehicleId}/availability")
    public ResponseEntity<?> adminUpdateAvailability(
            @PathVariable Long vehicleId,
            @RequestBody VehicleAvailabilityUpdateDTO request) {
        try {
            VehicleResponseDTO updated = vehicleService.adminUpdateAvailability(vehicleId, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────────────────────────────────

    private Map<String, Object> buildError(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        return error;
    }
}