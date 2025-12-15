package com.example.springrentMe.repositories;

import com.example.springrentMe.models.Renter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RenterRepository extends JpaRepository<Renter, Long> {

    Optional<Renter> findByUser_UserId(Long userId);

    boolean existsByUser_UserId(Long userId);
}
