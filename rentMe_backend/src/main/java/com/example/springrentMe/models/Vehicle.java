package com.example.springrentMe.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Long vehicleId;

    @NotNull(message = "Vehicle owner is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_owner_id", nullable = false)
    private VehicleOwner vehicleOwner;

    @NotBlank(message = "Make is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String make; // e.g., Toyota, Honda

    @NotBlank(message = "Model is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String model; // e.g., Camry, Civic

    @NotNull(message = "Vehicle type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType type; // SEDAN, SUV, TRUCK, VAN, etc.

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 50, message = "Capacity must not exceed 50")
    @Column(nullable = false)
    private Integer capacity;

    @NotNull(message = "Daily price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Daily price must be greater than 0")
    @Column(name = "daily_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyPrice;

    @Size(max = 1000)
    @Column(length = 1000)
    private String description;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Document> documents;

    // Pickup location details
    @NotBlank(message = "Pickup location address is required")
    @Size(max = 255)
    @Column(name = "pickup_location", nullable = false, length = 255)
    private String pickupLocation;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    @Column(nullable = false)
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    @Column(nullable = false)
    private Double longitude;

    // True = available for booking, False = currently booked
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    // Soft delete / listing control
    @Column(name = "is_listed", nullable = false)
    private Boolean isListed = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // One vehicle can have many bookings (history), but only one active at a time
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> bookings;
}