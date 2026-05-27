package com.example.springrentMe.DTOs;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for updating user information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$", 
             message = "Full name must contain only letters, spaces, hyphens, and apostrophes")
    private String fullName;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Pattern(regexp = "^[+]?[0-9]{10,20}$", 
             message = "Contact number must be 10-20 digits, optionally starting with +")
    private String contactNumber;

    private String profilePicture;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private Long locationId;
}
