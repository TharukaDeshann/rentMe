"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users, Car, Tag, Star, RefreshCw, CheckCircle, Clock,
  XCircle, TrendingUp, TrendingDown, ShieldCheck, AlertCircle,
  Loader2, Activity, FileCheck,
} from "lucide-react";
import { getAllUsers } from "@/services/user.service";
import { getAllVehiclesAdmin } from "@/services/vehicle.service";
import { getAllBookingsAdmin } from "@/services/booking.service";
import { getAllReviewsAdmin } from "@/services/review.service";
import { getAllVerificationRequests } from "@/services/verification.service";
import { User, UserRole } from "@/types";
import { Booking, Vehicle } from "@/types/booking";
import { ReviewResponseDTO } from "@/types/review";
import { VerificationRequest } from "@/types/document";

// ─── Colours ──────────────────────────────────────────────────────────────────
const BOOKING_STATUS_COLORS: Record<string, string> = {
  COMPLETED:  "var(--color-secondary)",
  APPROVED:   "#22c55e",
  PENDING:    "var(--color-chart-3)",
  CANCELLED:  "var(--color-destructive)",
  REJECTED:   "#f97316",
};

const BOOKING_STATUS_LABELS: Record<string, string> = {
  COMPLETED:  "Completed",
  APPROVED:   "Approved",
  PENDING:    "Pending",
  CANCELLED:  "Cancelled",
  REJECTED:   "Rejected",
};

const USER_ROLE_COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-chart-3)",
];

const VERIFICATION_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string) {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `Rs. ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `Rs. ${(amount / 1_000).toFixed(1)}K`;
  return `Rs. ${amount.toFixed(0)}`;
}

// ─── Derived Analytics ────────────────────────────────────────────────────────

function computeAnalytics(
  users: User[],
  vehicles: Vehicle[],
  bookings: Booking[],
  reviews: ReviewResponseDTO[],
  verifications: VerificationRequest[],
) {
  // User counts
  const renters = users.filter((u) => u.role === UserRole.RENTER);
  const owners  = users.filter((u) => u.role === UserRole.VEHICLE_OWNER);
  const admins  = users.filter((u) => u.role === UserRole.ADMIN);

  // Booking status breakdown
  const bookingStatusMap: Record<string, number> = {};
  let totalRevenue = 0;
  const revenueByMonth: Record<string, number> = {};
  const bookingsByVehicle: Record<number, number> = {};

  for (const b of bookings) {
    const status = b.status ?? "UNKNOWN";
    bookingStatusMap[status] = (bookingStatusMap[status] ?? 0) + 1;
    if (b.status === "COMPLETED" && b.totalAmount) {
      totalRevenue += b.totalAmount;
      if (b.createdAt) {
        const key = getMonthKey(b.createdAt);
        revenueByMonth[key] = (revenueByMonth[key] ?? 0) + b.totalAmount;
      }
    }
    if (b.vehicleId) {
      bookingsByVehicle[b.vehicleId] = (bookingsByVehicle[b.vehicleId] ?? 0) + 1;
    }
  }

  const bookingStatusData = Object.entries(bookingStatusMap)
    .map(([name, value]) => ({
      name: BOOKING_STATUS_LABELS[name] ?? name,
      value,
      rawStatus: name,
    }))
    .sort((a, b) => b.value - a.value);

  // Monthly user growth (last 6 months)
  const usersByMonth: Record<string, { renters: number; owners: number }> = {};
  for (const u of users) {
    if (!u.createdAt) continue;
    const key = getMonthKey(u.createdAt);
    if (!usersByMonth[key]) usersByMonth[key] = { renters: 0, owners: 0 };
    if (u.role === UserRole.RENTER) usersByMonth[key].renters++;
    if (u.role === UserRole.VEHICLE_OWNER) usersByMonth[key].owners++;
  }
  const userGrowthData = Object.entries(usersByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([key, counts]) => ({ month: getMonthLabel(key), ...counts }));

  // Revenue by month (last 6 months)
  const revenueData = Object.entries(revenueByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, amount]) => ({ month: getMonthLabel(key), revenue: amount }));

  // Top vehicles by booking count
  const topVehicles = Object.entries(bookingsByVehicle)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([vehicleId, count]) => {
      const v = vehicles.find((v) => String(v.vehicleId) === vehicleId);
      return {
        name: v ? `${v.make} ${v.model}` : `Vehicle #${vehicleId}`,
        bookings: count,
        vehicleId: Number(vehicleId),
      };
    });

  // Average rating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
      : 0;

  // Verification funnel
  const verificationStatusMap = {
    APPROVED: verifications.filter((v) => v.status === "APPROVED").length,
    PENDING:  verifications.filter((v) => v.status === "PENDING").length,
    REJECTED: verifications.filter((v) => v.status === "REJECTED").length,
  };

  // User role distribution
  const userRoleData = [
    { name: "Renters", value: renters.length },
    { name: "Owners",  value: owners.length },
    { name: "Admins",  value: admins.length },
  ].filter((d) => d.value > 0);

  return {
    totalUsers: users.length,
    totalRenters: renters.length,
    totalOwners: owners.length,
    totalVehicles: vehicles.length,
    listedVehicles: vehicles.filter((v) => v.isListed).length,
    totalBookings: bookings.length,
    completedBookings: bookingStatusMap["COMPLETED"] ?? 0,
    pendingBookings: bookingStatusMap["PENDING"] ?? 0,
    totalRevenue,
    avgRating,
    totalReviews: reviews.length,
    verificationStatusMap,
    bookingStatusData,
    userGrowthData,
    revenueData,
    topVehicles,
    userRoleData,
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-6 lg:p-8 animate-pulse">
      <div className="h-8 bg-muted rounded w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 h-80 bg-muted rounded-xl" />
        <div className="lg:col-span-2 h-80 bg-muted rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 h-72 bg-muted rounded-xl" />
        <div className="lg:col-span-2 h-72 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="card-hover border border-border shadow-none">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground leading-none mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`rounded-xl p-2.5 ${bg} shrink-0`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const ChartTooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "13px",
};

// ─── Main Analytics Component ─────────────────────────────────────────────────

export function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Raw data
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<ReviewResponseDTO[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [u, v, b, r, ver] = await Promise.all([
        getAllUsers(0, 10),
        getAllVehiclesAdmin(0, 10),
        getAllBookingsAdmin(0, 10),
        getAllReviewsAdmin(0, 10),
        getAllVerificationRequests(0, 10),
      ]);
      setUsers(u.data);
      setVehicles(v.data);
      setBookings(b.data);
      setReviews(r.data);
      setVerifications(ver.data);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message ?? "Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (isLoading) return <AnalyticsSkeleton />;

  if (error) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchAll} variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    );
  }

  const data = computeAnalytics(users, vehicles, bookings, reviews, verifications);
  const completionRate = data.totalBookings > 0
    ? Math.round((data.completedBookings / data.totalBookings) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live platform-wide performance overview
            {lastRefreshed && (
              <span className="ml-2 text-xs opacity-60">
                · Updated {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAll}
          disabled={isLoading}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Users"
          value={data.totalUsers}
          sub={`${data.totalRenters} renters · ${data.totalOwners} owners`}
          icon={Users}
          color="text-primary"
          bg="bg-primary/8"
        />
        <KpiCard
          label="Total Vehicles"
          value={data.totalVehicles}
          sub={`${data.listedVehicles} listed`}
          icon={Car}
          color="text-secondary"
          bg="bg-secondary/8"
        />
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          sub={`${data.completedBookings} completed bookings`}
          icon={Tag}
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <KpiCard
          label="Avg Rating"
          value={data.avgRating > 0 ? `${data.avgRating.toFixed(1)} ★` : "N/A"}
          sub={`${data.totalReviews} total reviews`}
          icon={Star}
          color="text-amber-500"
          bg="bg-amber-50 dark:bg-amber-900/20"
        />
      </div>

      {/* ── Secondary KPIs ────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Bookings"
          value={data.totalBookings}
          sub={`${data.pendingBookings} pending`}
          icon={FileCheck}
          color="text-primary"
          bg="bg-primary/8"
        />
        <KpiCard
          label="Completion Rate"
          value={`${completionRate}%`}
          sub={`${data.completedBookings} of ${data.totalBookings} bookings`}
          icon={CheckCircle}
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <KpiCard
          label="Verifications"
          value={data.verificationStatusMap.APPROVED}
          sub={`${data.verificationStatusMap.PENDING} pending review`}
          icon={ShieldCheck}
          color="text-amber-500"
          bg="bg-amber-50 dark:bg-amber-900/20"
        />
        <KpiCard
          label="Active Vehicles"
          value={vehicles.filter((v) => v.isAvailable).length}
          sub={`of ${data.totalVehicles} total vehicles`}
          icon={Activity}
          color="text-secondary"
          bg="bg-secondary/8"
        />
      </div>

      {/* ── Row 1: User Growth + Booking Status ─────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* User growth line chart */}
        <Card className="lg:col-span-3 border border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">User Growth</CardTitle>
            <CardDescription className="text-xs">New users registered per month</CardDescription>
          </CardHeader>
          <CardContent>
            {data.userGrowthData.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
                No user registration data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.userGrowthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={ChartTooltipStyle} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="renters"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-primary)" }}
                    name="Renters"
                  />
                  <Line
                    type="monotone"
                    dataKey="owners"
                    stroke="var(--color-secondary)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-secondary)" }}
                    name="Owners"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Booking status pie */}
        <Card className="lg:col-span-2 border border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Booking Status</CardTitle>
            <CardDescription className="text-xs">Distribution across all {data.totalBookings} bookings</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {data.bookingStatusData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                No booking data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.bookingStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.bookingStatusData.map((entry, i) => (
                      <Cell key={i} fill={BOOKING_STATUS_COLORS[entry.rawStatus] ?? "var(--color-muted)"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, _, props) => [`${v} bookings`, props.payload.name]}
                    contentStyle={ChartTooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            <div className="flex flex-col gap-2 w-full mt-2">
              {data.bookingStatusData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: BOOKING_STATUS_COLORS[entry.rawStatus] ?? "var(--color-muted)" }}
                    />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{entry.value}</span>
                    <span className="text-xs text-muted-foreground">
                      ({data.totalBookings > 0 ? Math.round((entry.value / data.totalBookings) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Revenue + Top Vehicles ────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Revenue bar chart */}
        <Card className="lg:col-span-3 border border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue by Month</CardTitle>
            <CardDescription className="text-xs">From completed bookings only</CardDescription>
          </CardHeader>
          <CardContent>
            {data.revenueData.length === 0 ? (
              <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">
                No completed booking revenue data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                    tickFormatter={(v) => formatCurrency(v)}
                    width={70}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                    contentStyle={ChartTooltipStyle}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top vehicles table */}
        <Card className="lg:col-span-2 border border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Vehicles</CardTitle>
            <CardDescription className="text-xs">By number of bookings received</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topVehicles.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                No vehicle booking data available
              </div>
            ) : (
              <div className="space-y-3">
                {data.topVehicles.map((v, i) => (
                  <div key={v.vehicleId} className="flex items-center gap-3 text-sm">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 font-medium text-foreground truncate">{v.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-semibold">{v.bookings}</span>
                      <span className="text-xs text-muted-foreground">bookings</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: User Distribution + Verification Funnel ───────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* User role distribution */}
        <Card className="lg:col-span-2 border border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">User Distribution</CardTitle>
            <CardDescription className="text-xs">Breakdown by role</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data.userRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.userRoleData.map((_, i) => (
                    <Cell key={i} fill={USER_ROLE_COLORS[i % USER_ROLE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, _, props) => [`${v} users`, props.payload.name]}
                  contentStyle={ChartTooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-col gap-2 w-full mt-2">
              {data.userRoleData.map((entry, i) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: USER_ROLE_COLORS[i] }}
                    />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{entry.value}</span>
                    <span className="text-xs text-muted-foreground">
                      ({data.totalUsers > 0 ? Math.round((entry.value / data.totalUsers) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verification funnel */}
        <Card className="lg:col-span-3 border border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Verification Funnel</CardTitle>
            <CardDescription className="text-xs">
              KYC status across {Object.values(data.verificationStatusMap).reduce((a, b) => a + b, 0)} requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {[
                { label: "Approved", key: "APPROVED" as const, color: "#22c55e", bg: "bg-emerald-500", icon: CheckCircle },
                { label: "Pending",  key: "PENDING"  as const, color: "#f59e0b", bg: "bg-amber-500",   icon: Clock },
                { label: "Rejected", key: "REJECTED" as const, color: "#ef4444", bg: "bg-destructive",  icon: XCircle },
              ].map(({ label, key, color, bg, icon: Icon }) => {
                const count = data.verificationStatusMap[key];
                const total = Object.values(data.verificationStatusMap).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color }} />
                        <span className="font-medium">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{count}</span>
                        <span className="text-xs text-muted-foreground">({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${bg} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{data.verificationStatusMap.APPROVED}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Approved</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{data.verificationStatusMap.PENDING}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{data.verificationStatusMap.REJECTED}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}