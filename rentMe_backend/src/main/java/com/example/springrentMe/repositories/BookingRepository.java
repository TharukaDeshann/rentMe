package com.example.springrentMe.repositories;

import com.example.springrentMe.models.Booking;
import com.example.springrentMe.models.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // All bookings for a specific renter
    List<Booking> findByRenter_RenterIdOrderByCreatedAtDesc(Long renterId);

    // All bookings for vehicles owned by a specific owner
    @Query("""
        SELECT b FROM Booking b
        WHERE b.vehicle.vehicleOwner.vehicleOwnerId = :ownerId
        ORDER BY b.createdAt DESC
        """)
    List<Booking> findByVehicleOwnerIdOrderByCreatedAtDesc(@Param("ownerId") Long ownerId);

    // All bookings for a specific vehicle
    List<Booking> findByVehicle_VehicleIdOrderByCreatedAtDesc(Long vehicleId);

    // Bookings for a vehicle filtered by status
    List<Booking> findByVehicle_VehicleIdAndStatus(Long vehicleId, BookingStatus status);

    // Bookings for a renter filtered by status
    List<Booking> findByRenter_RenterIdAndStatus(Long renterId, BookingStatus status);

    /**
     * Overlap check: does any ACTIVE booking for this vehicle overlap [startDate, endDate]?
     * Active = PENDING or APPROVED or ONGOING
     * Overlap occurs when: existingStart <= newEnd AND existingEnd >= newStart
     */
    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.vehicle.vehicleId = :vehicleId
          AND b.status IN ('PENDING', 'APPROVED', 'ONGOING')
          AND b.startDate <= :endDate
          AND b.endDate   >= :startDate
        """)
    boolean existsOverlappingBooking(
            @Param("vehicleId") Long vehicleId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate);

    /**
     * Same overlap check but excludes a specific booking (used when updating a booking).
     */
    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.vehicle.vehicleId = :vehicleId
          AND b.bookingId <> :excludeBookingId
          AND b.status IN ('PENDING', 'APPROVED', 'ONGOING')
          AND b.startDate <= :endDate
          AND b.endDate   >= :startDate
        """)
    boolean existsOverlappingBookingExcluding(
            @Param("vehicleId")        Long vehicleId,
            @Param("startDate")        LocalDate startDate,
            @Param("endDate")          LocalDate endDate,
            @Param("excludeBookingId") Long excludeBookingId);

    /**
     * Find all APPROVED bookings whose start_date is today
     * (used by scheduler to transition APPROVED → ONGOING)
     */
    @Query("""
        SELECT b FROM Booking b
        WHERE b.status = 'APPROVED'
          AND b.startDate <= :today
        """)
    List<Booking> findApprovedBookingsToStart(@Param("today") LocalDate today);

    /**
     * Find all ONGOING bookings whose end_date has passed
     * (used by scheduler to transition ONGOING → COMPLETED)
     */
    @Query("""
        SELECT b FROM Booking b
        WHERE b.status = 'ONGOING'
          AND b.endDate < :today
        """)
    List<Booking> findOngoingBookingsToComplete(@Param("today") LocalDate today);

    // Count active bookings for owner's dashboard
    @Query("""
        SELECT COUNT(b) FROM Booking b
        WHERE b.vehicle.vehicleOwner.vehicleOwnerId = :ownerId
          AND b.status IN ('APPROVED', 'ONGOING')
        """)
    long countActiveBookingsByOwnerId(@Param("ownerId") Long ownerId);

    // Pending requests waiting for owner action
    @Query("""
        SELECT b FROM Booking b
        WHERE b.vehicle.vehicleOwner.vehicleOwnerId = :ownerId
          AND b.status = 'PENDING'
        ORDER BY b.createdAt ASC
        """)
    List<Booking> findPendingRequestsByOwnerId(@Param("ownerId") Long ownerId);
}