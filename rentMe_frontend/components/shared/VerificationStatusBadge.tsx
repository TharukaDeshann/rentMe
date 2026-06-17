"use client";

import { CheckCircle2, Clock, XCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerificationStatus } from "@/types/document";
import { cn } from "@/lib/utils";

interface VerificationStatusBadgeProps {
  status: VerificationStatus;
  /** Show an icon alongside the text */
  showIcon?: boolean;
  className?: string;
}

const CONFIG: Record<
  VerificationStatus,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  NOT_SUBMITTED: {
    label: "Not Submitted",
    icon: HelpCircle,
    className:
      "bg-muted text-muted-foreground border border-border",
  },
  PENDING: {
    label: "Under Review",
    icon: Clock,
    className:
      "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900",
  },
  APPROVED: {
    label: "Verified Owner",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900",
  },
};

/**
 * Renders a consistent status badge for verification status.
 * Reused in owner profile, admin queue, and vehicle listing cards.
 */
export function VerificationStatusBadge({
  status,
  showIcon = true,
  className,
}: VerificationStatusBadgeProps) {
  const { label, icon: Icon, className: baseClass } = CONFIG[status];

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full",
        baseClass,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  );
}
