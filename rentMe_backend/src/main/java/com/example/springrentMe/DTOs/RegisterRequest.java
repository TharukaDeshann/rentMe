package com.example.springrentMe.DTOs;

import com.example.springrentMe.models.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String contactNumber;
    private UserRole role; // RENTER or OWNER
}
