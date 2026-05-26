/**
 * Centralized service exports
 * Import services from here: import { authService, userService, bookingService } from '@/services'
 */

export { default as authService } from './auth.service';
export { default as userService } from './user.service';
export { default as bookingService } from './booking.service';

// Re-export individual functions for convenience
export * from './auth.service';
export * from './user.service';
export * from './booking.service';