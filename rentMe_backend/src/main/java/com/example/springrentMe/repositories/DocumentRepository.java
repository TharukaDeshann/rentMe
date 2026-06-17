package com.example.springrentMe.repositories;

import com.example.springrentMe.models.Document;
import com.example.springrentMe.models.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    // All documents for a specific vehicle
    List<Document> findByVehicle_VehicleId(Long vehicleId);

    // All documents for a specific verification request
    List<Document> findByVerificationRequest_RequestId(Long requestId);

    // Documents by type for a vehicle (e.g. only VEHICLE_REGISTRATION)
    List<Document> findByVehicle_VehicleIdAndDocumentType(Long vehicleId, DocumentType documentType);

    // Find document by file URL path
    java.util.Optional<Document> findByFileUrl(String fileUrl);
}