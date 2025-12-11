package com.example.springrentMe.repositories;

import com.example.springrentMe.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email (for login and authentication)
    Optional<User> findByEmail(String email);

    // Check if email already exists (for registration validation)
    boolean existsByEmail(String email);

    // Find by OAuth ID (for Google/Facebook login)
    Optional<User> findByOauthId(String oauthId);
}
