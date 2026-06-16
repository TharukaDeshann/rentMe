package com.example.springrentMe.services;

import com.example.springrentMe.DTOs.BookingRequestDTO;
import com.example.springrentMe.DTOs.BookingResponseDTO;
import com.example.springrentMe.DTOs.BookingStatusUpdateDTO;
import com.example.springrentMe.models.*;
import com.example.springrentMe.repositories.BookingRepository;
import com.example.springrentMe.repositories.RenterRepository;
import com.example.springrentMe.repositories.VehicleOwnerRepository;
import com.example.springrentMe.repositories.VehicleRepository;
import com.example.springrentMe.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private RenterRepository renterRepository;

    @Autowired
    private VehicleOwnerRepository vehicleOwnerRepository;

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private DocumentService documentService;

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE BOOKING (Renter action)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Renter submits a booking request for a vehicle.
     *
     * Validations:
     * 1. Renter profile must exist for the authenticated user.
     * 2. Vehicle must exist.
     * 3. Vehicle must belong to an APPROVED owner.
     * 4. Vehicle must be listed and available (isAvailable = true).
     * 5. Dates must be valid (end after start).
     * 6. No overlapping active bookings for the same vehicle.
     */
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        // 1. Resolve renter
        Renter renter = getRenterForCurrentUser();

        // 2. Validate dates
        validateDates(request.getStartDate(), request.getEndDate());

        // 3. Resolve and validate vehicle
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException(
                        "Vehicle not found with id: " + request.getVehicleId()));

        // 4. Vehicle must be listed
        if (!vehicle.getIsListed()) {
            throw new RuntimeException("This vehicle listing is not active.");
        }

        // 5. Vehicle owner must be APPROVED
        VehicleOwner owner = vehicle.getVehicleOwner();
        if (owner.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new RuntimeException(
                    "This vehicle's owner is not verified. Booking is not allowed.");
        }

        // 6. Vehicle must be currently available
        if (!vehicle.getIsAvailable()) {
            throw new RuntimeException(
                    "This vehicle is currently not available for booking.");
        }

        // 7. Renter cannot book their own vehicle
        if (owner.getUser().getUserId().equals(renter.getUser().getUserId())) {
            throw new RuntimeException("You cannot book your own vehicle.");
        }

        // 8. Overlap check – prevent double-booking for the date range
        boolean hasOverlap = bookingRepository.existsOverlappingBooking(
                vehicle.getVehicleId(),
                request.getStartDate(),
                request.getEndDate());
        if (hasOverlap) {
            throw new RuntimeException(
                    "The selected dates overlap with an existing booking for this vehicle. " +
                            "Please choose different dates.");
        }

        // 9. Calculate total amount
        long numberOfDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (numberOfDays < 1) {
            throw new RuntimeException("Booking must be at least 1 day.");
        }
        BigDecimal totalAmount = vehicle.getDailyPrice()
                .multiply(BigDecimal.valueOf(numberOfDays));

        // 10. Create booking entity
        Booking booking = new Booking();
        booking.setVehicle(vehicle);
        booking.setRenter(renter);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(totalAmount);
        booking.setNotes(request.getNotes());

        Booking saved = bookingRepository.save(booking);
        return convertToResponseDTO(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATUS TRANSITIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Owner approves or rejects (cancels) a PENDING booking.
     * - APPROVED: sets vehicle availability to false.
     * - CANCELLED: keeps vehicle available.
     */
    @Transactional
    public BookingResponseDTO ownerUpdateBookingStatus(Long bookingId, BookingStatusUpdateDTO request) {
        VehicleOwner owner = getOwnerForCurrentUser();
        Booking booking = findBookingOrThrow(bookingId);

        // Ensure this booking belongs to the owner's vehicle
        if (!booking.getVehicle().getVehicleOwner().getVehicleOwnerId()
                .equals(owner.getVehicleOwnerId())) {
            throw new RuntimeException(
                    "You do not have permission to update this booking.");
        }

        BookingStatus newStatus = request.getNewStatus();

        switch (booking.getStatus()) {
            case PENDING -> {
                if (newStatus == BookingStatus.APPROVED) {
                    booking.setStatus(BookingStatus.APPROVED);
                    // Mark vehicle as unavailable for the booked period
                    vehicleService.setAvailability(booking.getVehicle().getVehicleId(), false);
                } else if (newStatus == BookingStatus.CANCELLED) {
                    booking.setStatus(BookingStatus.CANCELLED);
                    booking.setCancellationReason(request.getCancellationReason());
                    // Vehicle stays available
                } else {
                    throw new RuntimeException(
                            "Owner can only APPROVED or CANCELLED a PENDING booking.");
                }
            }
            default -> throw new RuntimeException(
                    "Cannot update booking in status: " + booking.getStatus() +
                            ". Only PENDING bookings can be actioned by the owner.");
        }

        Booking saved = bookingRepository.save(booking);
        return convertToResponseDTO(saved);
    }

    /**
     * Renter cancels their OWN PENDING booking.
     * A renter can only cancel while the booking is still PENDING (before owner
     * approves).
     */
    @Transactional
    public BookingResponseDTO renterCancelBooking(Long bookingId, BookingStatusUpdateDTO request) {
        Renter renter = getRenterForCurrentUser();
        Booking booking = findBookingOrThrow(bookingId);

        // Ensure this booking belongs to the renter
        if (!booking.getRenter().getRenterId().equals(renter.getRenterId())) {
            throw new RuntimeException(
                    "You do not have permission to cancel this booking.");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException(
                    "You can only cancel a booking while it is PENDING. " +
                            "Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(
                request.getCancellationReason() != null
                        ? request.getCancellationReason()
                        : "Cancelled by renter");

        Booking saved = bookingRepository.save(booking);
        return convertToResponseDTO(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCHEDULED STATUS TRANSITIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Runs every day at midnight.
     * Transitions APPROVED → ONGOING when start_date arrives.
     */
    @Scheduled(cron = "0 0 0 * * *") // every day at 00:00
    @Transactional
    public void transitionApprovedToOngoing() {
        LocalDate today = LocalDate.now();
        List<Booking> toStart = bookingRepository.findApprovedBookingsToStart(today);
        for (Booking booking : toStart) {
            booking.setStatus(BookingStatus.ONGOING);
            bookingRepository.save(booking);
        }
    }

    /**
     * Runs every day at midnight.
     * Transitions ONGOING → COMPLETED when end_date passes, then restores vehicle
     * availability.
     */
    @Scheduled(cron = "0 1 0 * * *") // every day at 00:01 (slightly after above)
    @Transactional
    public void transitionOngoingToCompleted() {
        LocalDate today = LocalDate.now();
        List<Booking> toComplete = bookingRepository.findOngoingBookingsToComplete(today);
        for (Booking booking : toComplete) {
            booking.setStatus(BookingStatus.COMPLETED);
            // Restore vehicle availability once rental is done
            vehicleService.setAvailability(booking.getVehicle().getVehicleId(), true);
            bookingRepository.save(booking);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get all bookings for the authenticated renter.
     */
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getMyBookingsAsRenter() {
        Renter renter = getRenterForCurrentUser();
        return bookingRepository
                .findByRenter_RenterIdOrderByCreatedAtDesc(renter.getRenterId())
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all bookings for vehicles owned by the authenticated owner.
     */
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getMyBookingsAsOwner() {
        VehicleOwner owner = getOwnerForCurrentUser();
        return bookingRepository
                .findByVehicleOwnerIdOrderByCreatedAtDesc(owner.getVehicleOwnerId())
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all PENDING booking requests for the authenticated owner (decision
     * queue).
     */
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getPendingRequestsForOwner() {
        VehicleOwner owner = getOwnerForCurrentUser();
        return bookingRepository
                .findPendingRequestsByOwnerId(owner.getVehicleOwnerId())
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a single booking by ID.
     * Accessible by the renter involved, the vehicle owner, or admin.
     */
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long bookingId) {
        Booking booking = findBookingOrThrow(bookingId);
        ensureCurrentUserCanViewBooking(booking);
        return convertToResponseDTO(booking);
    }

    /**
     * Admin: get all bookings in the system.
     */
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new RuntimeException("Start date and end date are required.");
        }
        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("End date must be on or after start date.");
        }
    }

    private Renter getRenterForCurrentUser() {
        Long userId = getCurrentUserId();
        return renterRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Renter profile not found for the current user."));
    }

    private VehicleOwner getOwnerForCurrentUser() {
        Long userId = getCurrentUserId();
        return vehicleOwnerRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Vehicle owner profile not found for the current user."));
    }

    private Booking findBookingOrThrow(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException(
                        "Booking not found with id: " + bookingId));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userDetails.getId();
    }

    /**
     * Ensure the authenticated user is either the renter, the vehicle owner,
     * or an admin for this booking.
     */
    private void ensureCurrentUserCanViewBooking(Booking booking) {
        Long userId = getCurrentUserId();
        Long renterUserId = booking.getRenter().getUser().getUserId();
        Long ownerUserId = booking.getVehicle().getVehicleOwner().getUser().getUserId();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!userId.equals(renterUserId) && !userId.equals(ownerUserId) && !isAdmin) {
            throw new RuntimeException(
                    "You do not have permission to view this booking.");
        }
    }

    /**
     * Admin updates status/cancels any booking.
     */
    @Transactional
    public BookingResponseDTO adminUpdateBookingStatus(Long bookingId, BookingStatusUpdateDTO request) {
        Booking booking = findBookingOrThrow(bookingId);
        BookingStatus oldStatus = booking.getStatus();
        BookingStatus newStatus = request.getNewStatus();

        if (newStatus == BookingStatus.CANCELLED) {
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancellationReason(
                    request.getCancellationReason() != null
                            ? request.getCancellationReason()
                            : "Cancelled by Administrator");
            // Restore vehicle availability if it was active
            if (oldStatus == BookingStatus.APPROVED || oldStatus == BookingStatus.ONGOING) {
                vehicleService.setAvailability(booking.getVehicle().getVehicleId(), true);
            }
        } else {
            booking.setStatus(newStatus);
            if (newStatus == BookingStatus.APPROVED) {
                vehicleService.setAvailability(booking.getVehicle().getVehicleId(), false);
            } else if (newStatus == BookingStatus.COMPLETED) {
                vehicleService.setAvailability(booking.getVehicle().getVehicleId(), true);
            }
        }

        Booking saved = bookingRepository.save(booking);
        return convertToResponseDTO(saved);
    }

    /**
     * Convert Booking entity → BookingResponseDTO.
     */
    public BookingResponseDTO convertToResponseDTO(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setBookingId(booking.getBookingId());
        dto.setStatus(booking.getStatus());
        dto.setStartDate(booking.getStartDate());
        dto.setEndDate(booking.getEndDate());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setNotes(booking.getNotes());
        dto.setCancellationReason(booking.getCancellationReason());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());

        // Number of days
        long days = ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate()) + 1;
        dto.setNumberOfDays(days);

        // Vehicle details
        Vehicle vehicle = booking.getVehicle();
        if (vehicle != null) {
            dto.setVehicleId(vehicle.getVehicleId());
            dto.setVehicleMake(vehicle.getMake());
            dto.setVehicleModel(vehicle.getModel());
            dto.setVehicleType(vehicle.getType() != null ? vehicle.getType().name() : null);
            dto.setVehiclePickupLocation(vehicle.getPickupLocation());
            
            List<String> picUrls = vehicle.getDocuments() != null
                ? vehicle.getDocuments().stream()
                    .filter(d -> d.getDocumentType() == com.example.springrentMe.models.DocumentType.VEHICLE_PICTURE)
                    .map(d -> documentService.convertToDTO(d).getFileUrl())
                    .collect(Collectors.toList())
                : new java.util.ArrayList<>();
            dto.setVehiclePictures(picUrls);
            
            dto.setDailyPrice(vehicle.getDailyPrice());

            VehicleOwner owner = vehicle.getVehicleOwner();
            if (owner != null && owner.getUser() != null) {
                dto.setVehicleOwnerId(owner.getVehicleOwnerId());
                dto.setOwnerName(owner.getUser().getFullName());
                dto.setOwnerEmail(owner.getUser().getEmail());
            }
        }

        // Renter details
        Renter renter = booking.getRenter();
        if (renter != null && renter.getUser() != null) {
            dto.setRenterId(renter.getRenterId());
            dto.setRenterName(renter.getUser().getFullName());
            dto.setRenterEmail(renter.getUser().getEmail());
            dto.setRenterContactNumber(renter.getUser().getContactNumber());
        }

        return dto;
    }
}