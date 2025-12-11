'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * OAuth2 Redirect Handler
 * 
 * This page handles the redirect from the backend after successful OAuth2 authentication.
 * The backend redirects here with JWT token and user details as query parameters.
 * 
 * URL Format: /oauth2/redirect?token=xxx&userId=1&email=user@example.com&role=RENTER
 */
export default function OAuth2RedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract query parameters
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const role = searchParams.get('role');

    if (token) {
      // Store authentication data
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user_id', userId || '');
      localStorage.setItem('user_email', email || '');
      localStorage.setItem('user_role', role || '');

      // Optional: Store in cookie for SSR
      document.cookie = `jwt_token=${token}; path=/; max-age=86400; SameSite=Lax`;

      console.log('OAuth2 login successful:', { userId, email, role });

      // Redirect to dashboard or home page
      router.push('/dashboard');
    } else {
      // No token received - authentication failed
      console.error('OAuth2 authentication failed: No token received');
      router.push('/login?error=oauth_failed');
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="mb-4">
          <svg 
            className="animate-spin h-12 w-12 mx-auto text-blue-600" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Processing Login...
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}
