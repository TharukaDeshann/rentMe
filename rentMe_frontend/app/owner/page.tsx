'use client';

import { OwnerDashboard } from '@/components/owner/dashboard';

/**
 * Vehicle Owner Dashboard Home Page
 * Shows overview of vehicles, bookings, and earnings
 */
export default function OwnerDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Owner Dashboard</h2>
        <p className="mt-2 text-gray-600">
          Manage your vehicles, view booking requests, and track your earnings.
        </p>
      </div>

      {/* Owner Dashboard Component */}
      <OwnerDashboard />
    </div>
  );
}
