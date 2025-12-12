'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Force dynamic rendering for this page (required for useSearchParams during build)
export const dynamic = 'force-dynamic';

/**
 * OAuth2 Redirect Handler (SECURE VERSION)
 * 
 * This page handles the redirect from the backend after successful OAuth2 authentication.
 * The backend sets JWT token in HTTP-only cookie (secure) and redirects here.
 * User info is available in a separate cookie for client-side access.
 * 
 * URL Format: /oauth2/redirect?success=true (NO TOKEN IN URL!)
 */
function OAuth2RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');

    if (success === 'true') {
      // JWT token is already in HTTP-only cookie (set by backend)
      // Read user info from non-HTTP-only cookie
      const userInfoCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_info='));

      if (userInfoCookie) {
        try {
          // Decode URL-encoded cookie value
          const encodedValue = userInfoCookie.split('=')[1];
          const decodedValue = decodeURIComponent(encodedValue);
          const userInfo = JSON.parse(decodedValue);
          
          // Store user info in localStorage for easy access
          localStorage.setItem('user_id', userInfo.userId.toString());
          localStorage.setItem('user_email', userInfo.email);
          localStorage.setItem('user_role', userInfo.role);

          console.log('OAuth2 login successful:', userInfo);

          // Redirect to dashboard
          router.push('/dashboard');
        } catch (error) {
          console.error('Failed to parse user info:', error);
          router.push('/login?error=invalid_user_data');
        }
      } else {
        console.error('User info cookie not found');
        router.push('/login?error=missing_user_info');
      }
    } else {
      // Authentication failed
      console.error('OAuth2 authentication failed');
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

// Loading fallback component
function LoadingFallback() {
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
          Loading...
        </h2>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function OAuth2RedirectPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OAuth2RedirectContent />
    </Suspense>
  );
}
