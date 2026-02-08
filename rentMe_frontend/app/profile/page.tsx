'use client';

import { UserProfilePage as UserProfilePageComponent } from '@/components/auth/user-profile-page';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      // Check if user is authenticated
      const userInfoCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_info='));

      if (!userInfoCookie) {
        // Not authenticated, redirect to login
        router.push('/login');
        return;
      }

      try {
        // Fetch user profile data
        const response = await fetch('http://localhost:8080/api/v1/users/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUserData({
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.contactNumber,
            dateOfBirth: data.dateOfBirth,
            profilePicture: data.profilePicture,
          });
          setIsAuthenticated(true);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleDeleteSuccess = () => {
    // Clear all user data and redirect to login
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    router.push('/login');
  };

  if (isLoading || !isAuthenticated || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <UserProfilePageComponent
      onBack={handleBack}
      onDeleteSuccess={handleDeleteSuccess}
      initialData={userData}
    />
  );
}
