"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { BrowseVehicles } from "@/components/renter/browse-vehicles"
import { VehicleDetailPage } from "@/components/renter/vehicle-detail-page"
import { MyBookings } from "@/components/renter/my-bookings"
import { BookingForm } from "@/components/renter/booking-form"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChatsList } from "@/components/chat/chats-list"
import { OwnerDashboard } from "@/components/owner/dashboard"
import { MyVehicles } from "@/components/owner/my-vehicles"
import { BookingRequests } from "@/components/owner/booking-requests"
import { Verification } from "@/components/owner/verification"
import { VerificationQueue } from "@/components/admin/verification-queue"
import { Analytics } from "@/components/admin/analytics"
import { UserMonitor } from "@/components/admin/user-monitor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatbotFloatingIcon } from "@/components/chatbot/chatbot-floating-icon"

type UserRole = "renter" | "owner" | "admin"

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>("renter")
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [showChatsList, setShowChatsList] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<"browse" | "detail">("browse")

  const getCurrentUserInfo = () => {
    if (currentRole === "renter") {
      return { id: "renter-1", name: "Sarah Johnson" }
    } else if (currentRole === "owner") {
      return { id: "owner-1", name: "Alex Rodriguez" }
    } else {
      return { id: "admin-1", name: "Admin User" }
    }
  }

  const currentUser = getCurrentUserInfo()

  const handleViewDetails = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
    setCurrentView("detail")
  }

  const handleBackToBrowse = () => {
    setCurrentView("browse")
    setSelectedVehicleId(null)
  }

  return (
    <>
      <Navigation
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onMessagesClick={() => setShowChatsList(true)}
      />

      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Renter View */}
          {currentRole === "renter" && (
            <div className="space-y-8">
              {currentView === "browse" ? (
                <>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Find Your Perfect Vehicle</h1>
                    <p className="mt-2 text-muted-foreground">
                      Browse and rent vehicles from verified owners in your area
                    </p>
                  </div>
                  <Tabs defaultValue="browse" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="browse">Browse Vehicles</TabsTrigger>
                      <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="browse" className="mt-6">
                      <BrowseVehicles onViewDetails={handleViewDetails} />
                    </TabsContent>

                    <TabsContent value="bookings" className="mt-6">
                      <MyBookings />
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <VehicleDetailPage
                  vehicleId={selectedVehicleId!}
                  onBack={handleBackToBrowse}
                  onBooking={() => setShowBookingForm(true)}
                  onChat={() => setShowChatInterface(true)}
                />
              )}
            </div>
          )}

          {/* Owner View */}
          {currentRole === "owner" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Owner Dashboard</h1>
                <p className="mt-2 text-muted-foreground">Manage your vehicles and bookings</p>
              </div>

              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-6">
                  <OwnerDashboard />
                </TabsContent>

                <TabsContent value="vehicles" className="mt-6">
                  <MyVehicles />
                </TabsContent>

                <TabsContent value="bookings" className="mt-6">
                  <BookingRequests />
                </TabsContent>

                <TabsContent value="verification" className="mt-6">
                  <Verification />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Admin View */}
          {currentRole === "admin" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="mt-2 text-muted-foreground">Manage platform verifications and view analytics</p>
              </div>

              <Tabs defaultValue="analytics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="users">User Monitor</TabsTrigger>
                  <TabsTrigger value="verification">Verification Queue</TabsTrigger>
                </TabsList>

                <TabsContent value="analytics" className="mt-6">
                  <Analytics />
                </TabsContent>

                <TabsContent value="users" className="mt-6">
                  <UserMonitor />
                </TabsContent>

                <TabsContent value="verification" className="mt-6">
                  <VerificationQueue />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showBookingForm && selectedVehicleId && (
        <BookingForm
          vehicleId={selectedVehicleId}
          onClose={() => {
            setShowBookingForm(false)
          }}
        />
      )}

      {showChatInterface && selectedVehicleId && (
        <ChatInterface
          vehicleId={selectedVehicleId}
          currentUserId="renter-1"
          onClose={() => {
            setShowChatInterface(false)
          }}
        />
      )}

      {showChatsList && (
        <ChatsList
          currentUserId={currentRole === "renter" ? "renter-1" : "owner-1"}
          onSelectChat={(chatId) => {
            setSelectedChatId(chatId)
            setShowChatsList(false)
            setShowChatInterface(true)
          }}
          onClose={() => setShowChatsList(false)}
        />
      )}

      <ChatbotFloatingIcon userId={currentUser.id} userRole={currentRole} userName={currentUser.name} />
    </>
  )
}
