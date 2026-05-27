/**
 * Authentication validation schemas
 * Zod schemas for validating auth-related forms
 * These match the backend validation rules in RegisterRequest.java and LoginRequest.java
 */

import * as z from 'zod';

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 * Matches backend validation in RegisterRequest.java
 */
export const registrationSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(
      /^[a-zA-Z]+(([',.\s-][a-zA-Z ])?[a-zA-Z]*)*$/,
      'Full name must contain only letters, spaces, hyphens, and apostrophes'
    ),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters'),
  phoneNumber: z.string()
    .regex(
      /^[+]?[0-9]{10,20}$/,
      'Contact number must be 10-20 digits, optionally starting with +'
    ),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)'
    ),
  confirmPassword: z.string(),
  dateOfBirth: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Update profile validation schema
 */
export const updateProfileSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(
      /^[a-zA-Z]+(([',.\s-][a-zA-Z ])?[a-zA-Z]*)*$/,
      'Full name must contain only letters, spaces, hyphens, and apostrophes'
    )
    .optional(),
  contactNumber: z.string()
    .regex(
      /^[+]?[0-9]{10,20}$/,
      'Contact number must be 10-20 digits, optionally starting with +'
    )
    .optional(),
  dateOfBirth: z.string().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
