package com.example.springrentMe.models;

public enum VerificationStatus {
    PENDING, // Documents submitted, awaiting review
    APPROVED, // Admin verified - can list vehicles
    REJECTED, // Documents rejected
    NOT_SUBMITTED // No documents uploaded yet
}
