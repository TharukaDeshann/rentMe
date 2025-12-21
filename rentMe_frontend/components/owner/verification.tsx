"use client"

import { AlertCircle, CheckCircle2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { dummyVerificationRequests } from "@/lib/dummy-data"

export function Verification() {
  const verificationRequest = dummyVerificationRequests[0]
  const isVerified = verificationRequest.status === "verified"

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Identity Verification (KYC)</h2>

      {!isVerified && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Your verification is pending. Complete it to unlock full features.
          </AlertDescription>
        </Alert>
      )}

      {/* Verification Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Verification Status</CardTitle>
            <Badge className={isVerified ? "bg-secondary text-secondary-foreground" : "bg-yellow-500 text-yellow-950"}>
              {isVerified ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </>
              ) : (
                <>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Pending Review
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Driver License */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Driver License</label>
              <div className="relative h-40 w-full overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/50">
                <img
                  src={verificationRequest.driver_license_image || "/placeholder.svg"}
                  alt="Driver License"
                  onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                  className="h-full w-full object-cover"
                />
              </div>
              <Badge variant="outline" className="w-full justify-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Uploaded
              </Badge>
            </div>

            {/* NIC */}
            <div className="space-y-2">
              <label className="text-sm font-medium">National ID Card (NIC)</label>
              <div className="relative h-40 w-full overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/50">
                <img
                  src={verificationRequest.nic_image || "/placeholder.svg"}
                  alt="NIC"
                  onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                  className="h-full w-full object-cover"
                />
              </div>
              <Badge variant="outline" className="w-full justify-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Uploaded
              </Badge>
            </div>
          </div>

          {!isVerified && (
            <Button className="w-full gap-2 mt-4">
              <Upload className="h-4 w-4" />
              Re-submit Documents
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
