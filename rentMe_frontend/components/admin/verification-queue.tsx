"use client"

import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dummyVerificationRequests } from "@/lib/dummy-data"

export function VerificationQueue() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Verification Queue</h2>

      {/* Verification Requests Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-semibold">Owner Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Age</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">License</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">NIC</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dummyVerificationRequests.map((request) => (
              <tr key={request.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={request.owner.profile_picture || "/placeholder.svg"}
                      alt={request.owner.full_name}
                      onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{request.owner.full_name}</p>
                      <p className="text-xs text-muted-foreground">{request.owner.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{request.owner.age}</td>
                <td className="px-4 py-3">
                  <div className="h-8 w-8 rounded border border-border overflow-hidden bg-muted">
                    <img
                      src={request.driver_license_image || "/placeholder.svg"}
                      alt="DL"
                      onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-8 w-8 rounded border border-border overflow-hidden bg-muted">
                    <img
                      src={request.nic_image || "/placeholder.svg"}
                      alt="NIC"
                      onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className="bg-yellow-500 text-yellow-950">Pending</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1 bg-secondary hover:bg-secondary/90">
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1">
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
