import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

import { api, type ApiTutorAdmin } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return (
        <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="border-transparent bg-red-100 text-red-800 hover:bg-red-100">
          Rejected
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge className="border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pending
        </Badge>
      );
  }
}

export default function TutorManagement() {
  const [tutors, setTutors] = useState<ApiTutorAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    name: string;
    action: "approve" | "reject";
  } | null>(null);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminTutors();
      setTutors(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load tutor profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (tutor: ApiTutorAdmin) => {
    setConfirmAction({ id: tutor.id, name: tutor.name, action: "approve" });
    setConfirmOpen(true);
  };

  const handleReject = (tutor: ApiTutorAdmin) => {
    setConfirmAction({ id: tutor.id, name: tutor.name, action: "reject" });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      setActionLoading(confirmAction.id);
      if (confirmAction.action === "approve") {
        await api.approveTutor(confirmAction.id);
        toast.success(`${confirmAction.name}'s tutoring profile approved`);
      } else {
        await api.rejectTutor(confirmAction.id);
        toast.success(`${confirmAction.name}'s tutoring profile rejected`);
      }
      setConfirmOpen(false);
      setConfirmAction(null);
      await fetchTutors();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingTutors = tutors.filter((t) => t.approval_status === "pending");
  const approvedTutors = tutors.filter((t) => t.approval_status === "approved");
  const rejectedTutors = tutors.filter((t) => t.approval_status === "rejected");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tutor Management"
        description="Review and approve lecturers who have offered to provide tutoring services. Only approved tutors are visible to students and on the public site."
      />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-yellow-600">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Pending Review</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{pendingTutors.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Approved</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{approvedTutors.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Rejected</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{rejectedTutors.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingTutors.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedTutors.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedTutors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <TutorList
            tutors={pendingTutors}
            onApprove={handleApprove}
            onReject={handleReject}
            actionLoading={actionLoading}
            emptyMessage="No pending tutor applications."
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <TutorList
            tutors={approvedTutors}
            onReject={handleReject}
            actionLoading={actionLoading}
            emptyMessage="No approved tutors yet."
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <TutorList
            tutors={rejectedTutors}
            onApprove={handleApprove}
            actionLoading={actionLoading}
            emptyMessage="No rejected tutor profiles."
          />
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction?.action === "approve" ? "Approve Tutor" : "Reject Tutor"}
        description={
          confirmAction?.action === "approve"
            ? `Are you sure you want to approve ${confirmAction?.name}'s tutoring profile? They will become visible to students and on the public tutoring page.`
            : `Are you sure you want to reject ${confirmAction?.name}'s tutoring profile? They will not be visible to students.`
        }
        confirmLabel={confirmAction?.action === "approve" ? "Approve" : "Reject"}
        onConfirm={handleConfirm}
        destructive={confirmAction?.action === "reject"}
      />
    </div>
  );
}

// ─── Tutor List Component ──────────────────────────────────────────────────────

function TutorList({
  tutors,
  onApprove,
  onReject,
  actionLoading,
  emptyMessage,
}: {
  tutors: ApiTutorAdmin[];
  onApprove?: (tutor: ApiTutorAdmin) => void;
  onReject?: (tutor: ApiTutorAdmin) => void;
  actionLoading: string | null;
  emptyMessage: string;
}) {
  if (tutors.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-soft">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tutors.map((tutor) => (
        <div
          key={tutor.id}
          className="rounded-xl border border-border bg-card p-5 shadow-soft"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{tutor.name}</h3>
                {getStatusBadge(tutor.approval_status)}
                {tutor.is_available ? (
                  <Badge variant="outline" className="text-xs">Available</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                )}
              </div>

              {tutor.bio && (
                <p className="text-sm text-muted-foreground">{tutor.bio}</p>
              )}

              <div className="flex flex-wrap gap-1">
                {tutor.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="text-xs">
                    {subject}
                  </Badge>
                ))}
                {tutor.subjects.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No subjects set</span>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Rate: <span className="font-medium text-foreground">UGX {tutor.hourly_rate.toLocaleString()}/hr</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              {onApprove && tutor.approval_status !== "approved" && (
                <Button
                  size="sm"
                  onClick={() => onApprove(tutor)}
                  disabled={actionLoading === tutor.id}
                >
                  {actionLoading === tutor.id ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-1 h-3 w-3" />
                  )}
                  Approve
                </Button>
              )}
              {onReject && tutor.approval_status !== "rejected" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject(tutor)}
                  disabled={actionLoading === tutor.id}
                >
                  {actionLoading === tutor.id ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <XCircle className="mr-1 h-3 w-3" />
                  )}
                  Reject
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
