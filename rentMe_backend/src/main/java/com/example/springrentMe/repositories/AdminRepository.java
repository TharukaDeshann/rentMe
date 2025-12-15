package com.example.springrentMe.repositories;

import com.example.springrentMe.models.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByUser_UserId(Long userId);

    boolean existsByUser_UserId(Long userId);
}
