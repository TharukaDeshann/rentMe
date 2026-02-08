/**
 * Authentication Context
 * Provides global authentication state and methods across the application
 * Prevents prop drilling and centralizes auth logic
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';
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
  refreshUser: () => void;
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
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser({
          userId: currentUser.userId,
          email: currentUser.email,
          role: currentUser.role as UserRole,
          authProvider: currentUser.authProvider as AuthProviderEnum,
        });
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Refresh user data from localStorage
   * Useful after updating profile
   */
  const refreshUser = () => {
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
        router.push('/dashboard?view=admin-dashboard');
        break;
      case UserRole.VEHICLE_OWNER:
        router.push('/dashboard?view=owner-dashboard');
        break;
      case UserRole.RENTER:
      default:
        router.push('/dashboard?view=renter-browse');
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
