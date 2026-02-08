'use client';

import { LoginPage as LoginPageComponent } from '@/components/auth/login-page';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('user_id', data.userId);
        localStorage.setItem('user_email', data.email);
        localStorage.setItem('user_role', data.role);

        // Redirect based on role
        switch (data.role) {
          case 'ADMIN':
            router.push('/dashboard?view=admin-dashboard');
            break;
          case 'VEHICLE_OWNER':
            router.push('/dashboard?view=owner-dashboard');
            break;
          case 'RENTER':
          default:
            router.push('/dashboard?view=renter-browse');
            break;
        }
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      throw err;
    }
  };

  const handleSwitchToRegister = () => {
    router.push('/register');
  };

  return (
    <LoginPageComponent 
      onLoginSuccess={handleLoginSuccess}
      onSwitchToRegister={handleSwitchToRegister}
    />
  );
}
