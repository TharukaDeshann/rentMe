"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, CheckCircle2, DollarSign, Star, TrendingUp } from "lucide-react";

const chartData = [
  { name: "Jan", bookings: 4, earnings: 2400 },
  { name: "Feb", bookings: 3, earnings: 1800 },
  { name: "Mar", bookings: 6, earnings: 3200 },
  { name: "Apr", bookings: 5, earnings: 2900 },
];

const STATS = [
  {
    label: "Total Listings",
    value: "4",
    icon: Car,
    color: "text-primary",
    bg: "bg-primary/8",
    trend: "+1 this month",
  },
  {
    label: "Active Bookings",
    value: "2",
    icon: CheckCircle2,
    color: "text-secondary",
    bg: "bg-secondary/8",
    trend: "2 pending review",
  },
  {
    label: "Total Earnings",
    value: "$12.4K",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    trend: "+18% vs last month",
  },
  {
    label: "Avg Rating",
    value: "4.9",
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-50",
    trend: "Based on 38 reviews",
  },
];

export function OwnerDashboard() {
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