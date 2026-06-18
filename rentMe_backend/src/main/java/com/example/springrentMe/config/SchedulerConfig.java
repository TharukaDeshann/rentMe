package com.example.springrentMe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Enables Spring's @Scheduled annotation processing.
 * Required for BookingService's automatic APPROVED → ONGOING → COMPLETED transitions.
 */
@Configuration
@EnableScheduling
public class SchedulerConfig {
    // No additional configuration needed — @EnableScheduling wires everything.
}