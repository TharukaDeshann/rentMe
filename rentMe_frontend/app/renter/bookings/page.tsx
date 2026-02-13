'use client';

import { MyBookings } from '@/components/renter/my-bookings';

export default function RenterBookingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">My Bookings</h2>
        <p className="mt-2 text-gray-600">
          View and manage your vehicle bookings.
        </p>
      </div>

      <MyBookings />
    </div>
  );
}
