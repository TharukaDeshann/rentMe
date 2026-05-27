'use client';

import { MyVehicles } from '@/components/owner/my-vehicles';

export default function OwnerVehiclesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">My Vehicles</h2>
        <p className="mt-2 text-gray-600">
          Manage your registered vehicles and add new ones.
        </p>
      </div>

      <MyVehicles />
    </div>
  );
}
