package com.example.springrentMe.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "renters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Renter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "renter_id")
    private Long renterId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "driver_license_image", length = 500)
    private String driverLicenseImage; // Optional - URL or file path
}
