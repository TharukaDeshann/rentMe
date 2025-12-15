package com.example.springrentMe.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VerificationDocumentsDTO {
    private String idCardUrl;           // Required
    private String addressProofUrl;     // Required
    private LocalDateTime submittedAt;
    private String adminNotes;          // For rejection reasons
}