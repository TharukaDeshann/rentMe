"use client";

import { Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { dummyVerificationRequests } from "@/lib/dummy-data";

export function VerificationQueue() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Verification Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve owner identity documents
          </p>
        </div>
        <Badge className="status-pending gap-1.5 px-3 py-1.5 text-sm">
          <Clock className="h-3.5 w-3.5" />
          {dummyVerificationRequests.length} pending
        </Badge>
      </div>

      {/* Cards layout — more scannable than a dense table */}
      <div className="grid gap-4">
        {dummyVerificationRequests.map((req) => (
          <Card key={req.id} className="border border-border shadow-none">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start gap-4">
                {/* Owner info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {req.owner.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{req.owner.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{req.owner.email}</p>
                    <p className="text-xs text-muted-foreground">Age: {req.owner.age}</p>
                  </div>
                </div>

                {/* Document thumbnails */}
                <div className="flex items-center gap-3">
                  <div className="space-y-1 text-center">
                    <div className="h-16 w-24 overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center">
                      <img
                        src={req.driver_license_image || "/placeholder.svg"}
                        alt="Driver License"
                        onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">License</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <div className="h-16 w-24 overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center">
                      <img
                        src={req.nic_image || "/placeholder.svg"}
                        alt="NIC"
                        onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">NIC</p>
                  </div>
                </div>

                {/* Status + actions */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <Badge className="status-pending">Pending Review</Badge>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1.5">
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {dummyVerificationRequests.length === 0 && (
          <Card className="border border-border shadow-none">
            <CardContent className="py-16 text-center">
              <Check className="h-10 w-10 mx-auto text-secondary mb-3" />
              <p className="font-semibold text-foreground">All clear!</p>
              <p className="text-sm text-muted-foreground mt-1">No pending verification requests.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}