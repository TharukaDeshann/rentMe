package com.example.springrentMe.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSessionRequestDTO {
    private Long targetUserId; // who to start a chat with
    private Long vehicleId;    // optional context tag (nullable)
}
