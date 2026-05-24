package com.example.springrentMe.repositories;

import com.example.springrentMe.models.Vehicle;
import com.example.springrentMe.models.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // All vehicles belonging to a specific owner
    List<Vehicle> findByVehicleOwner_VehicleOwnerId(Long vehicleOwnerId);

    // All listed + available vehicles (public search)
    List<Vehicle> findByIsListedTrueAndIsAvailableTrue();

    // Filter by type, available & listed
    List<Vehicle> findByIsListedTrueAndIsAvailableTrueAndType(VehicleType type);

    // Filter by max daily price
    List<Vehicle> findByIsListedTrueAndIsAvailableTrueAndDailyPriceLessThanEqual(BigDecimal maxPrice);

    // Filter by type AND max price
    List<Vehicle> findByIsListedTrueAndIsAvailableTrueAndTypeAndDailyPriceLessThanEqual(
            VehicleType type, BigDecimal maxPrice);

    // Find vehicle only if it belongs to the given owner (ownership check)
    Optional<Vehicle> findByVehicleIdAndVehicleOwner_VehicleOwnerId(Long vehicleId, Long vehicleOwnerId);

    // Geospatial search: vehicles within a bounding box (lat/lng range)
    @Query("""
        SELECT v FROM Vehicle v
        WHERE v.isListed = true
          AND v.isAvailable = true
          AND v.latitude  BETWEEN :minLat AND :maxLat
          AND v.longitude BETWEEN :minLng AND :maxLng
        """)
    List<Vehicle> findAvailableVehiclesInBounds(
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLng") Double minLng,
            @Param("maxLng") Double maxLng);

    // Count vehicles per owner (for dashboard stats)
    long countByVehicleOwner_VehicleOwnerId(Long vehicleOwnerId);
}