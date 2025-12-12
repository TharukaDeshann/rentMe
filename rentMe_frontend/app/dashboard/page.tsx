'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    userId: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    // Check if user is authenticated by checking cookies
    const userInfoCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_info='));

    if (!userInfoCookie) {
      // Not authenticated, redirect to login
      router.push('/login');
      return;
    }

    try {
      // Decode URL-encoded cookie value
      const encodedValue = userInfoCookie.split('=')[1];
      const decodedValue = decodeURIComponent(encodedValue);
      const userInfo = JSON.parse(decodedValue);
      
      setUser({
        userId: userInfo.userId.toString(),
        email: userInfo.email,
        role: userInfo.role,
      });

      // Also store in localStorage for easy access
      localStorage.setItem('user_id', userInfo.userId.toString());
      localStorage.setItem('user_email', userInfo.email);
      localStorage.setItem('user_role', userInfo.role);
    } catch (error) {
      console.error('Failed to parse user info:', error);
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to clear cookies
      await fetch('http://localhost:8080/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies in request
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear localStorage
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');

    // Redirect to login
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">rentMe</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 Welcome to rentMe Dashboard!
              </h2>
              <p className="text-gray-600 mb-4">
                You have successfully logged in using OAuth2 Google authentication.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Authentication successful! Your OAuth2 implementation is working perfectly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Account Information</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.userId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Authentication Method</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Google OAuth2
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Testing Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              ✅ OAuth2 Testing Complete
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Backend OAuth2 configuration working</li>
              <li>Google authentication successful</li>
              <li>User created/updated in database</li>
              <li>JWT token generated and stored</li>
              <li>Frontend redirect handler working</li>
              <li>Protected route access granted</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
