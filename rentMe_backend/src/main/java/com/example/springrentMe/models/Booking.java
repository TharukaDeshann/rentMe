package com.example.springrentMe.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(
    name = "bookings",
    indexes = {
        @Index(name = "idx_booking_vehicle", columnList = "vehicle_id"),
        @Index(name = "idx_booking_renter",  columnList = "renter_id"),
        @Index(name = "idx_booking_status",  columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;

    @NotNull(message = "Vehicle is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @NotNull(message = "Renter is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id", nullable = false)
    private Renter renter;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @NotNull(message = "Booking status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Size(max = 500)
    @Column(length = 500)
    private String notes;

    // Reason stored when owner rejects or cancels
    @Size(max = 500)
    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "actual_pick_up_time")
    private LocalDateTime actualPickUpTime;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Document> conditionImages;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}