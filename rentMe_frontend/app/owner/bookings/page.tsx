'use client';

import { BookingRequests } from '@/components/owner/booking-requests';

export default function OwnerBookingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Booking Requests</h2>
        <p className="mt-2 text-gray-600">
          Review and manage booking requests for your vehicles.
        </p>
      </div>

      <BookingRequests />
    </div>
  );
}
