"use client";

import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, DollarSign, Star } from "lucide-react";

const userGrowthData = [
  { month: "Jan", renters: 120, owners: 45 },
  { month: "Feb", renters: 180, owners: 62 },
  { month: "Mar", renters: 220, owners: 85 },
  { month: "Apr", renters: 280, owners: 110 },
  { month: "May", renters: 350, owners: 140 },
];

const bookingVolumeData = [
  { name: "Completed", value: 65 },
  { name: "Pending",   value: 20 },
  { name: "Cancelled", value: 15 },
];

const PIE_COLORS = ["var(--color-secondary)", "var(--color-chart-3)", "var(--color-destructive)"];

const STATS = [
  { label: "Total Users",    value: "630", icon: Users,       color: "text-primary",   bg: "bg-primary/8" },
  { label: "Total Vehicles", value: "245", icon: Car,         color: "text-secondary", bg: "bg-secondary/8" },
  { label: "Total Revenue",  value: "$58.5K", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg Rating",     value: "4.7★",   icon: Star,       color: "text-amber-500",   bg: "bg-amber-50" },
];

export function Analytics() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide performance overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="card-hover border border-border shadow-none">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-3xl font-bold text-foreground leading-none mt-0.5">{value}</p>
                </div>
                <div className={`rounded-xl p-2.5 ${bg} shrink-0`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* User growth line chart */}
        <Card className="lg:col-span-3 border border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={userGrowthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                />
                <Tooltip
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
          </CardContent>
        </Card>

        {/* Booking volume pie chart */}
        <Card className="lg:col-span-2 border border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Booking Volume</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={bookingVolumeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {bookingVolumeData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v}%`, ""]}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-col gap-2 w-full mt-2">
              {bookingVolumeData.map(({ name, value }, i) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: PIE_COLORS[i] }}
                    />
                    <span className="text-muted-foreground">{name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}