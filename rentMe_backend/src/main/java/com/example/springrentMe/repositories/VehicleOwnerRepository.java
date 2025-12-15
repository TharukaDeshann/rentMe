package com.example.springrentMe.repositories;

import com.example.springrentMe.models.VehicleOwner;
import com.example.springrentMe.models.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface VehicleOwnerRepository extends JpaRepository<VehicleOwner, Long> {

    Optional<VehicleOwner> findByUser_UserId(Long userId);

    boolean existsByUser_UserId(Long userId);

    List<VehicleOwner> findByVerificationStatus(VerificationStatus status);
}
