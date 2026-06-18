"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  Calendar,
  BadgeCheck,
  CheckCircle2,
  X,
  ShieldCheck,
  ShieldOff,
  MessageSquare,
  Loader2,
  User as UserIcon,
  Fingerprint,
  Clock,
} from "lucide-react";
import { getUserById } from "@/services/user.service";
import { User, UserRole } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getRoleColor(role: string) {
  switch (role) {
    case "ADMIN":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
    case "VEHICLE_OWNER":
      return "bg-secondary/10 text-secondary border-secondary/20";
    case "RENTER":
    default:
      return "bg-primary/10 text-primary border-primary/20";
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "VEHICLE_OWNER":
      return "Vehicle Owner";
    case "ADMIN":
      return "Administrator";
    default:
      return "Renter";
  }
}

function getRoleGradient(role: string) {
  switch (role) {
    case "ADMIN":
      return "from-amber-500/20 via-amber-400/10 to-transparent";
    case "VEHICLE_OWNER":
      return "from-secondary/20 via-secondary/10 to-transparent";
    default:
      return "from-primary/20 via-primary/10 to-transparent";
  }
}

function VerificationBadge({ user }: { user: User }) {
  if (user.role !== UserRole.VEHICLE_OWNER) return null;
  const status = user.verificationStatus;

  if (status === "APPROVED")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
        <ShieldCheck className="h-3 w-3" /> KYC Verified
      </span>
    );
  if (status === "PENDING")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full dark:bg-amber-900/20 dark:text-amber-400">
        <Clock className="h-3 w-3" /> KYC Pending
      </span>
    );
  if (status === "REJECTED")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-destructive bg-destructive/5 border border-destructive/20 px-2 py-0.5 rounded-full">
        <ShieldOff className="h-3 w-3" /> KYC Rejected
      </span>
    );
  return (
    <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border bg-muted/50">
      Not verified
    </span>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-5 pt-2">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-muted shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-40" />
          <div className="h-3 bg-muted rounded w-24" />
        </div>
      </div>
      <Separator />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-4 rounded bg-muted shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="h-2.5 bg-muted rounded w-16" />
              <div className="h-3.5 bg-muted rounded w-36" />
            </div>
          </div>
        ))}
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-2.5 bg-muted rounded w-16" />
            <div className="h-3.5 bg-muted rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile Content ──────────────────────────────────────────────────────────

function ProfileContent({
  user,
  onSendMessage,
  isSendingMessage,
  showMessageButton,
}: {
  user: User;
  onSendMessage?: (user: User) => void;
  isSendingMessage?: boolean;
  showMessageButton?: boolean;
}) {
  const isAdmin = user.role === UserRole.ADMIN;
  const gradient = getRoleGradient(user.role);

  return (
    <>
      {/* Hero header */}
      <div className={`-mx-6 -mt-2 px-6 pt-6 pb-5 bg-gradient-to-b ${gradient} rounded-t-lg`}>
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar className="h-16 w-16 border-2 border-background shadow-md">
              {user.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profilePicture}
                  alt={user.fullName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              )}
            </Avatar>
            {/* Active dot */}
            <span
              className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background ${
                user.isActive !== false ? "bg-emerald-500" : "bg-muted-foreground/40"
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-foreground leading-tight truncate">
              {user.fullName}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>

            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge
                variant="outline"
                className={`text-[11px] px-2 py-0.5 ${getRoleColor(user.role)}`}
              >
                {getRoleLabel(user.role)}
              </Badge>
              <VerificationBadge user={user} />
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  user.isActive !== false
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {user.isActive !== false ? (
                  <><CheckCircle2 className="h-2.5 w-2.5" /> Active</>
                ) : (
                  <><X className="h-2.5 w-2.5" /> Inactive</>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-1">
        {/* Contact Info */}
        <div className="grid gap-3">
          {/* Email */}
          <div className="flex items-center gap-3 text-sm p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Email</p>
              <p className="font-medium truncate text-sm">{user.email}</p>
            </div>
            {user.emailVerified && (
              <span title="Email verified" className="shrink-0">
                <BadgeCheck className="h-4 w-4 text-primary" />
              </span>
            )}
          </div>

          {/* Phone */}
          {user.contactNumber && (
            <div className="flex items-center gap-3 text-sm p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Contact</p>
                <p className="font-medium text-sm">{user.contactNumber}</p>
              </div>
            </div>
          )}

          {/* Date of Birth */}
          {user.dateOfBirth && (
            <div className="flex items-center gap-3 text-sm p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Date of Birth</p>
                <p className="font-medium text-sm">{formatDate(user.dateOfBirth)}</p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Account Meta */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold flex items-center gap-1">
              <Fingerprint className="h-3 w-3" /> User ID
            </p>
            <p className="font-mono font-semibold text-foreground">#{user.userId}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Auth Provider</p>
            <p className="font-medium capitalize">{user.authProvider?.toLowerCase() ?? "—"}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Member Since</p>
            <p className="font-medium">{formatDate(user.createdAt)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Last Updated</p>
            <p className="font-medium">{formatDate(user.updatedAt)}</p>
          </div>
        </div>

        {/* Multi-role set */}
        {user.roles && user.roles.length > 1 && (
          <>
            <Separator />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">All Roles</p>
              <div className="flex flex-wrap gap-1.5">
                {user.roles.map((r) => (
                  <Badge key={r} variant="outline" className={`text-xs ${getRoleColor(r)}`}>
                    {getRoleLabel(r)}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action */}
        {showMessageButton && !isAdmin && onSendMessage && (
          <>
            <Separator />
            <div className="space-y-2">
              <Button
                className="w-full gap-2 font-semibold"
                onClick={() => onSendMessage(user)}
                disabled={isSendingMessage || user.isActive === false}
              >
                {isSendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
                Send Message
              </Button>
              {user.isActive === false && (
                <p className="text-xs text-center text-muted-foreground">
                  Cannot message an inactive user.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface UserProfileViewModalProps {
  /** Pass a pre-loaded User object directly (no API call). */
  user?: User | null;
  /** Pass a userId to fetch the user on-demand (used when only ID is available). */
  userId?: number | null;
  open: boolean;
  onClose: () => void;
  /** Called when the "Send Message" action button is clicked. */
  onSendMessage?: (user: User) => void;
  isSendingMessage?: boolean;
  /** Whether to show the Send Message button (default: false). */
  showMessageButton?: boolean;
}

export function UserProfileViewModal({
  user: propUser,
  userId,
  open,
  onClose,
  onSendMessage,
  isSendingMessage = false,
  showMessageButton = false,
}: UserProfileViewModalProps) {
  const [fetchedUser, setFetchedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If userId is provided and no user prop, fetch on open
  useEffect(() => {
    if (!open) {
      setFetchedUser(null);
      setError(null);
      return;
    }
    if (propUser) return; // already have user data
    if (!userId) return;

    const fetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getUserById(userId);
        setFetchedUser(data);
      } catch (err: any) {
        setError(err.message || "Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [open, propUser, userId]);

  const displayUser = propUser ?? fetchedUser;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {displayUser ? `${displayUser.fullName}'s Profile` : "User Profile"}
          </DialogTitle>
        </DialogHeader>

        {isLoading && <ProfileSkeleton />}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-sm">Failed to load profile</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        )}

        {displayUser && !isLoading && (
          <ProfileContent
            user={displayUser}
            onSendMessage={onSendMessage}
            isSendingMessage={isSendingMessage}
            showMessageButton={showMessageButton}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UserProfileViewModal;
