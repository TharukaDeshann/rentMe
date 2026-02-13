'use client';

import { Analytics } from '@/components/admin/analytics';

/**
 * Admin Dashboard Home Page
 * Shows analytics and overview for administrators
 */
export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="mt-2 text-gray-600">
          Welcome to the admin control panel. Monitor users, verify owners, and analyze platform metrics.
        </p>
      </div>

      {/* Analytics Component */}
      <Analytics />
    </div>
  );
}
