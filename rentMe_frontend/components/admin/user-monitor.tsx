"use client"

import { Search, MoreVertical, Shield, Ban, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dummyUsers } from "@/lib/dummy-data"

export function UserMonitor() {
  const allUsers = [
    ...dummyUsers.renters.map((u) => ({ ...u, role: "Renter", status: "Active" })),
    ...dummyUsers.owners.map((u) => ({ ...u, role: "Owner", status: "Active" })),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Monitor</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage and monitor all platform users</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Renters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyUsers.renters.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Owners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyUsers.owners.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified Owners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyUsers.owners.filter((o) => o.isVerified).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search users by name or email..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* User Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="renters">Renters</TabsTrigger>
          <TabsTrigger value="owners">Owners</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Rating</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.profile_picture || "/placeholder.svg"}
                              alt={user.full_name}
                              onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {user.full_name}
                                {user.role === "Owner" && (user as any).isVerified && (
                                  <Shield className="h-4 w-4 text-secondary" />
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{user.role}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{user.rating}</span>
                            <span className="text-xs text-muted-foreground">/ 5.0</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="bg-secondary text-secondary-foreground">{user.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renters" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Rating</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Total Bookings</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dummyUsers.renters.map((renter) => (
                      <tr key={renter.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={renter.profile_picture || "/placeholder.svg"}
                              alt={renter.full_name}
                              onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium">{renter.full_name}</p>
                              <p className="text-xs text-muted-foreground">{renter.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">{renter.rating}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">3 bookings</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm">
                            View Profile
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owners" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Verification</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Vehicles</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Rating</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dummyUsers.owners.map((owner) => (
                      <tr key={owner.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={owner.profile_picture || "/placeholder.svg"}
                              alt={owner.full_name}
                              onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium">{owner.full_name}</p>
                              <p className="text-xs text-muted-foreground">{owner.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {owner.isVerified ? (
                            <Badge className="gap-1 bg-secondary text-secondary-foreground">
                              <Shield className="h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">2 vehicles</Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">{owner.rating}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm">
                            View Profile
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
