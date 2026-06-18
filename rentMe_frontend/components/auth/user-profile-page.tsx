"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Mail,
  Phone,
  Calendar,
  User,
  Upload,
  Save,
  Trash2,
  ArrowLeft,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserProfile } from "@/contexts"
import { userService } from "@/services"

interface UserProfilePageProps {
  onBack?: () => void
  onDeleteSuccess: () => void
  initialData?: {
    fullName: string
    email: string
    phoneNumber: string
    dateOfBirth: string | null
    profilePicture: string | null
  }
}

export function UserProfilePage({ onBack, onDeleteSuccess, initialData }: UserProfilePageProps) {
  const router = useRouter()
  const { updateProfile } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileImage, setProfileImage] = useState(initialData?.profilePicture || "/woman-profile.png")
  const [error, setError] = useState("")

  // Default back handler uses browser history if no custom onBack provided
  const handleBackClick = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }
  
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    phoneNumber: initialData?.phoneNumber || "",
    dateOfBirth: initialData?.dateOfBirth || "",
  })

  const [editData, setEditData] = useState(formData)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    setError("")
    
    try {
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Use userService instead of direct fetch
      const updatedUser = await userService.updateUser(parseInt(userId), {
        fullName: editData.fullName,
        email: editData.email,
        contactNumber: editData.phoneNumber,
        dateOfBirth: editData.dateOfBirth || undefined,
      })

      // Update local form data
      setFormData(editData)
      setIsEditing(false)

      // Update the global user profile context for real-time updates
      updateProfile(updatedUser)
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProfile = async () => {
    setIsSaving(true)
    setError("")
    
    try {
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Use userService instead of direct fetch
      await userService.deleteUser(parseInt(userId))

      setShowDeleteDialog(false)
      onDeleteSuccess()
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting profile')
    } finally {
      setIsSaving(false)
    }
  }

  const initials = formData.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
                <p className="text-sm text-muted-foreground">Manage your account information</p>
              </div>
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditData(formData)
                    setIsEditing(false)
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <div className="grid gap-8">
          {/* Profile Picture Section */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile photo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={profileImage || "/placeholder.svg"} alt={formData.fullName} />
                  <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
                </Avatar>

                {isEditing && (
                  <div className="space-y-3">
                    <label htmlFor="profile-image" className="block">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 cursor-pointer border-border bg-transparent"
                      >
                        <Upload className="h-4 w-4" />
                        Upload New Photo
                      </Button>
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Recommended: Square image, at least 400x400px
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Section */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-2 border-border"
                >
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name
                </label>
                {isEditing ? (
                  <Input
                    name="fullName"
                    value={editData.fullName}
                    onChange={handleInputChange}
                    className="bg-muted/50 border-border focus:border-primary"
                  />
                ) : (
                  <p className="text-foreground font-medium">{formData.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </label>
                {isEditing ? (
                  <Input
                    name="email"
                    type="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="bg-muted/50 border-border focus:border-primary"
                  />
                ) : (
                  <p className="text-foreground font-medium">{formData.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Contact Number
                </label>
                {isEditing ? (
                  <Input
                    name="phoneNumber"
                    value={editData.phoneNumber}
                    onChange={handleInputChange}
                    className="bg-muted/50 border-border focus:border-primary"
                  />
                ) : (
                  <p className="text-foreground font-medium">{formData.phoneNumber}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <Input
                    name="dateOfBirth"
                    type="date"
                    value={editData.dateOfBirth}
                    onChange={handleInputChange}
                    className="bg-muted/50 border-border focus:border-primary"
                  />
                ) : (
                  <p className="text-foreground font-medium">
                    {formData.dateOfBirth
                      ? new Date(formData.dateOfBirth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not provided"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="gap-2 hover:bg-destructive/90"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Profile
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">
                Deleting your profile will permanently remove all your data. This action cannot be undone.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your profile and all associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              Type <span className="font-mono font-bold">delete my account</span> to confirm:
            </p>
            <Input placeholder="Type here..." className="bg-muted/50 border-border" />
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              disabled={isSaving}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isSaving ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
