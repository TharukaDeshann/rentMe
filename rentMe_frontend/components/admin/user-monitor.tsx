"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  RefreshCw,
  MessageSquare,
  User as UserIcon,
  Shield,
  ShieldCheck,
  ShieldOff,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  BadgeCheck,
  X,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers } from "@/services/user.service";
import { createOrGetSession } from "@/services/chat.service";
import { User, UserRole } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
      return "Owner";
    case "ADMIN":
      return "Admin";
    default:
      return "Renter";
  }
}

function getVerificationBadge(user: User) {
  if (user.role !== UserRole.VEHICLE_OWNER) return null;
  const status = user.verificationStatus;
  if (status === "APPROVED")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
        <ShieldCheck className="h-2.5 w-2.5" /> Verified
      </span>
    );
  if (status === "PENDING")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full dark:bg-amber-900/20 dark:text-amber-400">
        Pending KYC
      </span>
    );
  if (status === "REJECTED")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-destructive bg-destructive/5 border border-destructive/20 px-1.5 py-0.5 rounded-full">
        <ShieldOff className="h-2.5 w-2.5" /> Rejected
      </span>
    );
  return (
    <span className="text-[10px] text-muted-foreground">Not verified</span>
  );
}

// ─── User Detail Modal ────────────────────────────────────────────────────────

interface UserDetailModalProps {
  user: User | null;
  onClose: () => void;
  onSendMessage: (user: User) => void;
  isSendingMessage: boolean;
}

function UserDetailModal({
  user,
  onClose,
  onSendMessage,
  isSendingMessage,
}: UserDetailModalProps) {
  if (!user) return null;

  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border">
              {user.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profilePicture}
                  alt={user.fullName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold truncate">{user.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${getRoleColor(user.role)}`}
                >
                  {getRoleLabel(user.role)}
                </Badge>
                {getVerificationBadge(user)}
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                    user.isActive !== false
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "bg-destructive/5 text-destructive border-destructive/20"
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
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Contact Info */}
          <div className="grid gap-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium truncate">{user.email}</p>
              </div>
              {user.emailVerified && (
                <span title="Email verified" className="ml-auto shrink-0">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                </span>
              )}
            </div>

            {user.contactNumber && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="font-medium">{user.contactNumber}</p>
                </div>
              </div>
            )}

            {user.dateOfBirth && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date of birth</p>
                  <p className="font-medium">{formatDate(user.dateOfBirth)}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Account Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="font-mono font-medium text-foreground">#{user.userId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Auth Provider</p>
              <p className="font-medium capitalize">{user.authProvider?.toLowerCase() ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last updated</p>
              <p className="font-medium">{formatDate(user.updatedAt)}</p>
            </div>
          </div>

          {/* Roles set */}
          {user.roles && user.roles.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-2">All roles</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.map((r) => (
                    <Badge
                      key={r}
                      variant="outline"
                      className={`text-xs ${getRoleColor(r)}`}
                    >
                      {getRoleLabel(r)}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          {!isAdmin && (
            <>
              <Separator />
              <Button
                className="w-full gap-2"
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── User Row ─────────────────────────────────────────────────────────────────

interface UserRowProps {
  user: User;
  onViewDetails: (user: User) => void;
  onSendMessage: (user: User) => void;
  isSendingMessage: boolean;
}

function UserRow({ user, onViewDetails, onSendMessage, isSendingMessage }: UserRowProps) {
  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0">
      {/* Avatar */}
      <Avatar className="h-9 w-9 shrink-0 border">
        {user.profilePicture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profilePicture}
            alt={user.fullName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {getInitials(user.fullName)}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate text-sm">{user.fullName}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>

      {/* Role badge */}
      <Badge
        variant="outline"
        className={`text-[11px] shrink-0 hidden sm:flex ${getRoleColor(user.role)}`}
      >
        {getRoleLabel(user.role)}
      </Badge>

      {/* Verification badge (owner only) */}
      <div className="shrink-0 hidden md:block">
        {getVerificationBadge(user)}
      </div>

      {/* Status badge */}
      <span
        className={`hidden lg:inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${
          user.isActive !== false
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
            : "bg-destructive/5 text-destructive border-destructive/20"
        }`}
      >
        {user.isActive !== false ? "Active" : "Inactive"}
      </span>

      {/* Member since */}
      <span className="text-xs text-muted-foreground shrink-0 hidden xl:block">
        {formatDate(user.createdAt)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onSendMessage(user)}
            disabled={isSendingMessage || user.isActive === false}
            title="Open chat with this user"
          >
            {isSendingMessage ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MessageSquare className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Message</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onViewDetails(user)}
          title="View user profile"
        >
          <UserIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Details</span>
        </Button>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <Card className="border border-border shadow-none">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent}`}>
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function UserMonitor() {
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "renters" | "owners" | "admins">("all");

  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [messagingUserId, setMessagingUserId] = useState<number | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      // Sort: active first, then by name
      data.sort((a, b) => {
        if ((a.isActive !== false) !== (b.isActive !== false)) {
          return a.isActive !== false ? -1 : 1;
        }
        return (a.fullName ?? "").localeCompare(b.fullName ?? "");
      });
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Derived lists ──────────────────────────────────────────────────────────

  const renters = users.filter((u) => u.role === UserRole.RENTER);
  const owners  = users.filter((u) => u.role === UserRole.VEHICLE_OWNER);
  const admins  = users.filter((u) => u.role === UserRole.ADMIN);
  const verifiedOwners = owners.filter((u) => u.verificationStatus === "APPROVED");

  const baseList = (() => {
    switch (activeTab) {
      case "renters": return renters;
      case "owners":  return owners;
      case "admins":  return admins;
      default:        return users;
    }
  })();

  const filtered = baseList.filter((u) => {
    const q = query.toLowerCase();
    return (
      !q ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  // ── Send message ───────────────────────────────────────────────────────────

  const handleSendMessage = async (user: User) => {
    setMessagingUserId(user.userId);
    try {
      const session = await createOrGetSession({ targetUserId: user.userId });
      // Close any open modal first
      setDetailUser(null);
      router.push(`/admin/chat?session=${session.sessionId}`);
    } catch (err: any) {
      toast({
        title: "Could not start chat",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setMessagingUserId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            User Monitor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor all platform users
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={isLoading}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={users.length}
          icon={<UserIcon className="h-4 w-4 text-primary" />}
          accent="bg-primary/10"
        />
        <StatCard
          label="Renters"
          value={renters.length}
          icon={<UserIcon className="h-4 w-4 text-secondary" />}
          accent="bg-secondary/10"
        />
        <StatCard
          label="Vehicle Owners"
          value={owners.length}
          icon={<Shield className="h-4 w-4 text-emerald-600" />}
          accent="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatCard
          label="Verified Owners"
          value={verifiedOwners.length}
          icon={<ShieldCheck className="h-4 w-4 text-amber-600" />}
          accent="bg-amber-50 dark:bg-amber-900/20"
        />
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="all">All ({users.length})</TabsTrigger>
          <TabsTrigger value="renters">Renters ({renters.length})</TabsTrigger>
          <TabsTrigger value="owners">Owners ({owners.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
        </TabsList>

        {(["all", "renters", "owners", "admins"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="border border-border shadow-none overflow-hidden">
              {/* Table header */}
              <div className="grid items-center border-b border-border px-4 py-2.5 bg-muted/30"
                style={{ gridTemplateColumns: "1fr auto auto auto auto auto auto" }}>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:block pr-3">
                  Role
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:block pr-3">
                  KYC
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:block pr-3">
                  Status
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:block pr-3">
                  Member since
                </span>
                <span className="w-24 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                  Actions
                </span>
              </div>

              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  </div>
                ) : filtered.length > 0 ? (
                  filtered.map((user) => (
                    <UserRow
                      key={user.userId}
                      user={user}
                      onViewDetails={setDetailUser}
                      onSendMessage={handleSendMessage}
                      isSendingMessage={messagingUserId === user.userId}
                    />
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    {query ? `No users matching "${query}"` : "No users in this category"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* User detail modal */}
      <UserDetailModal
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onSendMessage={handleSendMessage}
        isSendingMessage={messagingUserId === detailUser?.userId}
      />
    </div>
  );
}