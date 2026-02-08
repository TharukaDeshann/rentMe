'use client';

import { RegistrationPage as RegistrationPageComponent } from '@/components/auth/registration-page';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegistrationSuccess = async (formData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    dateOfBirth?: string;
  }) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          contactNumber: formData.phoneNumber,
          role: 'RENTER',
        }),
      });

      if (response.ok) {
        // Redirect to login page after successful registration
        router.push('/login');
      } else {
        // Parse error response from backend
        const errorData = await response.json();
        
        // Handle validation errors from backend
        if (errorData.errors) {
          // Format field-specific errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          throw new Error(errorMessages);
        } else {
          throw new Error(errorData.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleSwitchToLogin = () => {
    router.push('/login');
  };

  return (
    <RegistrationPageComponent
      onRegistrationSuccess={handleRegistrationSuccess}
      onSwitchToLogin={handleSwitchToLogin}
    />
  );
}
