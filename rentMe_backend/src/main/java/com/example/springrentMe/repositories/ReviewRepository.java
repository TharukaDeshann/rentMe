package com.example.springrentMe.repositories;

import com.example.springrentMe.models.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByBooking_BookingId(Long bookingId);

    List<Review> findByVehicle_VehicleIdOrderByCreatedAtDesc(Long vehicleId);

    boolean existsByBooking_BookingId(Long bookingId);

    List<Review> findAllByOrderByCreatedAtDesc();

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.vehicle.vehicleId = :vehicleId")
    Double getAverageRatingByVehicle(@Param("vehicleId") Long vehicleId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.vehicle.vehicleId = :vehicleId")
    Long countByVehicle(@Param("vehicleId") Long vehicleId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.vehicleOwner.vehicleOwnerId = :ownerId")
    Double getAverageRatingByOwner(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.vehicleOwner.vehicleOwnerId = :ownerId")
    Long countByOwner(@Param("ownerId") Long ownerId);
}
