"use client"

import { useState } from "react"
import { Search, MapPin, Users, DollarSign, Star, Calendar, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dummyVehicles } from "@/lib/dummy-data"

interface BrowseVehiclesProps {
  onViewDetails: (vehicleId: string) => void
}

export function BrowseVehicles({ onViewDetails }: BrowseVehiclesProps) {
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [priceRange, setPriceRange] = useState(100)
  const [view, setView] = useState<"list" | "map">("list")

  const filteredVehicles = dummyVehicles.filter((vehicle) => {
    const matchesLocation =
      !searchLocation || vehicle.location.name.toLowerCase().includes(searchLocation.toLowerCase())
    const matchesType = !selectedType || vehicle.type === selectedType
    const matchesPrice = vehicle.daily_price <= priceRange
    return matchesLocation && matchesType && matchesPrice
  })

  const vehicleTypes = ["Sedan", "SUV", "Truck", "Van"]

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="date" className="pl-10" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="date" className="pl-10" />
            </div>
            <Button className="w-full gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter & View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {vehicleTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(selectedType === type ? "" : type)}
            >
              {type}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>
            List
          </Button>
          <Button variant={view === "map" ? "default" : "outline"} size="sm" onClick={() => setView("map")}>
            Map
          </Button>
        </div>
      </div>

      {/* Price Filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Daily Price Range</label>
              <span className="text-sm font-semibold text-primary">${priceRange}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* List View */}
      {view === "list" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden transition-all hover:shadow-lg">
                {/* Vehicle Image */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={vehicle.image_url}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                  <Badge className="absolute right-2 top-2 bg-secondary text-secondary-foreground">
                    {vehicle.type}
                  </Badge>
                </div>

                <CardContent className="space-y-3 pt-4">
                  {/* Vehicle Title */}
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-xs text-muted-foreground">{vehicle.year}</p>
                  </div>

                  {/* Info Row */}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{vehicle.capacity} Seats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${vehicle.daily_price} / day</span>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{vehicle.owner.full_name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{vehicle.owner.rating}</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => onViewDetails(vehicle.id)} className="gap-1">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">No vehicles found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Map View */}
      {view === "map" && (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="relative h-96 w-full rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="space-y-2 text-center">
                  <MapPinIcon className="mx-auto h-12 w-12 text-primary/50" />
                  <p className="text-sm text-muted-foreground">
                    {filteredVehicles.length} vehicles available in the area
                  </p>
                  <div className="grid auto-cols-max gap-2">
                    {filteredVehicles.slice(0, 3).map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="rounded-lg border border-border bg-card p-2 text-xs text-foreground"
                      >
                        {vehicle.make} {vehicle.model} • ${vehicle.daily_price}/day
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
