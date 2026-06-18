"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /** Optional explicit destination. Defaults to router.back(). */
  href?: string;
  /** Button label. Defaults to "Back". */
  label?: string;
  className?: string;
}

/**
 * BackButton — centralised "go back" control.
 *
 * Usage:
 *   <BackButton />                         // uses router.back()
 *   <BackButton href="/admin/users" />      // explicit route
 *   <BackButton label="Back to users" />   // custom label
 */
export function BackButton({ href, label = "Back", className }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        "gap-1.5 text-muted-foreground hover:text-foreground -ml-1",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}

export default BackButton;
