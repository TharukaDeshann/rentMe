"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Whether the confirm button should use destructive styling */
  destructive?: boolean;
  /** If true, shows a required textarea for rejection reason */
  requiresReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  isLoading?: boolean;
  onConfirm: (reason?: string) => void;
}

/**
 * Reusable confirm dialog — wraps AlertDialog with an optional
 * rejection-reason textarea for the admin reject action.
 *
 * Usage:
 *   <ConfirmActionDialog
 *     open={showReject}
 *     onOpenChange={setShowReject}
 *     title="Reject verification request?"
 *     requiresReason
 *     destructive
 *     onConfirm={(reason) => handleReject(requestId, reason!)}
 *   />
 */
export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  requiresReason = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Provide a clear reason...",
  isLoading = false,
  onConfirm,
}: ConfirmActionDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (requiresReason && !reason.trim()) return;
    onConfirm(requiresReason ? reason.trim() : undefined);
  };

  const canConfirm = !requiresReason || reason.trim().length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {destructive && (
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {requiresReason && (
          <div className="space-y-2 mt-2">
            <Label htmlFor="confirm-reason" className="text-sm font-medium">
              {reasonLabel}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="confirm-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={3}
              className="resize-none text-sm"
            />
            {reason.trim().length === 0 && (
              <p className="text-xs text-destructive">
                A reason is required before rejecting.
              </p>
            )}
          </div>
        )}

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className={
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
