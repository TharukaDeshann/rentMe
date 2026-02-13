/**
 * User Profile Context
 * Provides global user profile state with real-time updates
 * Manages full user profile data including name, phone, dateOfBirth, etc.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService } from '@/services';
import { User } from '@/types';

interface UserProfileContextType {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updatedProfile: User) => void;
  clearProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

/**
 * User Profile Provider Component
 * Wrap your authenticated app with this to provide profile state to all components
 */
export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user profile from backend
   */
  const refreshProfile = async () => {
    // Only fetch if user is authenticated
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    if (!userId) {
      setProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userProfile = await userService.getCurrentUserProfile();
      setProfile(userProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update profile in state (for real-time updates after profile edit)
   */
  const updateProfile = (updatedProfile: User) => {
    setProfile(updatedProfile);
  };

  /**
   * Clear profile from state (on logout)
   */
  const clearProfile = () => {
    setProfile(null);
    setError(null);
  };

  /**
   * Fetch profile on mount if user is authenticated
   */
  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    if (userId) {
      refreshProfile();
    }
  }, []);

  const value: UserProfileContextType = {
    profile,
    isLoading,
    error,
    refreshProfile,
    updateProfile,
    clearProfile,
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

/**
 * Custom hook to use user profile context
 * Use this in any component: const { profile, refreshProfile } = useUserProfile();
 */
export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
