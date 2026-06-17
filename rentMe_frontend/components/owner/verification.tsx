"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Loader2,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileUploadZone, FileWithMeta } from "@/components/shared/FileUploadZone";
import { DocumentViewer } from "@/components/shared/DocumentViewer";
import { VerificationStatusBadge } from "@/components/shared/VerificationStatusBadge";
import verificationService from "@/services/verification.service";
import { VerificationRequest, OWNER_KYC_DOCUMENT_TYPES } from "@/types/document";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Rejection Banner ─────────────────────────────────────────────────────────

function RejectionBanner({ reason }: { reason: string }) {
  return (
    <Alert className="border-destructive/40 bg-destructive/5">
      <XCircle className="h-4 w-4 text-destructive" />
      <AlertTitle className="text-destructive font-semibold">
        Verification Rejected
      </AlertTitle>
      <AlertDescription className="mt-1 text-sm">
        <span className="font-medium">Reason: </span>
        {reason}
      </AlertDescription>
      <p className="text-xs text-muted-foreground mt-2">
        Please upload new documents addressing the above and resubmit.
      </p>
    </Alert>
  );
}

// ─── History row ──────────────────────────────────────────────────────────────

function HistoryRow({ req }: { req: VerificationRequest }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <VerificationStatusBadge status={req.status} />
          <span className="text-sm text-muted-foreground">
            Submitted {formatDate(req.submittedAt)}
          </span>
          <Badge variant="outline" className="text-xs">
            {req.documents.length} doc{req.documents.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {req.rejectionReason && (
            <div className="rounded-md bg-destructive/5 border border-destructive/20 p-3 text-sm">
              <span className="font-semibold text-destructive">
                Rejection reason:{" "}
              </span>
              {req.rejectionReason}
            </div>
          )}
          {req.reviewedAt && (
            <p className="text-xs text-muted-foreground">
              Reviewed on {formatDate(req.reviewedAt)}
            </p>
          )}
          <DocumentViewer documents={req.documents} />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Owner Verification page.
 *
 * States handled:
 *  - NOT_SUBMITTED  → prompt to upload docs + submit
 *  - PENDING        → "under review" message + uploaded docs view
 *  - APPROVED       → success + verified badge
 *  - REJECTED       → rejection reason prominent + re-upload form
 */
export function Verification() {
  const { toast } = useToast();

  const [latestRequest, setLatestRequest] =
    useState<VerificationRequest | null>(null);
  const [history, setHistory] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [files, setFiles] = useState<FileWithMeta[]>([]);

  // ── Load data ──────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [latest, hist] = await Promise.all([
        verificationService.getMyLatestVerificationRequest(),
        verificationService.getMyVerificationHistory(),
      ]);
      setLatestRequest(latest);
      setHistory(hist);
    } catch (err: any) {
      toast({
        title: "Failed to load verification status",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const validFiles = files.filter((f) => !f.error);
    if (validFiles.length === 0) {
      toast({
        title: "No valid files",
        description: "Please upload at least one document.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await verificationService.submitVerificationRequest(
        validFiles.map((f) => f.file),
        validFiles.map((f) => f.documentType),
        validFiles.map((f) => f.documentName)
      );
      toast({
        title: "Request submitted!",
        description:
          "Your verification documents have been sent for review. We'll update you once reviewed.",
      });
      setFiles([]);
      await loadData();
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const status = latestRequest?.status ?? "NOT_SUBMITTED";
  const canSubmit = status === "NOT_SUBMITTED" || status === "REJECTED";
  const validFileCount = files.filter((f) => !f.error).length;

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-3xl mx-auto">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Identity Verification (KYC)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload your legal documents to become a verified vehicle owner.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <VerificationStatusBadge status={status} />
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="text-muted-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Status Alerts ─────────────────────────────────────────────── */}
      {status === "PENDING" && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-700 dark:text-yellow-400">
            Under Review
          </AlertTitle>
          <AlertDescription className="text-yellow-700/80 dark:text-yellow-400/80 text-sm">
            Your documents have been submitted and are being reviewed by our
            team. This typically takes 1–2 business days.
          </AlertDescription>
        </Alert>
      )}

      {status === "APPROVED" && (
        <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-700 dark:text-emerald-400">
            You are a Verified Owner!
          </AlertTitle>
          <AlertDescription className="text-emerald-700/80 dark:text-emerald-400/80 text-sm">
            Your identity has been verified. You can now list vehicles and
            receive bookings.
          </AlertDescription>
        </Alert>
      )}

      {status === "REJECTED" && latestRequest?.rejectionReason && (
        <RejectionBanner reason={latestRequest.rejectionReason} />
      )}

      {status === "NOT_SUBMITTED" && (
        <Alert className="border-border bg-muted/30">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <AlertDescription className="text-sm text-muted-foreground">
            You haven't submitted a verification request yet. Upload your
            documents below to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Latest submitted docs (PENDING / APPROVED) ────────────────── */}
      {latestRequest && status !== "REJECTED" && latestRequest.documents.length > 0 && (
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {status === "APPROVED"
                ? "Verified Documents"
                : "Submitted Documents"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentViewer documents={latestRequest.documents} />
            <p className="text-xs text-muted-foreground mt-3">
              Submitted {formatDate(latestRequest.submittedAt)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Upload form (NOT_SUBMITTED or REJECTED) ───────────────────── */}
      {canSubmit && (
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {status === "REJECTED"
                ? "Re-upload Documents"
                : "Upload Verification Documents"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload your NIC, driving licence, or address proof. A new
              verification request will be created.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUploadZone
              allowedDocumentTypes={OWNER_KYC_DOCUMENT_TYPES}
              defaultDocumentType="OWNER_NIC"
              onChange={setFiles}
            />

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || validFileCount === 0}
              className="w-full gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Verification Request
                  {validFileCount > 0 && ` (${validFileCount} file${validFileCount !== 1 ? "s" : ""})`}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── History ───────────────────────────────────────────────────── */}
      {history.length > 1 && (
        <div className="space-y-3">
          <Separator />
          <button
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowHistory((p) => !p)}
          >
            <History className="h-4 w-4" />
            Submission History ({history.length} request
            {history.length !== 1 ? "s" : ""})
            {showHistory ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showHistory && (
            <div className="space-y-2">
              {history.map((req) => (
                <HistoryRow key={req.requestId} req={req} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
