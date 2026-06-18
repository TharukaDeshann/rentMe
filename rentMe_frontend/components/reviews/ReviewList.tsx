import React from "react";
import { MessageSquare } from "lucide-react";
import { ReviewResponseDTO } from "@/types/review";
import { ReviewCard } from "./ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewListProps {
  reviews: ReviewResponseDTO[];
  loading?: boolean;
  onReviewDeleted?: (reviewId: number) => void;
}

export function ReviewList({
  reviews,
  loading = false,
  onReviewDeleted,
}: ReviewListProps) {
  if (loading) {
    return (
      <div className="space-y-4 divide-y divide-border">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="py-5 space-y-3 first:pt-0">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-4 w-11/12 ml-12" />
            <Skeleton className="h-4 w-3/4 ml-12" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center bg-muted/20 border border-dashed border-border rounded-xl">
        <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-60" />
        <h4 className="font-semibold text-sm text-foreground">No Reviews Yet</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto">
          Renters who complete a booking for this vehicle can submit reviews here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {reviews.map((review) => (
        <ReviewCard
          key={review.reviewId}
          review={review}
          onDeleted={onReviewDeleted}
        />
      ))}
    </div>
  );
}

export default ReviewList;
