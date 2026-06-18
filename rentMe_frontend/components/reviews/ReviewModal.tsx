import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { StarRatingInput } from "./StarRatingInput";
import { useCreateReview } from "@/hooks/useReviews";
import { Booking } from "@/types/booking";
import { useToast } from "@/hooks/use-toast";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onSuccess?: () => void;
}

export function ReviewModal({
  open,
  onOpenChange,
  booking,
  onSuccess,
}: ReviewModalProps) {
  const { createReview, loading } = useCreateReview();
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmitError(null);

    // Frontend validations
    if (rating === 0) {
      setValidationError("Please select a rating of 1 to 5 stars.");
      return;
    }

    try {
      await createReview({
        bookingId: booking.bookingId,
        rating,
        comment: comment.trim() || undefined,
      });

      toast({
        title: "Review Submitted",
        description: "Thank you! Your review has been saved.",
      });

      // Clear form
      setRating(0);
      setComment("");
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      let friendlyMsg = "";
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        if (status === 422) {
          friendlyMsg = "Booking must be completed to review";
        } else if (status === 403) {
          friendlyMsg = "You are not allowed to review this booking";
        } else if (status === 409) {
          friendlyMsg = "You already reviewed this booking";
        } else if (status === 400) {
          friendlyMsg = err.response.data?.message || "Validation error. Please check your inputs.";
        } else {
          friendlyMsg = err.response.data?.message || "Failed to submit review.";
        }
      } else {
        friendlyMsg = err.message || "An unexpected error occurred.";
      }
      setSubmitError(friendlyMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Leave a Review</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Rate your rental experience for the {booking.vehicleMake}{" "}
            {booking.vehicleModel}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Star Input */}
          <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-lg border border-border space-y-2">
            <span className="text-sm font-medium text-foreground">Your Rating</span>
            <StarRatingInput
              value={rating}
              onChange={setRating}
              size={32}
              disabled={loading}
            />
          </div>

          {/* Comment input */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Comment (optional)</label>
            <Textarea
              placeholder="Tell us about the vehicle, pickup, dropoff, or owner..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
              maxLength={2000}
              rows={4}
            />
            <div className="text-right text-[10px] text-muted-foreground">
              {comment.length} / 2000 characters
            </div>
          </div>

          {/* Error notifications */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{validationError}</AlertDescription>
            </Alert>
          )}

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{submitError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewModal;
