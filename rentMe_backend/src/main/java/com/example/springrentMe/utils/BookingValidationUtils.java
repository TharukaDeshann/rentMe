package com.example.springrentMe.utils;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Utility class for booking-related validations and calculations.
 * Keeps business-rule logic out of both the service and controller layers.
 */
public class BookingValidationUtils {

    private BookingValidationUtils() {
        // Utility class — no instantiation
    }

    /**
     * Validate that the booking date range is logical:
     *  - startDate is not null
     *  - endDate is not null
     *  - endDate is strictly after startDate (minimum 1 day)
     *  - startDate is not in the past
     */
    public static void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            throw new IllegalArgumentException("Start date must not be null.");
        }
        if (endDate == null) {
            throw new IllegalArgumentException("End date must not be null.");
        }
        if (!startDate.isBefore(endDate)) {
            throw new IllegalArgumentException(
                    "End date must be strictly after start date. " +
                    "Got: startDate=" + startDate + ", endDate=" + endDate);
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Start date cannot be in the past. Got: " + startDate);
        }
    }

    /**
     * Calculate the number of rental days between startDate (inclusive) and endDate (exclusive).
     * e.g., 2025-01-10 → 2025-01-15 = 5 days
     */
    public static long calculateRentalDays(LocalDate startDate, LocalDate endDate) {
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        if (days < 1) {
            throw new IllegalArgumentException(
                    "Booking must be for at least 1 day. Calculated days: " + days);
        }
        return days;
    }

    /**
     * Quick overlap check using pure date logic (no DB).
     * Two ranges [s1, e1] and [s2, e2] overlap when: s1 < e2 AND s2 < e1.
     */
    public static boolean datesOverlap(
            LocalDate s1, LocalDate e1,
            LocalDate s2, LocalDate e2) {
        return s1.isBefore(e2) && s2.isBefore(e1);
    }
}