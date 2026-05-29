"use client"
import authService from "@/services/auth.service";

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { AppLayout } from "@/components/templates/layout/app-layout"
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
import { LoginPage } from "@/components/auth/login-page"
import { RegistrationPage } from "@/components/auth/registration-page"
import { UserProfilePage } from "@/components/auth/user-profile-page"
import { ProfileSidebar } from "@/components/auth/profile-sidebar"
import { getCurrentUserInfo } from "@/utils/user-info" // Declare the variable here
import { UserRole as BackendUserRole } from "@/types";

type UserRole = "renter" | "owner" | "admin"
type AuthView = "login" | "register" | "app" | "profile"

const mapRole = (role?: BackendUserRole | string | null): UserRole => {
  if (!role) return "renter";
  const r = typeof role === 'string' ? role.toUpperCase() : role;
  if (r === BackendUserRole.ADMIN || r === "ADMIN") return "admin";
  if (r === BackendUserRole.VEHICLE_OWNER || r === "VEHICLE_OWNER") return "owner";
  return "renter";
};

export default function Home() {
  const [authView, setAuthView] = useState<AuthView>("login")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState({ id: "", name: "", email: "", image: "/woman-profile.png" })
  const [currentRole, setCurrentRole] = useState<UserRole>("renter")
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [showChatsList, setShowChatsList] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<"browse" | "detail">("browse")
  const [showProfileSidebar, setShowProfileSidebar] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const { toast } = useToast()

  const handleLoginSuccess = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });
      
      setCurrentUser({ id: data.userId.toString(), name: data.email, email: data.email, image: "/woman-profile.png" })
      setCurrentRole(mapRole(data.role))
      setIsAuthenticated(true)
      setAuthView("app")
      toast({ title: "Login Successful", description: "Welcome back!" })
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.response?.data?.message || err.message || "Invalid credentials", variant: "destructive" })
      throw err
    }
  }

  const handleRegistrationSuccess = async (formData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    dateOfBirth?: string;
  }) => {
    try {
      const data = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        contactNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        role: BackendUserRole.RENTER
      });
      
      setCurrentUser({ id: data.userId.toString(), name: formData.fullName, email: formData.email, image: "/woman-profile.png" })
      setCurrentRole(mapRole(data.role))
      setIsAuthenticated(true)
      setAuthView("app")
      toast({ title: "Registration Successful", description: "Your account has been created." })
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.response?.data?.message || err.message || "Failed to create account", variant: "destructive" })
      throw err
    }
  }



  const handleLogout = () => {
    setIsAuthenticated(false)
    setAuthView("login")
    setShowProfileSidebar(false)
  }

  const handleDeleteProfile = () => {
    setIsAuthenticated(false)
    setAuthView("login")
    setShowProfileSidebar(false)
    setProfileData(null)
  }

  const handleViewDetails = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId)
    setCurrentView("detail")
  }

  const handleBackToBrowse = () => {
    setCurrentView("browse")
    setSelectedVehicleId(null)
  }

  // Show authentication pages
  if (!isAuthenticated) {
    if (authView === "login") {
      return (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setAuthView("register")}
        />
      )
    }
    if (authView === "register") {
      return (
        <RegistrationPage
          onRegistrationSuccess={handleRegistrationSuccess}
          onSwitchToLogin={() => setAuthView("login")}
        />
      )
    }
  }

  // Show profile page
  if (authView === "profile") {
    // Fetch profile data if not already loaded
    if (!profileData && isAuthenticated) {
      fetch('http://localhost:8080/api/v1/users/me', {
        method: 'GET',
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          setProfileData({
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.contactNumber,
            dateOfBirth: data.dateOfBirth,
            profilePicture: data.profilePicture,
          })
        })
        .catch(err => console.error('Failed to fetch profile:', err))
    }

    if (!profileData) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    return (
      <UserProfilePage
        onBack={() => {
          setAuthView("app")
          setProfileData(null)
        }}
        onDeleteSuccess={handleDeleteProfile}
        initialData={profileData}
      />
    )
  }

  return (
      <AppLayout
      currentRole={currentRole}
      userName={currentUser.name}
      userEmail={currentUser.email}
      userImage={currentUser.image}
      userId={currentUser.id}
      onMessagesClick={() => setShowChatsList(true)}
      onProfileClick={() => setShowProfileSidebar(true)}
    >
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
          onSuccess={() => {
            setShowBookingForm(false)
          }}
        />
      )}

      {showChatInterface && selectedVehicleId && (
        <ChatInterface
          vehicleId={selectedVehicleId.toString()}
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
      
      {/* Profile Sidebar */}
      {showProfileSidebar && (
        <ProfileSidebar
          onManageProfile={() => {
            setAuthView("profile")
            setShowProfileSidebar(false)
            setProfileData(null)
          }}
          onClose={() => setShowProfileSidebar(false)}
        />
      )}
    </AppLayout>
  )
}
