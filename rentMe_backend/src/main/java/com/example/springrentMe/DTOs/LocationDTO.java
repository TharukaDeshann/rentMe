package com.example.springrentMe.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for location information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDTO {
    private Long locationId;
    private String address;
    private Double latitude;
    private Double longitude;
    private String city;
    private String country;
    private String placeId;
}
