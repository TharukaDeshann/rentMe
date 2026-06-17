package com.example.springrentMe.DTOs;

import com.example.springrentMe.models.MessageType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequestDTO {
    @NotNull(message = "Message type is required")
    private MessageType messageType;
    
    private String textContent; // required if TEXT
    private String fileUrl;     // required if IMAGE
    private Double latitude;    // required if LOCATION
    private Double longitude;   // required if LOCATION
}
