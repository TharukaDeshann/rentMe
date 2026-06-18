'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy Dashboard - Redirects users to their role-specific dashboard.
 * This page is kept for backward compatibility but should not be used directly.
 * Users are automatically redirected based on their stored role.
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Read role from localStorage (set during login)
    const role = localStorage.getItem('user_role');

    // Also check cookie as fallback
    const userInfoCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_info='));

    let resolvedRole = role;

    if (!resolvedRole && userInfoCookie) {
      try {
        const encodedValue = userInfoCookie.split('=').slice(1).join('=');
        const decodedValue = decodeURIComponent(encodedValue);
        const userInfo = JSON.parse(decodedValue);
        resolvedRole = userInfo.role;
      } catch {
        // ignore parse errors
      }
    }

    if (!resolvedRole) {
      // Not authenticated
      router.replace('/login');
      return;
    }

    // Redirect to role-specific dashboard
    switch (resolvedRole) {
      case 'ADMIN':
        router.replace('/admin');
        break;
      case 'VEHICLE_OWNER':
        router.replace('/owner');
        break;
      case 'RENTER':
      default:
        router.replace('/renter');
        break;
    }
  }, [router]);

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
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
        >
          <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Redirecting...</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>
          Taking you to your dashboard.
        </p>
      </div>
    </div>
  );
}
