"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { VerificationStatusBadge } from "@/components/shared/VerificationStatusBadge";
import { DocumentViewer } from "@/components/shared/DocumentViewer";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import verificationService from "@/services/verification.service";
import {
  VerificationRequest,
  VerificationStatus,
} from "@/types/document";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── Request Detail Modal ─────────────────────────────────────────────────────

interface RequestDetailModalProps {
  request: VerificationRequest | null;
  onClose: () => void;
  onApprove: (req: VerificationRequest) => void;
  onReject: (req: VerificationRequest) => void;
}

function RequestDetailModal({
  request,
  onClose,
  onApprove,
  onReject,
}: RequestDetailModalProps) {
  if (!request) return null;

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {getInitials(request.ownerFullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-semibold">{request.ownerFullName}</p>
              <p className="text-xs text-muted-foreground font-normal">
                {request.ownerEmail}
              </p>
            </div>
            <VerificationStatusBadge
              status={request.status}
              className="ml-auto"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Submitted At
              </p>
              <p className="font-medium">{formatDate(request.submittedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Contact
              </p>
              <p className="font-medium">{request.ownerContactNumber}</p>
            </div>
            {request.reviewedAt && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Reviewed At
                </p>
                <p className="font-medium">{formatDate(request.reviewedAt)}</p>
              </div>
            )}
          </div>

          {/* Rejection reason */}
          {request.rejectionReason && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-xs font-semibold text-destructive mb-1">
                Rejection Reason
              </p>
              <p className="text-sm text-destructive/80">
                {request.rejectionReason}
              </p>
            </div>
          )}

          <Separator />

          {/* Documents */}
          <div>
            <p className="text-sm font-semibold mb-3">
              Documents ({request.documents.length})
            </p>
            <DocumentViewer documents={request.documents} />
          </div>

          {/* Actions for PENDING */}
          {request.status === "PENDING" && (
            <>
              <Separator />
              <div className="flex gap-3">
                <Button
                  className="flex-1 gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  onClick={() => onApprove(request)}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => onReject(request)}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

interface RequestCardProps {
  req: VerificationRequest;
  onView: (req: VerificationRequest) => void;
  onApprove: (req: VerificationRequest) => void;
  onReject: (req: VerificationRequest) => void;
  isActing: boolean;
}

function RequestCard({
  req,
  onView,
  onApprove,
  onReject,
  isActing,
}: RequestCardProps) {
  const firstDoc = req.documents[0];

  return (
    <Card
      className="border border-border shadow-none hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => onView(req)}
    >
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start gap-4">
          {/* Owner info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-11 w-11 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(req.ownerFullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">
                {req.ownerFullName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {req.ownerEmail}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Submitted {formatDate(req.submittedAt)}
              </p>
            </div>
          </div>

          {/* Thumbnail preview */}
          {firstDoc && (
            <div className="shrink-0 hidden sm:flex items-center gap-2">
              {req.documents.slice(0, 3).map((doc) => {
                const isPdf =
                  doc.contentType === "application/pdf" ||
                  doc.originalFilename?.endsWith(".pdf");
                return (
                  <div
                    key={doc.documentId}
                    className="h-14 w-20 overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center"
                  >
                    {isPdf ? (
                      <span className="text-[9px] font-bold text-muted-foreground">
                        PDF
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={doc.fileUrl}
                        alt={doc.documentName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                );
              })}
              {req.documents.length > 3 && (
                <div className="h-14 w-10 rounded-md border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  +{req.documents.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Status + actions */}
          <div
            className="flex flex-col items-end gap-2.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <VerificationStatusBadge status={req.status} />

            {req.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gap-1.5 h-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  onClick={() => onApprove(req)}
                  disabled={isActing}
                >
                  {isActing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5 h-8"
                  onClick={() => onReject(req)}
                  disabled={isActing}
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </Button>
              </div>
            )}

            {req.status === "APPROVED" && (
              <CheckCircle2 className="h-5 w-5 text-secondary" />
            )}
            {req.status === "REJECTED" && (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Admin Verification Queue
 *
 * Features:
 * - Tabs: All / Pending / Approved / Rejected
 * - Live search by owner name or email
 * - Click-to-open detail modal with document viewer
 * - Approve / Reject with confirm dialogs
 * - Auto-refresh after action
 */

export function VerificationQueue() {
  const { toast } = useToast();

  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | VerificationStatus>(
    "PENDING"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Detail modal
  const [detailRequest, setDetailRequest] =
    useState<VerificationRequest | null>(null);

  // Action state
  const [approveTarget, setApproveTarget] =
    useState<VerificationRequest | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<VerificationRequest | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [actingId, setActingId] = useState<number | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ── Load ───────────────────────────────────────────────────────────────────

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await verificationService.getAllVerificationRequests(currentPage, 10);
      const data = response.data;
      // Sort: PENDING first, then by submittedAt desc
      data.sort((a, b) => {
        if (a.status === "PENDING" && b.status !== "PENDING") return -1;
        if (a.status !== "PENDING" && b.status === "PENDING") return 1;
        return (
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      });
      setRequests(data);
      setTotalPages(response.meta.totalPages);
      setTotalElements(response.meta.totalElements);
    } catch (err: any) {
      toast({
        title: "Failed to load requests",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, toast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Reset page when filtering changes
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab, searchQuery]);

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = requests.filter((r) => {
    const matchesTab =
      activeTab === "all" || r.status === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.ownerFullName.toLowerCase().includes(q) ||
      r.ownerEmail.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  // ── Approve ────────────────────────────────────────────────────────────────

  const handleApproveConfirm = async () => {
    if (!approveTarget) return;
    setIsActing(true);
    setActingId(approveTarget.requestId);
    try {
      const updated = await verificationService.reviewVerificationRequest(
        approveTarget.requestId,
        { approve: true }
      );
      setRequests((prev) =>
        prev.map((r) =>
          r.requestId === updated.requestId ? updated : r
        )
      );
      toast({
        title: "Owner approved",
        description: `${approveTarget.ownerFullName} is now a Verified Owner.`,
      });
      setApproveTarget(null);
      setDetailRequest(null);
    } catch (err: any) {
      toast({
        title: "Approval failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsActing(false);
      setActingId(null);
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────────

  const handleRejectConfirm = async (reason?: string) => {
    if (!rejectTarget || !reason) return;
    setIsActing(true);
    setActingId(rejectTarget.requestId);
    try {
      const updated = await verificationService.reviewVerificationRequest(
        rejectTarget.requestId,
        { approve: false, rejectionReason: reason }
      );
      setRequests((prev) =>
        prev.map((r) =>
          r.requestId === updated.requestId ? updated : r
        )
      );
      toast({
        title: "Request rejected",
        description: `${rejectTarget.ownerFullName}'s request has been rejected.`,
      });
      setRejectTarget(null);
      setDetailRequest(null);
    } catch (err: any) {
      toast({
        title: "Rejection failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsActing(false);
      setActingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Verification Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve vehicle owner identity documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="status-pending gap-1.5 px-3 py-1.5 text-sm">
              <Clock className="h-3.5 w-3.5" />
              {pendingCount} pending
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadRequests}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="flex-1"
        >
          <TabsList className="h-9">
            <TabsTrigger value="PENDING" className="text-xs px-3">
              Pending
              {pendingCount > 0 && (
                <Badge className="ml-1.5 h-4 px-1 text-[10px] status-pending">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs px-3">
              All
            </TabsTrigger>
            <TabsTrigger value="APPROVED" className="text-xs px-3">
              Approved
            </TabsTrigger>
            <TabsTrigger value="REJECTED" className="text-xs px-3">
              Rejected
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 w-full sm:w-64"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border shadow-none">
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-secondary mb-3" />
            <p className="font-semibold text-foreground">
              {searchQuery ? "No matching requests" : "All clear!"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery
                ? "Try a different search term."
                : "No verification requests in this category."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3">
            {filtered.map((req) => (
              <RequestCard
                key={req.requestId}
                req={req}
                onView={setDetailRequest}
                onApprove={(r) => setApproveTarget(r)}
                onReject={(r) => setRejectTarget(r)}
                isActing={actingId === req.requestId}
              />
            ))}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between px-4 py-3 border rounded-lg bg-card">
            <div className="text-xs text-muted-foreground">
              Showing {totalElements === 0 ? 0 : currentPage * 10 + 1} to {Math.min((currentPage + 1) * 10, totalElements)} of {totalElements} requests
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0 || isLoading}
              >
                Previous
              </Button>
              <div className="text-xs font-medium px-2">
                Page {currentPage + 1} of {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1 || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <RequestDetailModal
        request={detailRequest}
        onClose={() => setDetailRequest(null)}
        onApprove={(r) => {
          setDetailRequest(null);
          setApproveTarget(r);
        }}
        onReject={(r) => {
          setDetailRequest(null);
          setRejectTarget(r);
        }}
      />

      {/* Approve confirm */}
      <ConfirmActionDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title="Approve verification request?"
        description={`You are about to approve ${approveTarget?.ownerFullName}'s KYC request. They will receive Verified Owner status immediately.`}
        confirmLabel="Approve"
        isLoading={isActing}
        onConfirm={handleApproveConfirm}
      />

      {/* Reject confirm */}
      <ConfirmActionDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Reject verification request?"
        description={`You are about to reject ${rejectTarget?.ownerFullName}'s KYC request. Provide a clear reason so they can resubmit.`}
        confirmLabel="Reject"
        destructive
        requiresReason
        reasonLabel="Rejection Reason"
        reasonPlaceholder="e.g. Document is blurry or illegible. Please resubmit a clearer photo."
        isLoading={isActing}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}