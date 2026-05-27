"use client"

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Car, DollarSign, TrendingUp } from "lucide-react"

const userGrowthData = [
  { month: "Jan", renters: 120, owners: 45 },
  { month: "Feb", renters: 180, owners: 62 },
  { month: "Mar", renters: 220, owners: 85 },
  { month: "Apr", renters: 280, owners: 110 },
  { month: "May", renters: 350, owners: 140 },
]

const bookingVolumeData = [
  { name: "Completed", value: 65, fill: "#10b981" },
  { name: "Pending", value: 20, fill: "#f59e0b" },
  { name: "Cancelled", value: 15, fill: "#ef4444" },
]

export function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">630</p>
              </div>
              <Users className="h-12 w-12 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
                <p className="text-3xl font-bold">245</p>
              </div>
              <Car className="h-12 w-12 text-secondary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">$58.5K</p>
              </div>
              <DollarSign className="h-12 w-12 text-accent/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-3xl font-bold">4.7★</p>
              </div>
              <TrendingUp className="h-12 w-12 text-yellow-400/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>User Growth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
              <Legend />
              <Line type="monotone" dataKey="renters" stroke="var(--color-primary)" strokeWidth={2} />
              <Line type="monotone" dataKey="owners" stroke="var(--color-secondary)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Booking Status Distribution */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Booking Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingVolumeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {bookingVolumeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
