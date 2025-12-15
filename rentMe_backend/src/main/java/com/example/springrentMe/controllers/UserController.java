package com.example.springrentMe.controllers;

import com.example.springrentMe.DTOs.ChangePasswordRequest;
import com.example.springrentMe.DTOs.UpdateUserRequest;
import com.example.springrentMe.DTOs.UserDTO;
import com.example.springrentMe.security.UserDetailsImpl;
import com.example.springrentMe.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * REST API Controller for User CRUD operations with Role-Based Access Control
 */
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Get current authenticated user's profile
     * Accessible by: Any authenticated user
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUserProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        UserDTO user = userService.getUserById(userDetails.getId());
        return ResponseEntity.ok(user);
    }

    /**
     * Get all users
     * Accessible by: Admin only
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get user by ID
     * Accessible by: The user themselves OR admin
     */
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(#userId)")
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    /**
     * Update user information
     * Accessible by: The user themselves OR admin
     */
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(#userId)")
    @PutMapping("/{userId}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRequest request) {
        UserDTO updatedUser = userService.updateUser(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Change password
     * Accessible by: The user themselves only (not admin)
     * Note: Only for local auth users, not OAuth users
     */
    @PreAuthorize("@userSecurity.isOwner(#userId)")
    @PostMapping("/{userId}/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userId, request);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Deactivate user account (soft delete)
     * Accessible by: The user themselves OR admin
     */
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(#userId)")
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User account deactivated successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Permanently delete user (hard delete)
     * Accessible by: Admin only
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{userId}/permanent")
    public ResponseEntity<Map<String, String>> permanentlyDeleteUser(@PathVariable Long userId) {
        userService.permanentlyDeleteUser(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User permanently deleted");
        return ResponseEntity.ok(response);
    }

    /**
     * Reactivate deactivated user account
     * Accessible by: Admin only
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}/reactivate")
    public ResponseEntity<Map<String, String>> reactivateUser(@PathVariable Long userId) {
        userService.reactivateUser(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User account reactivated successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Get all roles for the current user
     * Accessible by: Any authenticated user
     * Returns: Array of roles ["RENTER", "VEHICLE_OWNER", "ADMIN"]
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/roles")
    public ResponseEntity<Map<String, Object>> getCurrentUserRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        Set<String> roles = new HashSet<>();
        if (userDetails.getHasRenterRole()) {
            roles.add("RENTER");
        }
        if (userDetails.getHasVehicleOwnerRole()) {
            roles.add("VEHICLE_OWNER");
        }
        if (userDetails.getHasAdminRole()) {
            roles.add("ADMIN");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("roles", roles);
        return ResponseEntity.ok(response);
    }
}
