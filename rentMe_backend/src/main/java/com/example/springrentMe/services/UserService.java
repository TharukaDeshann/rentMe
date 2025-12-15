package com.example.springrentMe.services;

import com.example.springrentMe.DTOs.ChangePasswordRequest;
import com.example.springrentMe.DTOs.LocationDTO;
import com.example.springrentMe.DTOs.UpdateUserRequest;
import com.example.springrentMe.DTOs.UserDTO;
import com.example.springrentMe.models.*;
import com.example.springrentMe.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service layer for User CRUD operations
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RenterRepository renterRepository;

    @Autowired
    private VehicleOwnerRepository vehicleOwnerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get all users (Admin only)
     */
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return convertToDTO(user);
    }

    /**
     * Get user by email
     */
    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return convertToDTO(user);
    }

    /**
     * Update user information
     */
    @Transactional
    public UserDTO updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Update only non-null fields
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // Check if new email is already taken
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already in use: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getContactNumber() != null) {
            user.setContactNumber(request.getContactNumber());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getLocationId() != null) {
            // Note: You'll need to inject LocationRepository and fetch the location
            // For now, we'll skip this. Add LocationRepository if needed.
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    /**
     * Change user password (for local auth users only)
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if user is local auth (OAuth users can't change password)
        if (user.isOAuthUser()) {
            throw new RuntimeException("Cannot change password for OAuth users");
        }

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password (password confirmation is handled on frontend)
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Delete user (soft delete - deactivate account)
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Soft delete - deactivate account
        user.setIsActive(false);
        userRepository.save(user);
    }

    /**
     * Permanently delete user (hard delete)
     */
    @Transactional
    public void permanentlyDeleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Delete related records first
        renterRepository.findByUser_UserId(userId).ifPresent(renterRepository::delete);
        vehicleOwnerRepository.findByUser_UserId(userId).ifPresent(vehicleOwnerRepository::delete);
        adminRepository.findByUser_UserId(userId).ifPresent(adminRepository::delete);

        // Then delete user
        userRepository.delete(user);
    }

    /**
     * Reactivate user account
     */
    @Transactional
    public void reactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setIsActive(true);
        userRepository.save(user);
    }

    /**
     * Convert User entity to UserDTO
     */
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setContactNumber(user.getContactNumber());
        dto.setRole(user.getRole());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setAuthProvider(user.getAuthProvider());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        // Set all roles the user has
        Set<String> roles = new HashSet<>();
        roles.add(user.getRole().name()); // Primary role

        if (renterRepository.existsByUser_UserId(user.getUserId())) {
            roles.add("RENTER");
        }
        if (vehicleOwnerRepository.existsByUser_UserId(user.getUserId())) {
            roles.add("VEHICLE_OWNER");
        }
        if (adminRepository.existsByUser_UserId(user.getUserId())) {
            roles.add("ADMIN");
        }
        dto.setRoles(roles);

        // Set verification status for vehicle owners
        vehicleOwnerRepository.findByUser_UserId(user.getUserId())
                .ifPresent(owner -> dto.setVerificationStatus(owner.getVerificationStatus().name()));

        // Set location if exists
        if (user.getLocation() != null) {
            LocationDTO locationDTO = new LocationDTO();
            locationDTO.setLocationId(user.getLocation().getLocationId());
            locationDTO.setAddress(user.getLocation().getAddress());
            locationDTO.setLatitude(user.getLocation().getLatitude());
            locationDTO.setLongitude(user.getLocation().getLongitude());
            locationDTO.setCity(user.getLocation().getCity());
            locationDTO.setCountry(user.getLocation().getCountry());
            locationDTO.setPlaceId(user.getLocation().getPlaceId());
            dto.setLocation(locationDTO);
        }

        return dto;
    }
}
