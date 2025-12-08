package com.example.springrentMe.models;

public enum UserRole {
    RENTER, // Can browse and book vehicles
    VEHICLE_OWNER, // Can list vehicles (after verification)
    ADMIN // Platform administrator
}
