package com.example.springrentMe.models;

/**
 * Classifies the purpose of an uploaded document.
 *
 * VEHICLE_*          → attached to a specific Vehicle
 * OWNER_VERIFICATION → attached to a VehicleOwner's KYC request
 */
public enum DocumentType {

    // ── Vehicle documents ─────────────────────────────────────────────────────
    VEHICLE_REGISTRATION,   // Vehicle registration book / title
    VEHICLE_INSURANCE,      // Insurance certificate
    VEHICLE_PICTURE,        // Photo of the vehicle

    // ── Owner KYC documents ───────────────────────────────────────────────────
    OWNER_NIC,              // National Identity Card
    OWNER_DRIVING_LICENSE,  // Driver's licence
    OWNER_ADDRESS_PROOF,    // Utility bill, bank statement, etc.
    OWNER_OTHER,             // Any additional document the owner wants to include

    // ── Booking documents ─────────────────────────────────────────────────────
    BOOKING_CONDITION_IMAGE // Condition of vehicle at check-out/handover
}