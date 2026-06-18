package com.example.springrentMe.DTOs;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload sent by an Admin when reviewing a verification request.
 *
 * approve=true  → status becomes APPROVED
 * approve=false → status becomes REJECTED; rejectionReason is required
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminVerificationActionDTO {

    @NotNull(message = "approve flag is required (true = approve, false = reject)")
    private Boolean approve;

    /**
     * Mandatory when approve=false.
     * Should explain clearly what is wrong so the owner knows what to fix.
     */
    private String rejectionReason;
}