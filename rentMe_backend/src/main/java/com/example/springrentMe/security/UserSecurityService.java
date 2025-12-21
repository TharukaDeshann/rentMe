package com.example.springrentMe.security;

import com.example.springrentMe.models.VehicleOwner;
import com.example.springrentMe.models.VerificationStatus;
import com.example.springrentMe.repositories.AdminRepository;
import com.example.springrentMe.repositories.RenterRepository;
import com.example.springrentMe.repositories.VehicleOwnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Security service for role-based access control (RBAC) checks.
 * Used in @PreAuthorize annotations for fine-grained authorization.
 */
@Service("userSecurity")
public class UserSecurityService {

    @Autowired
    private RenterRepository renterRepository;

    @Autowired
    private VehicleOwnerRepository vehicleOwnerRepository;

    @Autowired
    private AdminRepository adminRepository;

    /**
     * Check if the current user is the owner of the resource
     */
    public boolean isOwner(Long userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userDetails.getId().equals(userId);
    }

    /**
     * Check if the current user is a verified vehicle owner
     */
    public boolean isVerifiedOwner() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        Optional<VehicleOwner> owner = vehicleOwnerRepository.findByUser_UserId(userDetails.getId());

        return owner.isPresent() &&
                owner.get().getVerificationStatus() == VerificationStatus.APPROVED;
    }

    /**
     * Check if the current user is a renter
     */
    public boolean isRenter() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return renterRepository.existsByUser_UserId(userDetails.getId());
    }

    /**
     * Check if the current user is an admin
     */
    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return adminRepository.existsByUser_UserId(userDetails.getId());
    }

    /**
     * Check if the current user is a vehicle owner (not necessarily verified)
     */
    public boolean isVehicleOwner() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return vehicleOwnerRepository.existsByUser_UserId(userDetails.getId());
    }

    /**
     * Get the current authenticated user
     */
    public UserDetailsImpl getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        return (UserDetailsImpl) auth.getPrincipal();
    }
}
