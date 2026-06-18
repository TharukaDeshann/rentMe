package com.example.springrentMe.services;

import com.example.springrentMe.DTOs.VehicleAvailabilityUpdateDTO;
import com.example.springrentMe.DTOs.VehicleRequestDTO;
import com.example.springrentMe.DTOs.VehicleResponseDTO;
import com.example.springrentMe.models.*;
import com.example.springrentMe.repositories.VehicleOwnerRepository;
import com.example.springrentMe.repositories.VehicleRepository;
import com.example.springrentMe.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.springrentMe.repositories.BookingRepository;
import java.util.ArrayList;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleOwnerRepository vehicleOwnerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private DocumentService documentService;

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create a new vehicle listing.
     * Rules enforced:
     *  - Caller must have a VehicleOwner record.
     *  - VehicleOwner.verificationStatus must be APPROVED.
     */
    @Transactional
    public VehicleResponseDTO createVehicle(VehicleRequestDTO request) {
        VehicleOwner owner = getApprovedOwnerForCurrentUser();

        Vehicle vehicle = new Vehicle();
        mapRequestToEntity(request, vehicle);
        vehicle.setVehicleOwner(owner);
        vehicle.setIsAvailable(true);
        vehicle.setIsListed(true);

        Vehicle saved = vehicleRepository.save(vehicle);
        return convertToResponseDTO(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get all listed + available vehicles (public, used by renters).
     */
    @Transactional(readOnly = true)
    public List<VehicleResponseDTO> getAllAvailableVehicles() {
        return vehicleRepository.findByIsListedTrueAndIsAvailableTrue()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Admin view: Get all vehicles regardless of status.
     */
    @Transactional(readOnly = true)
    public List<VehicleResponseDTO> getAllVehiclesAdmin() {
        return vehicleRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search with optional filters (public).
     */
    @Transactional(readOnly = true)
    public List<VehicleResponseDTO> searchVehicles(VehicleType type, BigDecimal maxPrice) {
        List<Vehicle> results;

        if (type != null && maxPrice != null) {
            results = vehicleRepository
                    .findByIsListedTrueAndIsAvailableTrueAndTypeAndDailyPriceLessThanEqual(type, maxPrice);
        } else if (type != null) {
            results = vehicleRepository.findByIsListedTrueAndIsAvailableTrueAndType(type);
        } else if (maxPrice != null) {
            results = vehicleRepository
                    .findByIsListedTrueAndIsAvailableTrueAndDailyPriceLessThanEqual(maxPrice);
        } else {
            results = vehicleRepository.findByIsListedTrueAndIsAvailableTrue();
        }

        return results.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    /**
     * Get vehicles within a geographic bounding box (for map view).
     */
    @Transactional(readOnly = true)
    public List<VehicleResponseDTO> getVehiclesInBounds(
            Double minLat, Double maxLat, Double minLng, Double maxLng) {
        return vehicleRepository.findAvailableVehiclesInBounds(minLat, maxLat, minLng, maxLng)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a single vehicle by ID (public).
     */
    @Transactional(readOnly = true)
    public VehicleResponseDTO getVehicleById(Long vehicleId) {
        Vehicle vehicle = findVehicleOrThrow(vehicleId);
        return convertToResponseDTO(vehicle);
    }

    /**
     * Get all vehicles belonging to the currently authenticated owner.
     */
    @Transactional(readOnly = true)
    public List<VehicleResponseDTO> getMyVehicles() {
        VehicleOwner owner = getOwnerForCurrentUser();
        return vehicleRepository.findByVehicleOwner_VehicleOwnerId(owner.getVehicleOwnerId())
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Update vehicle details. Only the owning vehicle owner can update.
     */
    @Transactional
    public VehicleResponseDTO updateVehicle(Long vehicleId, VehicleRequestDTO request) {
        VehicleOwner owner = getApprovedOwnerForCurrentUser();
        Vehicle vehicle = findVehicleOwnedByOrThrow(vehicleId, owner.getVehicleOwnerId());

        mapRequestToEntity(request, vehicle);

        Vehicle saved = vehicleRepository.save(vehicle);
        return convertToResponseDTO(saved);
    }

    /**
     * Toggle availability or listing status.
     * Owner can call this independently of the booking system.
     */
    @Transactional
    public VehicleResponseDTO updateAvailability(Long vehicleId, VehicleAvailabilityUpdateDTO request) {
        VehicleOwner owner = getOwnerForCurrentUser();
        Vehicle vehicle = findVehicleOwnedByOrThrow(vehicleId, owner.getVehicleOwnerId());

        if (request.getIsAvailable() != null) {
            vehicle.setIsAvailable(request.getIsAvailable());
        }
        if (request.getIsListed() != null) {
            vehicle.setIsListed(request.getIsListed());
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        return convertToResponseDTO(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Delete a vehicle listing (hard delete).
     * Only the owning vehicle owner can delete their vehicle.
     * Note: Soft-delete (isListed=false) is preferred in most cases — use updateAvailability.
     */
    @Transactional
    public void deleteVehicle(Long vehicleId) {
        VehicleOwner owner = getOwnerForCurrentUser();
        Vehicle vehicle = findVehicleOwnedByOrThrow(vehicleId, owner.getVehicleOwnerId());
        
        // Check for active bookings
        if (vehicle.getBookings() != null) {
            boolean hasActiveBookings = vehicle.getBookings().stream()
                    .anyMatch(b -> b.getStatus() == BookingStatus.PENDING 
                            || b.getStatus() == BookingStatus.APPROVED 
                            || b.getStatus() == BookingStatus.ONGOING);
            if (hasActiveBookings) {
                throw new RuntimeException("Cannot delete vehicle because it has pending, approved, or ongoing bookings. Please resolve them first.");
            }
        }
        
        // 1. Delete related documents (also cleans up filesystem/S3 files)
        if (vehicle.getDocuments() != null) {
            List<Document> docs = new ArrayList<>(vehicle.getDocuments());
            for (Document doc : docs) {
                documentService.deleteDocument(doc.getDocumentId());
            }
        }
        
        // 2. Delete related bookings
        if (vehicle.getBookings() != null) {
            bookingRepository.deleteAll(vehicle.getBookings());
        }
        
        // 3. Delete the vehicle itself
        vehicleRepository.delete(vehicle);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL HELPERS (package-private so BookingService can use them)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Used by BookingService to update vehicle availability without going through
     * owner security checks (the booking system manages this flag).
     */
    @Transactional
    public void setAvailability(Long vehicleId, boolean available) {
        Vehicle vehicle = findVehicleOrThrow(vehicleId);
        vehicle.setIsAvailable(available);
        vehicleRepository.save(vehicle);
    }

    Vehicle findVehicleOrThrow(Long vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + vehicleId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Resolve the VehicleOwner for the currently authenticated user.
     * Does NOT enforce verification status.
     */
    private VehicleOwner getOwnerForCurrentUser() {
        Long userId = getCurrentUserId();
        return vehicleOwnerRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Vehicle owner profile not found. Please complete onboarding first."));
    }

    /**
     * Resolve the VehicleOwner for the currently authenticated user
     * AND enforce that their KYC is APPROVED.
     */
    private VehicleOwner getApprovedOwnerForCurrentUser() {
        VehicleOwner owner = getOwnerForCurrentUser();
        if (owner.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new RuntimeException(
                    "Your account is not verified. Vehicle listing requires APPROVED verification status. " +
                    "Current status: " + owner.getVerificationStatus());
        }
        return owner;
    }

    /**
     * Find a vehicle that belongs to the given owner, or throw.
     */
    private Vehicle findVehicleOwnedByOrThrow(Long vehicleId, Long ownerId) {
        return vehicleRepository.findByVehicleIdAndVehicleOwner_VehicleOwnerId(vehicleId, ownerId)
                .orElseThrow(() -> new RuntimeException(
                        "Vehicle not found or you do not have permission to modify it."));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userDetails.getId();
    }

    /**
     * Map fields from request DTO → entity (used in both create and update).
     */
    private void mapRequestToEntity(VehicleRequestDTO request, Vehicle vehicle) {
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setType(request.getType());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setDailyPrice(request.getDailyPrice());
        vehicle.setDescription(request.getDescription());
        vehicle.setPickupLocation(request.getPickupLocation());
        vehicle.setLatitude(request.getLatitude());
        vehicle.setLongitude(request.getLongitude());

        // Only override availability / listing if explicitly provided
        if (request.getIsAvailable() != null) {
            vehicle.setIsAvailable(request.getIsAvailable());
        }
        if (request.getIsListed() != null) {
            vehicle.setIsListed(request.getIsListed());
        }
    }

    /**
     * Admin delete vehicle listing (hard delete).
     */
    @Transactional
    public void adminDeleteVehicle(Long vehicleId) {
        Vehicle vehicle = findVehicleOrThrow(vehicleId);
        
        // Check for active bookings
        if (vehicle.getBookings() != null) {
            boolean hasActiveBookings = vehicle.getBookings().stream()
                    .anyMatch(b -> b.getStatus() == BookingStatus.PENDING 
                            || b.getStatus() == BookingStatus.APPROVED 
                            || b.getStatus() == BookingStatus.ONGOING);
            if (hasActiveBookings) {
                throw new RuntimeException("Cannot delete vehicle because it has pending, approved, or ongoing bookings. Please resolve them first.");
            }
        }
        
        // 1. Delete related documents (also cleans up filesystem/S3 files)
        if (vehicle.getDocuments() != null) {
            List<Document> docs = new ArrayList<>(vehicle.getDocuments());
            for (Document doc : docs) {
                documentService.deleteDocument(doc.getDocumentId());
            }
        }
        
        // 2. Delete related bookings
        if (vehicle.getBookings() != null) {
            bookingRepository.deleteAll(vehicle.getBookings());
        }
        
        // 3. Delete the vehicle itself
        vehicleRepository.delete(vehicle);
    }

    /**
     * Admin updates vehicle availability/listing status.
     */
    @Transactional
    public VehicleResponseDTO adminUpdateAvailability(Long vehicleId, VehicleAvailabilityUpdateDTO request) {
        Vehicle vehicle = findVehicleOrThrow(vehicleId);

        if (request.getIsAvailable() != null) {
            vehicle.setIsAvailable(request.getIsAvailable());
        }
        if (request.getIsListed() != null) {
            vehicle.setIsListed(request.getIsListed());
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        return convertToResponseDTO(saved);
    }

    /**
     * Convert Vehicle entity → VehicleResponseDTO.
     */
    public VehicleResponseDTO convertToResponseDTO(Vehicle vehicle) {
        VehicleResponseDTO dto = new VehicleResponseDTO();
        dto.setVehicleId(vehicle.getVehicleId());
        dto.setMake(vehicle.getMake());
        dto.setModel(vehicle.getModel());
        dto.setType(vehicle.getType());
        dto.setCapacity(vehicle.getCapacity());
        dto.setDailyPrice(vehicle.getDailyPrice());
        dto.setDescription(vehicle.getDescription());
        
        List<String> picUrls = vehicle.getDocuments() != null
            ? vehicle.getDocuments().stream()
                .filter(d -> d.getDocumentType() == com.example.springrentMe.models.DocumentType.VEHICLE_PICTURE)
                .map(d -> documentService.convertToDTO(d).getFileUrl())
                .collect(Collectors.toList())
            : new java.util.ArrayList<>();
        dto.setPictures(picUrls);
        
        dto.setPickupLocation(vehicle.getPickupLocation());
        dto.setLatitude(vehicle.getLatitude());
        dto.setLongitude(vehicle.getLongitude());
        dto.setIsAvailable(vehicle.getIsAvailable());
        dto.setIsListed(vehicle.getIsListed());
        dto.setAverageRating(vehicle.getAverageRating());
        dto.setTotalReviews(vehicle.getTotalReviews());
        dto.setCreatedAt(vehicle.getCreatedAt());
        dto.setUpdatedAt(vehicle.getUpdatedAt());

        // Owner summary
        VehicleOwner owner = vehicle.getVehicleOwner();
        if (owner != null && owner.getUser() != null) {
            dto.setVehicleOwnerId(owner.getVehicleOwnerId());
            dto.setOwnerName(owner.getUser().getFullName());
            dto.setOwnerEmail(owner.getUser().getEmail());
            dto.setOwnerContactNumber(owner.getUser().getContactNumber());
        }

        return dto;
    }
}