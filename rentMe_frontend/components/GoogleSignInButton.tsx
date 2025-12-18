/**
 * Google Sign-In Component (Modern Client-Side OAuth)
 * 
 * Uses Google's official button rendered by their SDK.
 * This bypasses origin validation issues and provides the best compatibility.
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Extend Window interface to include google
declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleSignInButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleSignIn();
        setSdkLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google SDK loaded successfully');
        initializeGoogleSignIn();
        setSdkLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google SDK');
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google) {
      console.error('Google SDK not available');
      return;
    }

    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
        console.error('Google Client ID not configured');
        return;
      }

      console.log('Initializing Google Sign-In...');

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render Google's official button
      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      }

      console.log('Google Sign-In initialized successfully');
    } catch (err) {
      console.error('Error initializing Google Sign-In:', err);
    }
  };

  const handleGoogleResponse = async (response: any) => {
    console.log('Google authentication successful, sending to backend...');
    setIsLoading(true);

    try {
      // Send Google ID token to our backend
      const res = await fetch('http://localhost:8080/api/v1/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ token: response.credential }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Store user info in localStorage
        localStorage.setItem('user_id', data.userId);
        localStorage.setItem('user_email', data.email);
        localStorage.setItem('user_role', data.role);

        console.log('Login successful! Redirecting to dashboard...');

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const errorData = await res.text();
        console.error('Backend authentication failed:', errorData);
        alert('Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during authentication:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Loading state while SDK loads */}
      {!sdkLoaded && (
        <div className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg bg-gray-50">
          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-sm text-gray-600">Loading Google Sign-In...</span>
        </div>
      )}

      {/* Google's Official Button */}
      <div 
        ref={googleButtonRef} 
        className={`w-full ${!sdkLoaded ? 'hidden' : ''}`}
        style={{ minHeight: '44px' }}
      ></div>

      {/* Processing overlay */}
      {isLoading && (
        <div className="mt-3 flex items-center justify-center py-2 px-4 bg-blue-50 border border-blue-200 rounded-lg">
          <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-sm text-blue-700 font-medium">Signing you in...</span>
        </div>
      )}
    </div>
  );
}
