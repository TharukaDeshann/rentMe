package com.example.springrentMe.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$", message = "Full name must contain only letters, spaces, hyphens, and apostrophes")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    // Password is NULLABLE - not needed for OAuth users
    // Stored as BCrypt hash - validation happens at DTO level BEFORE hashing
    @Column(length = 255)
    private String password; // BCrypt hashed for LOCAL auth, NULL for OAuth

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[+]?[0-9]{10,20}$", message = "Contact number must be 10-20 digits, optionally starting with +")
    @Column(name = "contact_number", length = 20, nullable = false)
    private String contactNumber;

    @NotNull(message = "User role is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "date_of_birth")
    @Past(message = "Date of birth must be in the past")
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
