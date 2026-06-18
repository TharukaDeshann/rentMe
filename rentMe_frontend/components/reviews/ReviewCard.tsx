import React, { useState } from "react";
import { Trash2, Shield, Calendar } from "lucide-react";
import { useAuth } from "@/contexts";
import { ReviewResponseDTO } from "@/types/review";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRatingDisplay } from "./StarRatingDisplay";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { useDeleteReview } from "@/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ReviewCardProps {
  review: ReviewResponseDTO;
  onDeleted?: (reviewId: number) => void;
}

export function ReviewCard({ review, onDeleted }: ReviewCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { deleteReview, loading: isDeleting } = useDeleteReview();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Security check: Only the renter who wrote it OR an admin can delete
  const canDelete =
    user &&
    (user.userId === review.reviewerId || user.role === "ADMIN");

  const handleDelete = async () => {
    try {
      await deleteReview(review.reviewId);
      toast({
        title: "Review deleted",
        description: "Your review was deleted successfully.",
      });
      setDeleteOpen(false);
      if (onDeleted) {
        onDeleted(review.reviewId);
      }
    } catch (err: any) {
      toast({
        title: "Deletion failed",
        description: err.message || "Failed to delete review.",
        variant: "destructive",
      });
    }
  };

  const formattedDate = () => {
    try {
      return format(new Date(review.createdAt), "PPP");
    } catch {
      return review.createdAt;
    }
  };

  const reviewerInitials = review.reviewerName
    ? review.reviewerName.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="py-5 border-b border-border last:border-b-0 space-y-2">
      <div className="flex items-start justify-between gap-4">
        {/* Reviewer Meta */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {reviewerInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              {review.reviewerName}
              {review.reviewerId === user?.userId && (
                <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  You
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <StarRatingDisplay rating={review.rating} size={12} />
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate()}
              </span>
            </div>
          </div>
        </div>

        {/* Delete action */}
        {canDelete && (
          <button
            onClick={() => setDeleteOpen(true)}
            className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
            title="Delete Review"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Review Comment */}
      {review.comment && (
        <p className="text-sm text-muted-foreground pl-12 leading-relaxed whitespace-pre-line">
          {review.comment}
        </p>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Review"
        description="Are you sure you want to delete this review? This will recompute the vehicle's average rating immediately. This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}

export default ReviewCard;
