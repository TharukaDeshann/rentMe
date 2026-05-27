"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dummyVehicles } from "@/lib/dummy-data"

export function MyVehicles() {
  const ownerVehicles = dummyVehicles.filter((v) => v.owner.id === "owner-1")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)

  const handleEditClick = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setShowEditDialog(true)
  }

  const handleAddClick = () => {
    setShowAddDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Vehicles</h2>
        <Button className="gap-2" onClick={handleAddClick}>
          <Plus className="h-4 w-4" />
          Add New Vehicle
        </Button>
      </div>

      {/* Vehicles Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-semibold">Vehicle</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">License Plate</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Daily Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ownerVehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={vehicle.image_url || "/placeholder.svg"}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-xs text-muted-foreground">{vehicle.year}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{vehicle.license_plate}</td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      vehicle.availability
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }
                  >
                    {vehicle.availability ? "Available" : "Rented"}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-medium">${vehicle.daily_price}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEditClick(vehicle)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>

          {selectedVehicle && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-make">Make</Label>
                  <Input id="edit-make" defaultValue={selectedVehicle.make} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-model">Model</Label>
                  <Input id="edit-model" defaultValue={selectedVehicle.model} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Input id="edit-year" type="number" defaultValue={selectedVehicle.year} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select defaultValue={selectedVehicle.type}>
                    <SelectTrigger id="edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Truck">Truck</SelectItem>
                      <SelectItem value="Van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-license">License Plate</Label>
                  <Input id="edit-license" defaultValue={selectedVehicle.license_plate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input id="edit-capacity" type="number" defaultValue={selectedVehicle.capacity} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price">Daily Price ($)</Label>
                <Input id="edit-price" type="number" step="0.01" defaultValue={selectedVehicle.daily_price} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Image URL</Label>
                <Input id="edit-image" defaultValue={selectedVehicle.image_url} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-availability">Availability</Label>
                <Select defaultValue={selectedVehicle.availability ? "available" : "rented"}>
                  <SelectTrigger id="edit-availability">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowEditDialog(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-make">Make</Label>
                <Input id="add-make" placeholder="e.g., Toyota" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-model">Model</Label>
                <Input id="add-model" placeholder="e.g., Camry" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-year">Year</Label>
                <Input id="add-year" type="number" placeholder="2024" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-type">Type</Label>
                <Select>
                  <SelectTrigger id="add-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-license">License Plate</Label>
                <Input id="add-license" placeholder="ABC-1234" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-capacity">Capacity</Label>
                <Input id="add-capacity" type="number" placeholder="5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-price">Daily Price ($)</Label>
              <Input id="add-price" type="number" step="0.01" placeholder="49.99" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-image">Image URL</Label>
              <Input id="add-image" placeholder="Enter image URL" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-location">Pickup Location</Label>
              <Input id="add-location" placeholder="Downtown Center" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>Add Vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
