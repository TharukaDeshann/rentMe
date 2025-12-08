package com.example.springrentMe.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    // Password is NULLABLE - not needed for OAuth users
    @Column(length = 255)
    private String password; // BCrypt hashed for LOCAL auth, NULL for OAuth

    @Column(name = "contact_number", length = 20, nullable = false)
    private String contactNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    // OAuth fields
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false)
    private AuthProvider authProvider;

    @Column(name = "oauth_id", unique = true)
    private String oauthId; // Google/Facebook user ID

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false; // Auto-true for OAuth

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods
    public boolean isOAuthUser() {
        return authProvider != AuthProvider.LOCAL;
    }

    public boolean isLocalUser() {
        return authProvider == AuthProvider.LOCAL;
    }
}
