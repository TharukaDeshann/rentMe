package com.example.springrentMe.repositories;

import com.example.springrentMe.models.VerificationRequest;
import com.example.springrentMe.models.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, Long> {

    // All requests for one owner (history)
    List<VerificationRequest> findByVehicleOwner_VehicleOwnerIdOrderBySubmittedAtDesc(Long vehicleOwnerId);

    // Latest request for one owner
    Optional<VerificationRequest> findTopByVehicleOwner_VehicleOwnerIdOrderBySubmittedAtDesc(Long vehicleOwnerId);

    // All requests with a given status (admin queue)
    List<VerificationRequest> findByStatusOrderBySubmittedAtAsc(VerificationStatus status);

    // Check if any PENDING request exists for an owner
    boolean existsByVehicleOwner_VehicleOwnerIdAndStatus(Long vehicleOwnerId, VerificationStatus status);
}