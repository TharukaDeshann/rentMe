"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  Shield,
  ShieldCheck,
  BadgeCheck,
  CheckCircle2,
  Fingerprint,
  Clock,
  ShieldOff,
} from "lucide-react"
import { useUserProfile } from "@/contexts"
import { userService } from "@/services"
import { User as UserType, UserRole } from "@/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRoleLabel(role: string) {
  switch (role) {
    case "VEHICLE_OWNER": return "Vehicle Owner";
    case "ADMIN":         return "Administrator";
    default:              return "Renter";
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case "ADMIN":         return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400";
    case "VEHICLE_OWNER": return "bg-secondary/10 text-secondary border-secondary/20";
    default:              return "bg-primary/10 text-primary border-primary/20";
  }
}

function getRoleGradient(role: string) {
  switch (role) {
    case "ADMIN":         return "from-amber-500/15 via-amber-400/5 to-transparent";
    case "VEHICLE_OWNER": return "from-secondary/15 via-secondary/5 to-transparent";
    default:              return "from-primary/15 via-primary/5 to-transparent";
  }
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function VerificationBadge({ user }: { user: UserType }) {
  if (user.role !== UserRole.VEHICLE_OWNER) return null;
  const status = user.verificationStatus;
  if (status === "APPROVED")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full dark:bg-emerald-900/20 dark:text-emerald-400">
        <ShieldCheck className="h-3.5 w-3.5" /> KYC Verified
      </span>
    );
  if (status === "PENDING")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full dark:bg-amber-900/20 dark:text-amber-400">
        <Clock className="h-3.5 w-3.5" /> KYC Pending
      </span>
    );
  if (status === "REJECTED")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive bg-destructive/5 border border-destructive/20 px-2.5 py-1 rounded-full">
        <ShieldOff className="h-3.5 w-3.5" /> KYC Rejected
      </span>
    );
  return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserProfilePageProps {
  onBack?: () => void
  onDeleteSuccess: () => void
  onProfileUpdate?: (user: UserType) => void
  /** Full User object from the API (replaces initialData) */
  user?: UserType | null
  /** Legacy prop — still supported */
  initialData?: {
    fullName: string
    email: string
    phoneNumber: string
    dateOfBirth: string | null
    profilePicture: string | null
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserProfilePage({
  onBack,
  onDeleteSuccess,
  onProfileUpdate,
  user: userProp,
  initialData,
}: UserProfilePageProps) {
  const router = useRouter()
  const { updateProfile } = useUserProfile()

  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  // Derive initial form values from either the user prop or legacy initialData
  const initialFormData = {
    fullName:    userProp?.fullName    ?? initialData?.fullName    ?? "",
    email:       userProp?.email       ?? initialData?.email       ?? "",
    phoneNumber: userProp?.contactNumber ?? initialData?.phoneNumber ?? "",
    dateOfBirth: userProp?.dateOfBirth ?? initialData?.dateOfBirth ?? "",
  }

  const [profileImage, setProfileImage] = useState(
    userProp?.profilePicture ?? initialData?.profilePicture ?? ""
  )
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [formData, setFormData]   = useState(initialFormData)
  const [editData, setEditData]   = useState(initialFormData)

  const handleBackClick = () => {
    if (onBack) onBack()
    else router.back()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImageFile(file)
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
      const userId = userProp?.userId ?? Number(localStorage.getItem("user_id"))
      if (!userId) throw new Error("User not authenticated")

      let finalUser = userProp;

      if (selectedImageFile) {
        finalUser = await userService.uploadProfilePicture(userId, selectedImageFile)
        setProfileImage(finalUser.profilePicture ?? "")
        setSelectedImageFile(null)
      }

      const updatedUser = await userService.updateUser(userId, {
        fullName:      editData.fullName,
        email:         editData.email,
        contactNumber: editData.phoneNumber,
        dateOfBirth:   editData.dateOfBirth || undefined,
      })

      const combinedUser = {
        ...updatedUser,
        profilePicture: updatedUser.profilePicture || finalUser?.profilePicture,
      }

      setFormData(editData)
      setIsEditing(false)
      updateProfile(combinedUser)
      onProfileUpdate?.(combinedUser)
    } catch (err: any) {
      setError(err.message || "An error occurred while saving changes")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (deleteConfirmText !== "delete my account") {
      setError("Please type the confirmation phrase exactly")
      return
    }
    setIsSaving(true)
    setError("")
    try {
      const userId = userProp?.userId ?? Number(localStorage.getItem("user_id"))
      if (!userId) throw new Error("User not authenticated")
      await userService.deleteUser(userId)
      setShowDeleteDialog(false)
      onDeleteSuccess()
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting profile")
    } finally {
      setIsSaving(false)
    }
  }

  const initials = formData.fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const gradient = userProp ? getRoleGradient(userProp.role) : "from-primary/15 via-primary/5 to-transparent"

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky header ──────────────────────────────────────────── */}
      <div className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight">My Profile</h1>
                <p className="text-xs text-muted-foreground">Manage your account information</p>
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditData(formData);
                    setIsEditing(false);
                    setError("");
                    setSelectedImageFile(null);
                    setProfileImage(userProp?.profilePicture ?? initialData?.profilePicture ?? "");
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setEditData(formData); setIsEditing(true); }}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* ── Hero / Profile Header ───────────────────────────── */}
        <Card className={`border-border overflow-hidden`}>
          <div className={`bg-gradient-to-b ${gradient} px-6 pt-8 pb-6`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Avatar section */}
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profileImage || undefined} alt={formData.fullName} />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {initials || <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />

                {isEditing && (
                  <label
                    htmlFor="profile-image"
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                    title="Upload new photo"
                  >
                    <Upload className="h-6 w-6 text-white" />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Name + badges */}
              <div className="flex-1 space-y-2 pb-1">
                <div>
                  <h2 className="text-2xl font-bold text-foreground leading-tight">{formData.fullName || "—"}</h2>
                  <p className="text-sm text-muted-foreground">{formData.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {userProp && (
                    <Badge variant="outline" className={`text-xs ${getRoleColor(userProp.role)}`}>
                      {getRoleLabel(userProp.role)}
                    </Badge>
                  )}
                  {userProp && <VerificationBadge user={userProp} />}
                  {userProp?.emailVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                      <BadgeCheck className="h-3.5 w-3.5" /> Email verified
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account meta row */}
          {userProp && (
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border border-t border-border">
              {[
                { label: "User ID", value: `#${userProp.userId}`, icon: Fingerprint },
                { label: "Member Since", value: formatDate(userProp.createdAt), icon: Calendar },
                { label: "Auth Provider", value: userProp.authProvider?.toLowerCase() ?? "local", icon: Shield },
                { label: "Last Updated", value: formatDate(userProp.updatedAt), icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="px-4 py-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold flex items-center justify-center gap-1">
                    <Icon className="h-3 w-3" /> {label}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 capitalize truncate">{value}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Personal Information ────────────────────────────── */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription className="text-xs">Your account details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" /> Full Name
              </label>
              {isEditing ? (
                <Input
                  name="fullName"
                  value={editData.fullName}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="bg-muted/30"
                />
              ) : (
                <p className="text-sm text-foreground font-medium pl-6">{formData.fullName || "—"}</p>
              )}
            </div>

            <Separator />

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> Email Address
              </label>
              {isEditing ? (
                <Input
                  name="email"
                  type="email"
                  value={editData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="bg-muted/30"
                />
              ) : (
                <div className="flex items-center gap-2 pl-6">
                  <p className="text-sm text-foreground font-medium">{formData.email || "—"}</p>
                  {userProp?.emailVerified && (
                    <span title="Email verified">
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    </span>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> Contact Number
              </label>
              {isEditing ? (
                <Input
                  name="phoneNumber"
                  value={editData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+94 71 234 5678"
                  className="bg-muted/30"
                />
              ) : (
                <p className="text-sm text-foreground font-medium pl-6">{formData.phoneNumber || "Not provided"}</p>
              )}
            </div>

            <Separator />

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Date of Birth
              </label>
              {isEditing ? (
                <Input
                  name="dateOfBirth"
                  type="date"
                  value={editData.dateOfBirth}
                  onChange={handleInputChange}
                  className="bg-muted/30"
                />
              ) : (
                <p className="text-sm text-foreground font-medium pl-6">
                  {formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })
                    : "Not provided"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Danger Zone ─────────────────────────────────────── */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            <CardDescription className="text-xs">Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently remove your account and all associated data.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={() => { setDeleteConfirmText(""); setShowDeleteDialog(true); }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* ── Delete Confirmation Dialog ──────────────────────────── */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is <strong>permanent and cannot be undone</strong>. All your data,
              bookings, vehicles, and reviews will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-1">
            <p className="text-sm text-foreground">
              Type <span className="font-mono font-bold text-destructive">delete my account</span> to confirm:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type here…"
              className="bg-muted/50"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel onClick={() => setError("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              disabled={isSaving || deleteConfirmText !== "delete my account"}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50"
            >
              {isSaving ? "Deleting…" : "Delete Account"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
