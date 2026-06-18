'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { getCurrentUserProfile } from '@/services/user.service';
import { User, UserRole } from '@/types';
import { UserProfilePage as UserProfilePageComponent } from '@/components/auth/user-profile-page';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user: authUser, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch full profile data once authenticated
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const data = await getCurrentUserProfile();
        setProfileData(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, authLoading]);

  const handleBack = () => {
    if (!authUser) return;
    switch (authUser.role) {
      case UserRole.ADMIN:
        router.push('/admin');
        break;
      case UserRole.VEHICLE_OWNER:
        router.push('/owner');
        break;
      default:
        router.push('/renter');
    }
  };

  const handleDeleteSuccess = async () => {
    await logout();
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setProfileData(updatedUser);
  };

  if (authLoading || profileLoading || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <UserProfilePageComponent
      onBack={handleBack}
      onDeleteSuccess={handleDeleteSuccess}
      onProfileUpdate={handleProfileUpdate}
      user={profileData}
    />
  );
}
