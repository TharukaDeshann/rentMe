/**
 * Google Sign-In Component (Modern Client-Side OAuth)
 *
 * Uses Google's official button rendered by their SDK.
 * Handles both new and existing users:
 *  - Existing users → redirected to their role-specific dashboard
 *  - New users → shown a role selection popup before being redirected
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

// ─────────────────────────────────────────────
// Role Selection Modal (shown for new OAuth users)
// ─────────────────────────────────────────────
function RoleSelectionModal({
  userEmail,
  onRoleSelected,
}: {
  userEmail: string;
  onRoleSelected: (role: string) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<'RENTER' | 'VEHICLE_OWNER' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/oauth2/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: selectedRole }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user_role', data.role);
        onRoleSelected(data.role);
      } else {
        const errText = await res.text();
        setError('Failed to set role: ' + errText);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Header */}
          <div
            className="px-8 pt-8 pb-6 text-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                }}
              >
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Welcome to rentMe!</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Hi{' '}
              <span className="font-medium" style={{ color: 'rgba(99,102,241,0.9)' }}>
                {userEmail}
              </span>
              — how would you like to use rentMe?
            </p>
          </div>

          {/* Role Options */}
          <div className="px-8 py-6 space-y-4">
            {/* Renter Option */}
            <button
              id="google-role-renter-btn"
              onClick={() => setSelectedRole('RENTER')}
              className="w-full text-left rounded-xl p-5 transition-all duration-200"
              style={{
                background:
                  selectedRole === 'RENTER'
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.15))'
                    : 'rgba(255,255,255,0.04)',
                border:
                  selectedRole === 'RENTER'
                    ? '2px solid rgba(99,102,241,0.7)'
                    : '2px solid rgba(255,255,255,0.08)',
                boxShadow:
                  selectedRole === 'RENTER' ? '0 0 20px rgba(99,102,241,0.2)' : 'none',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      selectedRole === 'RENTER'
                        ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                        : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: selectedRole === 'RENTER' ? '#fff' : 'rgba(255,255,255,0.5)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className="text-base font-semibold"
                      style={{ color: selectedRole === 'RENTER' ? '#fff' : 'rgba(255,255,255,0.85)' }}
                    >
                      Renter
                    </h3>
                    {selectedRole === 'RENTER' && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Browse and book vehicles from owners across the platform
                  </p>
                </div>
              </div>
            </button>

            {/* Vehicle Owner Option */}
            <button
              id="google-role-owner-btn"
              onClick={() => setSelectedRole('VEHICLE_OWNER')}
              className="w-full text-left rounded-xl p-5 transition-all duration-200"
              style={{
                background:
                  selectedRole === 'VEHICLE_OWNER'
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.12))'
                    : 'rgba(255,255,255,0.04)',
                border:
                  selectedRole === 'VEHICLE_OWNER'
                    ? '2px solid rgba(16,185,129,0.6)'
                    : '2px solid rgba(255,255,255,0.08)',
                boxShadow:
                  selectedRole === 'VEHICLE_OWNER' ? '0 0 20px rgba(16,185,129,0.15)' : 'none',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      selectedRole === 'VEHICLE_OWNER'
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: selectedRole === 'VEHICLE_OWNER' ? '#fff' : 'rgba(255,255,255,0.5)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className="text-base font-semibold"
                      style={{ color: selectedRole === 'VEHICLE_OWNER' ? '#fff' : 'rgba(255,255,255,0.85)' }}
                    >
                      Vehicle Owner
                    </h3>
                    {selectedRole === 'VEHICLE_OWNER' && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    List your vehicles and earn by renting them to verified renters
                  </p>
                </div>
              </div>
            </button>

            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                {error}
              </div>
            )}

            <button
              id="google-role-confirm-btn"
              onClick={handleConfirm}
              disabled={!selectedRole || isLoading}
              className="w-full py-4 rounded-xl text-base font-semibold transition-all duration-200"
              style={{
                background: selectedRole
                  ? selectedRole === 'RENTER'
                    ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                    : 'linear-gradient(135deg, #10b981, #059669)'
                  : 'rgba(255,255,255,0.08)',
                color: selectedRole ? '#fff' : 'rgba(255,255,255,0.3)',
                cursor: selectedRole && !isLoading ? 'pointer' : 'not-allowed',
                boxShadow: selectedRole ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Setting up your account...
                </span>
              ) : selectedRole ? (
                `Continue as ${selectedRole === 'RENTER' ? 'Renter' : 'Vehicle Owner'} →`
              ) : (
                'Select a role to continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main GoogleSignInButton component
// ─────────────────────────────────────────────
export default function GoogleSignInButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingUserEmail, setPendingUserEmail] = useState('');
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

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }

      console.log('Google Sign-In initialized successfully');
    } catch (err) {
      console.error('Error initializing Google Sign-In:', err);
    }
  };

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case 'ADMIN':
        router.push('/admin');
        break;
      case 'VEHICLE_OWNER':
        router.push('/owner');
        break;
      case 'RENTER':
      default:
        router.push('/renter');
        break;
    }
  };

  const handleGoogleResponse = async (response: any) => {
    console.log('Google authentication successful, sending to backend...');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: response.credential }),
      });

      if (res.ok) {
        const data = await res.json();

        // Store user info in localStorage
        localStorage.setItem('user_id', data.userId);
        localStorage.setItem('user_email', data.email);
        localStorage.setItem('user_role', data.role);

        console.log('Login successful!', data);

        if (data.isNewUser) {
          // New user: show role selection popup
          setPendingUserEmail(data.email);
          setIsLoading(false);
          setShowRoleModal(true);
        } else {
          // Existing user: redirect to their role-specific dashboard
          console.log('Redirecting to dashboard for role:', data.role);
          redirectToDashboard(data.role);
        }
      } else {
        const errorData = await res.text();
        console.error('Backend authentication failed:', errorData);
        alert('Authentication failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error during authentication:', err);
      alert('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRoleSelected = (role: string) => {
    setShowRoleModal(false);
    localStorage.setItem('user_role', role);
    redirectToDashboard(role);
  };

  return (
    <>
      {/* Role selection modal overlay (for new users) */}
      {showRoleModal && (
        <RoleSelectionModal userEmail={pendingUserEmail} onRoleSelected={handleRoleSelected} />
      )}

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
    </>
  );
}
