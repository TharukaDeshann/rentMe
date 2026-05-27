'use client';

import { LoginPage as LoginPageComponent } from '@/components/auth/login-page';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLoginSuccess = async (email: string, password: string) => {
    try {
      // Use auth context login method which handles everything
      await login({ email, password });
      // Router redirect is handled in AuthContext based on user role
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
