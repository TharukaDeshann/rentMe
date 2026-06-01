/**
 * Centralized service exports
 * Import services from here: import { authService, userService, bookingService } from '@/services'
 */

export { default as authService } from './auth.service';
export { default as userService } from './user.service';
export { default as bookingService } from './booking.service';
export { default as vehicleService } from './vehicle.service';
export { default as documentService } from './document.service';
export { default as verificationService } from './verification.service';
export { default as chatService } from './chat.service';
export { default as reviewService } from './review.service';

// Re-export individual functions for convenience
export * from './auth.service';
export * from './user.service';
export * from './booking.service';
export * from './vehicle.service';
export * from './document.service';
export * from './verification.service';
export * from './chat.service';
export * from './review.service';