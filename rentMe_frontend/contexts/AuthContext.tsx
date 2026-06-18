/**
 * Authentication Context
 * Provides global authentication state and methods across the application
 * Prevents prop drilling and centralizes auth logic
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, userService } from '@/services';
import { UserRole, LoginRequest, RegisterRequest, AuthProvider as AuthProviderEnum } from '@/types';

interface AuthUser {
  userId: number;
  email: string;
  role: UserRole;
  authProvider: AuthProviderEnum;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * Wrap your app with this to provide auth state to all components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Initialize auth state from localStorage on mount and sync with DB
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        // Set initial state from localStorage immediately
        setUser({
          userId: currentUser.userId,
          email: currentUser.email,
          role: currentUser.role as UserRole,
          authProvider: currentUser.authProvider as AuthProviderEnum,
        });

        // Run profile check in the background to sync DB updates (e.g., owner verification approval)
        try {
          const profile = await userService.getCurrentUserProfile();
          if (profile.role !== currentUser.role) {
            localStorage.setItem("user_role", profile.role);
            setUser({
              userId: profile.userId,
              email: profile.email,
              role: profile.role as UserRole,
              authProvider: profile.authProvider as AuthProviderEnum,
            });
          }
        } catch (err) {
          console.error("Failed to sync user profile on mount:", err);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Refresh user data from database and update local state
   */
  const refreshUser = async () => {
    try {
      const profile = await userService.getCurrentUserProfile();
      localStorage.setItem("user_id", profile.userId.toString());
      localStorage.setItem("user_email", profile.email);
      localStorage.setItem("user_role", profile.role);
      if (profile.authProvider) {
        localStorage.setItem("auth_provider", profile.authProvider);
      }
      
      setUser({
        userId: profile.userId,
        email: profile.email,
        role: profile.role as UserRole,
        authProvider: profile.authProvider as AuthProviderEnum,
      });
    } catch (error) {
      console.error("Failed to refresh user profile from API:", error);
      // Fallback: sync from localStorage
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser({
          userId: currentUser.userId,
          email: currentUser.email,
          role: currentUser.role as UserRole,
          authProvider: currentUser.authProvider as AuthProviderEnum,
        });
      } else {
        setUser(null);
      }
    }
  };

  /**
   * Login with email and password
   */
  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      
      // Set user state
      setUser({
        userId: response.userId,
        email: response.email,
        role: response.role,
        authProvider: response.authProvider || AuthProviderEnum.LOCAL,
      });

      // Redirect based on role
      redirectBasedOnRole(response.role);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (userData: RegisterRequest) => {
    try {
      await authService.register(userData);
      // Don't set user state here, redirect to login page
      router.push('/login');
    } catch (error) {
      throw error;
    }
  };

  /**
   * Login with Google OAuth
   */
  const googleLogin = async (token: string) => {
    try {
      const response = await authService.googleLogin(token);
      
      // Set user state
      setUser({
        userId: response.userId,
        email: response.email,
        role: response.role,
        authProvider: AuthProviderEnum.GOOGLE,
      });

      // Redirect based on role
      redirectBasedOnRole(response.role);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if API call fails
      setUser(null);
      router.push('/login');
    }
  };

  /**
   * Redirect user based on their role
   */
  const redirectBasedOnRole = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        router.push('/admin');
        break;
      case UserRole.VEHICLE_OWNER:
        router.push('/owner');
        break;
      case UserRole.RENTER:
      default:
        router.push('/renter');
        break;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    googleLogin,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 * Use this in any component: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
