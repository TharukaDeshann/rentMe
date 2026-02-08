/**
 * Centralized service exports
 * Import services from here: import { authService, userService } from '@/lib/services'
 */

export { default as authService } from './auth.service';
export { default as userService } from './user.service';

// Re-export individual functions for convenience
export * from './auth.service';
export * from './user.service';
