package com.example.springrentMe.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String role;
    private boolean isNewUser = false; // true when user was just created (needs role selection for OAuth)

    public AuthResponse(String token, Long userId, String email, String role) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.isNewUser = false;
    }

    public AuthResponse(String token, Long userId, String email, String role, boolean isNewUser) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.isNewUser = isNewUser;
    }

    public AuthResponse(Long userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.isNewUser = false;
    }

    public AuthResponse(Long userId, String email, String role, boolean isNewUser) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.isNewUser = isNewUser;
    }
}
