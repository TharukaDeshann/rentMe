'use client';

import { RegistrationPage as RegistrationPageComponent } from '@/components/auth/registration-page';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { RegisterRequest } from '@/types';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const handleRegistrationSuccess = async (formData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: 'RENTER' | 'VEHICLE_OWNER';
    dateOfBirth?: string;
  }) => {
    try {
      const registerData: RegisterRequest = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        contactNumber: formData.phoneNumber,
        role: formData.role as any,
        dateOfBirth: formData.dateOfBirth,
      };

      // Use auth context register method
      await register(registerData);
      // Router redirect to /login is handled in AuthContext
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
