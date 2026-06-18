"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrowseVehicles } from "@/components/renter/browse-vehicles";
import { VehicleDetailPage } from "@/components/renter/vehicle-detail-page";
import { BookingForm } from "@/components/renter/booking-form";
import { BookingConfirmation } from "@/components/renter/booking-confirmation";
import { Vehicle, Booking } from "@/types/booking";

type View = "browse" | "detail";

/**
 * Renter Dashboard Home Page
 * Orchestrates: browse vehicles → view detail → request booking → confirmation
 */
export default function RenterDashboardPage() {
  const router = useRouter();

  const [view, setView] = useState<View>("browse");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  );
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null
  );

  const handleViewDetails = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setView("detail");
  };

  const handleBack = () => {
    setView("browse");
    setSelectedVehicleId(null);
  };

  const handleOpenBookingForm = (vehicle: Vehicle) => {
    setBookingVehicle(vehicle);
  };

  const handleBookingSuccess = (booking: Booking) => {
    setBookingVehicle(null);
    setConfirmedBooking(booking);
  };

  const handleConfirmationClose = () => {
    setConfirmedBooking(null);
    setView("browse");
  };

  const handleViewMyBookings = () => {
    setConfirmedBooking(null);
    router.push("/renter/bookings");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {view === "browse" && (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Browse Vehicles
            </h2>
            <p className="mt-2 text-gray-600">
              Find the perfect vehicle for your next adventure.
            </p>
          </div>
          <BrowseVehicles onViewDetails={handleViewDetails} />
        </>
      )}

      {view === "detail" && selectedVehicleId !== null && (
        <VehicleDetailPage
          vehicleId={selectedVehicleId}
          onBack={handleBack}
          onBooking={handleOpenBookingForm}
          onChat={() => {
            /* TODO: open chat module */
          }}
        />
      )}

      {/* Booking form modal */}
      {bookingVehicle && (
        <BookingForm
          vehicle={bookingVehicle}
          onClose={() => setBookingVehicle(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Booking confirmation modal */}
      {confirmedBooking && (
        <BookingConfirmation
          booking={confirmedBooking}
          onClose={handleConfirmationClose}
          onViewBookings={handleViewMyBookings}
        />
      )}
    </div>
  );
}