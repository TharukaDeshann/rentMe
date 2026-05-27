package com.example.springrentMe.security;

import com.example.springrentMe.models.User;
import com.example.springrentMe.repositories.AdminRepository;
import com.example.springrentMe.repositories.RenterRepository;
import com.example.springrentMe.repositories.UserRepository;
import com.example.springrentMe.repositories.VehicleOwnerRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Bridge between our User entity and Spring Security.
 * This service loads user from database and converts it to UserDetails.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RenterRepository renterRepository;
    private final VehicleOwnerRepository vehicleOwnerRepository;
    private final AdminRepository adminRepository;

    public CustomUserDetailsService(UserRepository userRepository,
            RenterRepository renterRepository,
            VehicleOwnerRepository vehicleOwnerRepository,
            AdminRepository adminRepository) {
        this.userRepository = userRepository;
        this.renterRepository = renterRepository;
        this.vehicleOwnerRepository = vehicleOwnerRepository;
        this.adminRepository = adminRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Step 1: Find user in database by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Step 2: Convert User entity → UserDetails (using Adapter pattern)
        return buildUserDetails(user);
    }

    // Additional method to load user by ID (useful for token-based auth)
    @Transactional
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return buildUserDetails(user);
    }

    /**
     * Build UserDetailsImpl with all applicable roles
     */
    private UserDetailsImpl buildUserDetails(User user) {
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        // Check if user has renter role
        userDetails.setHasRenterRole(renterRepository.existsByUser_UserId(user.getUserId()));

        // Check if user has vehicle owner role
        userDetails.setHasVehicleOwnerRole(vehicleOwnerRepository.existsByUser_UserId(user.getUserId()));

        // Check if user has admin role
        userDetails.setHasAdminRole(adminRepository.existsByUser_UserId(user.getUserId()));

        return userDetails;
    }
}
