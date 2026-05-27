"use client";

import { MyBookings } from "@/components/renter/my-bookings";

/**
 * Renter Bookings Page
 * Displays all of the renter's bookings with live cancel support.
 */
export default function RenterBookingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MyBookings />
    </div>
  );
}