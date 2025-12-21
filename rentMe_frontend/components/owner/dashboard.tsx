"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Car, CheckCircle2, DollarSign } from "lucide-react"

const statsData = [
  { name: "Jan", bookings: 4, earnings: 2400 },
  { name: "Feb", bookings: 3, earnings: 1800 },
  { name: "Mar", bookings: 6, earnings: 3200 },
  { name: "Apr", bookings: 5, earnings: 2900 },
]

export function OwnerDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Listings</p>
                <p className="text-3xl font-bold">4</p>
              </div>
              <Car className="h-12 w-12 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Bookings</p>
                <p className="text-3xl font-bold">2</p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-secondary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold">$12.4K</p>
              </div>
              <DollarSign className="h-12 w-12 text-accent/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-3xl font-bold">4.9★</p>
              </div>
              <TrendingUp className="h-12 w-12 text-yellow-400/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Bookings & Earnings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
              <Legend />
              <Bar dataKey="bookings" fill="var(--color-primary)" />
              <Bar dataKey="earnings" fill="var(--color-secondary)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
