'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Force dynamic rendering for this page (required for useSearchParams during build)
export const dynamic = 'force-dynamic';

type UserInfo = {
  userId: number;
  email: string;
  role: string;
  authProvider: string;
};

/**
 * Role Selection Modal — shown to new Google OAuth2 users who haven't chosen a role yet.
 */
function RoleSelectionModal({
  userInfo,
  onRoleSelected,
}: {
  userInfo: UserInfo;
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
        // Update localStorage with new role
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
            {/* Logo / Icon */}
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
                {userInfo.email}
              </span>
              — how would you like to use rentMe?
            </p>
          </div>

          {/* Role Options */}
          <div className="px-8 py-6 space-y-4">
            {/* Renter Option */}
            <button
              id="role-renter-btn"
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
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
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(99,102,241,0.3)',
                          color: '#a5b4fc',
                        }}
                      >
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
              id="role-owner-btn"
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
                    style={{
                      color: selectedRole === 'VEHICLE_OWNER' ? '#fff' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className="text-base font-semibold"
                      style={{
                        color:
                          selectedRole === 'VEHICLE_OWNER' ? '#fff' : 'rgba(255,255,255,0.85)',
                      }}
                    >
                      Vehicle Owner
                    </h3>
                    {selectedRole === 'VEHICLE_OWNER' && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(16,185,129,0.25)',
                          color: '#6ee7b7',
                        }}
                      >
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

            {/* Error message */}
            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                {error}
              </div>
            )}

            {/* Confirm Button */}
            <button
              id="role-confirm-btn"
              onClick={handleConfirm}
              disabled={!selectedRole || isLoading}
              className="w-full py-4 rounded-xl text-base font-semibold transition-all duration-200"
              style={{
                background:
                  selectedRole
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
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
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

/**
 * OAuth2 Redirect Handler (SECURE VERSION)
 *
 * This page handles the redirect from the backend after successful OAuth2 authentication.
 * The backend sets JWT token in HTTP-only cookie (secure) and redirects here.
 * User info is available in a separate cookie for client-side access.
 *
 * URL Format: /oauth2/redirect?success=true&isNewUser=true|false
 */
function OAuth2RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [statusMessage, setStatusMessage] = useState('Processing Login...');

  useEffect(() => {
    const success = searchParams.get('success');
    const isNewUser = searchParams.get('isNewUser') === 'true';

    if (success === 'true') {
      // JWT token is already in HTTP-only cookie (set by backend)
      // Read user info from non-HTTP-only cookie
      const userInfoCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_info='));

      if (userInfoCookie) {
        try {
          // Decode URL-encoded cookie value
          const encodedValue = userInfoCookie.split('=').slice(1).join('=');
          const decodedValue = decodeURIComponent(encodedValue);
          const parsedUserInfo: UserInfo = JSON.parse(decodedValue);

          // Store user info in localStorage for easy access
          localStorage.setItem('user_id', parsedUserInfo.userId.toString());
          localStorage.setItem('user_email', parsedUserInfo.email);
          localStorage.setItem('user_role', parsedUserInfo.role);

          console.log('OAuth2 login successful:', parsedUserInfo);

          if (isNewUser) {
            // New user: show role selection modal
            setUserInfo(parsedUserInfo);
            setShowRoleModal(true);
          } else {
            // Existing user: redirect to their role-specific dashboard
            redirectToDashboard(parsedUserInfo.role, router);
          }
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

  const handleRoleSelected = (role: string) => {
    setShowRoleModal(false);
    setStatusMessage('Redirecting to your dashboard...');
    // Update localStorage with the new role
    localStorage.setItem('user_role', role);
    redirectToDashboard(role, router);
  };

  if (showRoleModal && userInfo) {
    return <RoleSelectionModal userInfo={userInfo} onRoleSelected={handleRoleSelected} />;
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      }}
    >
      <div
        className="text-center p-10 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
          >
            <svg
              className="animate-spin h-8 w-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{statusMessage}</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}

/**
 * Redirects the user to the correct dashboard based on their role.
 */
function redirectToDashboard(role: string, router: ReturnType<typeof useRouter>) {
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
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      }}
    >
      <div
        className="text-center p-10 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#6366f1' }} />
        <h2 className="text-xl font-bold text-white">Loading...</h2>
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
