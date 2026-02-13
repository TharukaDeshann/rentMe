'use client';

import { BrowseVehicles } from '@/components/renter/browse-vehicles';

/**
 * Renter Dashboard Home Page
 * Shows available vehicles to browse and rent
 */
export default function RenterDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Browse Vehicles</h2>
        <p className="mt-2 text-gray-600">
          Find the perfect vehicle for your next adventure.
        </p>
      </div>

      {/* Browse Vehicles Component */}
      <BrowseVehicles />
    </div>
  );
}
