"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  MessageSquare,
  Star,
  Trash2,
  Search,
  RefreshCw,
  AlertTriangle,
  ThumbsUp,
  SlidersHorizontal,
  Calendar,
  X,
  User as UserIcon,
  Car
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import reviewService from "@/services/review.service";
import vehicleService from "@/services/vehicle.service";
import userService from "@/services/user.service";
import { ReviewResponseDTO, Vehicle, User } from "@/types";
import { StarRatingDisplay } from "@/components/reviews/StarRatingDisplay";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { format } from "date-fns";

// ─── Stat Card Component ──────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <Card className="border border-border shadow-none">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent}`}>
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main Admin Reviews Page ─────────────────────────────────────────────────

export default function AdminReviewsPage() {
  const { toast } = useToast();

  const [reviews, setReviews] = useState<ReviewResponseDTO[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState("all");
  const [selectedOwner, setSelectedOwner] = useState("all");

  // Deletion States
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewResponseDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch All Data ────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch all reviews (Admin endpoint)
      const reviewsData = await reviewService.getAllReviewsAdmin();
      
      // 2. Sort reviews: newest first
      reviewsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(reviewsData);

      // 3. Fetch auxiliary mapping lists
      const [vehiclesData, usersData] = await Promise.all([
        vehicleService.getAvailableVehicles().catch((err) => {
          console.error("Failed to load vehicles metadata", err);
          return [] as Vehicle[];
        }),
        userService.getAllUsers().catch((err) => {
          console.error("Failed to load users metadata", err);
          return [] as User[];
        })
      ]);

      setVehicles(vehiclesData);
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Mappings Helpers ──────────────────────────────────────────────────────

  const vehicleMap = useMemo(() => {
    const map = new Map<number, Vehicle>();
    vehicles.forEach((v) => map.set(v.vehicleId, v));
    return map;
  }, [vehicles]);

  const userMap = useMemo(() => {
    const map = new Map<number, User>();
    users.forEach((u) => map.set(u.userId, u));
    return map;
  }, [users]);

  // ─── Filter Dropdowns Population ───────────────────────────────────────────

  const uniqueVehicleOptions = useMemo(() => {
    const ids = Array.from(new Set(reviews.map((r) => r.vehicleId)));
    return ids.map((id) => {
      const v = vehicleMap.get(id);
      return {
        value: String(id),
        label: v ? `${v.make} ${v.model} (ID: #${id})` : `Vehicle #${id}`
      };
    });
  }, [reviews, vehicleMap]);

  const uniqueOwnerOptions = useMemo(() => {
    const ids = Array.from(new Set(reviews.map((r) => r.vehicleOwnerId)));
    return ids.map((id) => {
      const u = userMap.get(id);
      return {
        value: String(id),
        label: u ? `${u.fullName} (ID: #${id})` : `Owner #${id}`
      };
    });
  }, [reviews, userMap]);

  // ─── Filtering Logic ──────────────────────────────────────────────────────

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // 1. Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const commentMatch = r.comment?.toLowerCase().includes(q) || false;
        const reviewerMatch = r.reviewerName?.toLowerCase().includes(q) || false;
        
        const vehicleObj = vehicleMap.get(r.vehicleId);
        const vehicleMatch = vehicleObj
          ? `${vehicleObj.make} ${vehicleObj.model}`.toLowerCase().includes(q)
          : false;

        const ownerObj = userMap.get(r.vehicleOwnerId);
        const ownerMatch = ownerObj ? ownerObj.fullName.toLowerCase().includes(q) : false;

        if (!commentMatch && !reviewerMatch && !vehicleMatch && !ownerMatch) {
          return false;
        }
      }

      // 2. Rating Filter
      if (selectedRating !== "all") {
        if (r.rating !== parseInt(selectedRating)) {
          return false;
        }
      }

      // 3. Vehicle Filter
      if (selectedVehicle !== "all") {
        if (r.vehicleId !== parseInt(selectedVehicle)) {
          return false;
        }
      }

      // 4. Owner Filter
      if (selectedOwner !== "all") {
        if (r.vehicleOwnerId !== parseInt(selectedOwner)) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, searchQuery, selectedRating, selectedVehicle, selectedOwner, vehicleMap, userMap]);

  // ─── Metrics ───────────────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const positive = reviews.filter((r) => r.rating >= 4).length;
    const critical = reviews.filter((r) => r.rating <= 2).length;
    return { total, avg, positive, critical };
  }, [reviews]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedRating !== "all" ||
    selectedVehicle !== "all" ||
    selectedOwner !== "all";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedRating("all");
    setSelectedVehicle("all");
    setSelectedOwner("all");
  };

  // ─── Moderation Deletion Actions ──────────────────────────────────────────

  const triggerDeleteConfirm = (review: ReviewResponseDTO) => {
    setReviewToDelete(review);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      await reviewService.deleteReview(reviewToDelete.reviewId);
      toast({
        title: "Review Deleted Successfully",
        description: "The review has been deleted and ratings aggregates have been re-computed.",
      });
      // Remove from state list
      setReviews((prev) => prev.filter((r) => r.reviewId !== reviewToDelete.reviewId));
      setDeleteOpen(false);
      setReviewToDelete(null);
    } catch (err: any) {
      toast({
        title: "Deletion Failed",
        description: err.message || "Failed to moderate and delete review.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper date formatter
  const formatReviewDate = (isoString: string) => {
    try {
      return format(new Date(isoString), "PPP");
    } catch {
      return isoString;
    }
  };

  // Helper initials getter
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Reviews Moderation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor, filter, and moderate vehicle ratings and comments across the system
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={isLoading}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Reviews"
          value={metrics.total}
          icon={<MessageSquare className="h-4 w-4 text-primary" />}
          accent="bg-primary/10"
        />
        <StatCard
          label="Average Rating"
          value={metrics.total > 0 ? `${metrics.avg.toFixed(1)} / 5.0` : "0.0"}
          icon={<Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
          accent="bg-amber-50 dark:bg-amber-950/20"
        />
        <StatCard
          label="Positive Reviews (4-5★)"
          value={metrics.positive}
          icon={<ThumbsUp className="h-4 w-4 text-emerald-600" />}
          accent="bg-emerald-50 dark:bg-emerald-950/20"
        />
        <StatCard
          label="Critical Reviews (1-2★)"
          value={metrics.critical}
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          accent="bg-destructive/10"
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search & Filters Card */}
      <Card className="border border-border shadow-none">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            Filters Panel
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search Query */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reviewer or comment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            {/* Rating Filter */}
            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            {/* Vehicle Filter */}
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Vehicles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {uniqueVehicleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Owner Filter */}
            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Owners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                {uniqueOwnerOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filter Clear CTA */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-muted-foreground hover:text-foreground h-8 gap-1.5"
              >
                <X className="h-3 w-3" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews Table Card */}
      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-3.5">Reviewer</th>
                  <th className="px-6 py-3.5">Vehicle</th>
                  <th className="px-6 py-3.5">Owner</th>
                  <th className="px-6 py-3.5">Rating & Comment</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading reviews...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => {
                    const vehicle = vehicleMap.get(review.vehicleId);
                    const owner = userMap.get(review.vehicleOwnerId);
                    
                    return (
                      <tr key={review.reviewId} className="hover:bg-muted/30 transition-colors">
                        {/* Reviewer Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {getInitials(review.reviewerName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-foreground text-sm truncate max-w-[150px]">
                                {review.reviewerName}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">
                                ID: #{review.reviewerId}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Vehicle Details */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-foreground text-sm flex items-center gap-1">
                              <Car className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              {vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${review.vehicleId}`}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              ID: #{review.vehicleId}
                            </span>
                          </div>
                        </td>

                        {/* Owner Details */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-foreground text-sm flex items-center gap-1">
                              <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              {owner ? owner.fullName : `Owner #${review.vehicleOwnerId}`}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              ID: #{review.vehicleOwnerId}
                            </span>
                          </div>
                        </td>

                        {/* Rating & Review Comment */}
                        <td className="px-6 py-4 max-w-sm">
                          <div className="flex flex-col gap-1">
                            <StarRatingDisplay rating={review.rating} size={13} />
                            {review.comment ? (
                              <p className="text-xs text-muted-foreground leading-relaxed break-words whitespace-pre-line bg-muted/30 px-2 py-1.5 rounded border border-border/40 mt-1 max-h-[80px] overflow-y-auto">
                                "{review.comment}"
                              </p>
                            ) : (
                              <span className="text-xs text-muted-foreground/50 italic">
                                No comment provided
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Date Created */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {formatReviewDate(review.createdAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            onClick={() => triggerDeleteConfirm(review)}
                            title="Moderate and delete review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <MessageSquare className="h-10 w-10 text-muted-foreground/60 opacity-60" />
                        <div>
                          <p className="font-semibold text-foreground text-sm">No Reviews Found</p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                            {hasActiveFilters
                              ? "Try adjusting or clearing your filters to see more results."
                              : "No vehicle reviews are registered in the system."}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Deletion Confirm Modal */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        title="Moderate Review"
        description={
          reviewToDelete && (
            <div className="space-y-3">
              <p>
                Are you sure you want to delete this review? This action is permanent and will moderate/remove the review from all public vehicle and owner profiles.
              </p>
              <div className="p-3 bg-muted rounded border text-xs space-y-1">
                <p><strong>Reviewer:</strong> {reviewToDelete.reviewerName}</p>
                <p><strong>Rating:</strong> {reviewToDelete.rating}★</p>
                {reviewToDelete.comment && (
                  <p className="mt-1.5 italic text-muted-foreground">
                    "{reviewToDelete.comment}"
                  </p>
                )}
              </div>
            </div>
          )
        }
        isLoading={isDeleting}
        confirmText="Confirm Delete"
      />
    </div>
  );
}
