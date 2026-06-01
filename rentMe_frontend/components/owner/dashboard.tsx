"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, CheckCircle2, DollarSign, Star, TrendingUp } from "lucide-react";
import { getMyVehiclesAsOwner } from "@/services/vehicle.service";
import { getMyBookingsAsOwner } from "@/services/booking.service";
import { useOwnerRating } from "@/hooks/useReviews";

const chartData = [
  { name: "Jan", bookings: 4, earnings: 2400 },
  { name: "Feb", bookings: 3, earnings: 1800 },
  { name: "Mar", bookings: 6, earnings: 3200 },
  { name: "Apr", bookings: 5, earnings: 2900 },
];

export function OwnerDashboard() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const [vehiclesList, bookingsList] = await Promise.all([
          getMyVehiclesAsOwner(),
          getMyBookingsAsOwner(),
        ]);
        setVehicles(vehiclesList);
        setBookings(bookingsList);
        if (vehiclesList.length > 0) {
          setOwnerId(vehiclesList[0].vehicleOwnerId);
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics", err);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const { rating: ownerRating } = useOwnerRating(ownerId || 0);

  const activeBookingsCount = bookings.filter(
    (b) => b.status === "APPROVED" || b.status === "ONGOING"
  ).length;

  const totalEarnings = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);

  const avgRatingVal = ownerRating ? ownerRating.averageRating.toFixed(1) : "0.0";
  const totalReviewsCount = ownerRating ? ownerRating.totalReviews : 0;

  const STATS = [
    {
      label: "Total Listings",
      value: statsLoading ? "..." : String(vehicles.length),
      icon: Car,
      color: "text-primary",
      bg: "bg-primary/8",
      trend: "Listed vehicles",
    },
    {
      label: "Active Bookings",
      value: statsLoading ? "..." : String(activeBookingsCount),
      icon: CheckCircle2,
      color: "text-secondary",
      bg: "bg-secondary/8",
      trend: `${bookings.filter((b) => b.status === "PENDING").length} pending review`,
    },
    {
      label: "Total Earnings",
      value: statsLoading ? "..." : `$${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "From completed rentals",
    },
    {
      label: "Avg Rating",
      value: statsLoading ? "..." : avgRatingVal,
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-50",
      trend: `Based on ${totalReviewsCount} ${totalReviewsCount === 1 ? 'review' : 'reviews'}`,
    },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your vehicle rental performance at a glance
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, color, bg, trend }) => (
          <Card key={label} className="card-hover border border-border shadow-none">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-3xl font-bold text-foreground leading-none">{value}</p>
                  <p className="text-xs text-muted-foreground pt-1">{trend}</p>
                </div>
                <div className={`rounded-xl p-2.5 ${bg} shrink-0`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Bookings & Earnings Trend</CardTitle>
            <div className="flex items-center gap-1 text-xs text-secondary">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+24% overall</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              barCategoryGap="35%"
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              />
              <Bar dataKey="bookings" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Bookings" />
              <Bar dataKey="earnings" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} name="Earnings ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}