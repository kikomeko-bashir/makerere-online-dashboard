import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Play } from "lucide-react";
import { toast } from "sonner";

import type { ExamSubmission } from "@/lib/types";
import { mockExaminations, mockExamSubmissions, mockCourseUnits } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Users } from "lucide-react";

export default function DashboardExamDetail() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStudent = user.role === "student";

  const exam = mockExaminations.find((e) => e.id === examId);
  const submissions = mockExamSubmissions.filter((s) => s.examId === examId);

  if (!exam) {
    return (
      <div className="space-y-6">
        <PageHeader title="Exam Not Found" description="The requested exam could not be found." />
        <Button variant="outline" onClick={() => navigate("/dashboard/examinations")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Examinations
        </Button>
      </div>
    );
  }

  const courseUnit = mockCourseUnits.find((u) => u.id === exam.courseUnitId);

  // Student-specific: check attempts
  const studentSubmissions = submissions.filter((s) => s.studentId === user.id);
  const attemptCount = studentSubmissions.length;
  const maxAttemptsReached = attemptCount >= exam.maxAttempts;

  // Calculate aggregate statistics (for lecturers/admins)
  const scoredSubmissions = submissions.filter((s) => s.status !== "pending");
  const averageScore =
    scoredSubmissions.length > 0
      ? Math.round(
          scoredSubmissions.reduce((sum, s) => sum + s.score, 0) / scoredSubmissions.length,
        )
      : 0;
  const passRate =
    scoredSubmissions.length > 0
      ? Math.round(
          (scoredSubmissions.filter((s) => s.status === "passed").length /
            scoredSubmissions.length) *
            100,
        )
      : 0;
  const highestScore =
    scoredSubmissions.length > 0 ? Math.max(...scoredSubmissions.map((s) => s.score)) : 0;
  const lowestScore =
    scoredSubmissions.length > 0 ? Math.min(...scoredSubmissions.map((s) => s.score)) : 0;

  const getStatusBadge = (status: ExamSubmission["status"]) => {
    switch (status) {
      case "passed":
        return (
          <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
            Passed
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const submissionColumns: ColumnDef<ExamSubmission>[] = [
    { key: "studentName", header: "Student Name" },
    {
      key: "submissionDate",
      header: "Submission Date",
      render: (row) => format(new Date(row.submissionDate), "MMM d, yyyy HH:mm"),
    },
    {
      key: "score",
      header: "Score",
      render: (row) => `${row.score}%`,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
  ];

  const handleStartExam = () => {
    toast.success("Exam started!", {
      description: `You have ${exam.timeLimit ? `${exam.timeLimit} minutes` : "unlimited time"} to complete this exam.`,
    });
  };

  // ─── Student View ──────────────────────────────────────────────────────────────
  if (isStudent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/examinations")}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>

        <PageHeader title={exam.title} description={courseUnit?.title ?? "Unknown Course Unit"} />

        {/* Exam Info Card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Exam Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-medium capitalize">{exam.type.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pass Mark</p>
              <p className="text-sm font-medium">{exam.passMark}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time Limit</p>
              <p className="text-sm font-medium">
                {exam.timeLimit ? `${exam.timeLimit} minutes` : "Untimed"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Max Attempts</p>
              <p className="text-sm font-medium">{exam.maxAttempts}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Attempts Used</p>
              <p className="text-sm font-medium">
                {attemptCount} / {exam.maxAttempts}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className="text-sm font-medium">{format(new Date(exam.endDate), "MMM d, yyyy")}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Instructions
          </h3>
          <p className="text-sm leading-relaxed">{exam.instructions}</p>
        </div>

        {/* Start Exam Button */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-soft">
          {maxAttemptsReached ? (
            <>
              <p className="text-sm font-medium text-destructive">
                Maximum attempts exhausted ({attemptCount}/{exam.maxAttempts})
              </p>
              <Button disabled size="lg">
                <Play className="mr-2 h-4 w-4" />
                Start Exam
              </Button>
            </>
          ) : (
            <>
              {exam.timeLimit && (
                <p className="text-sm text-muted-foreground">
                  Time remaining once started: {exam.timeLimit} minutes
                </p>
              )}
              <Button size="lg" onClick={handleStartExam}>
                <Play className="mr-2 h-4 w-4" />
                Start Exam
              </Button>
            </>
          )}
        </div>

        {/* Previous Submissions */}
        {studentSubmissions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Your Submissions</h2>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <DataTable<Record<string, unknown>>
                columns={
                  [
                    {
                      key: "attemptNumber",
                      header: "Attempt",
                      render: (row) => `#${(row as unknown as ExamSubmission).attemptNumber}`,
                    },
                    {
                      key: "submissionDate",
                      header: "Submission Date",
                      render: (row) =>
                        format(
                          new Date((row as unknown as ExamSubmission).submissionDate),
                          "MMM d, yyyy HH:mm",
                        ),
                    },
                    {
                      key: "score",
                      header: "Score",
                      render: (row) => `${(row as unknown as ExamSubmission).score}%`,
                    },
                    {
                      key: "status",
                      header: "Status",
                      render: (row) => getStatusBadge((row as unknown as ExamSubmission).status),
                    },
                  ] as ColumnDef<Record<string, unknown>>[]
                }
                data={studentSubmissions as unknown as Record<string, unknown>[]}
                emptyMessage="No submissions yet."
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Lecturer/Admin View ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/examinations")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>

      <PageHeader title={exam.title} description={courseUnit?.title ?? "Unknown Course Unit"} />

      {/* Aggregate Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={BarChart3} value={`${averageScore}%`} label="Average Score" />
        <KpiCard icon={Users} value={`${passRate}%`} label="Pass Rate" />
        <KpiCard icon={TrendingUp} value={`${highestScore}%`} label="Highest Score" />
        <KpiCard icon={TrendingDown} value={`${lowestScore}%`} label="Lowest Score" />
      </div>

      {/* Exam Settings */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Exam Settings
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="text-sm font-medium capitalize">{exam.type.replace("_", " ")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pass Mark</p>
            <p className="text-sm font-medium">{exam.passMark}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time Limit</p>
            <p className="text-sm font-medium">
              {exam.timeLimit ? `${exam.timeLimit} minutes` : "Untimed"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Max Attempts</p>
            <p className="text-sm font-medium">{exam.maxAttempts}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Start Date</p>
            <p className="text-sm font-medium">{format(new Date(exam.startDate), "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">End Date</p>
            <p className="text-sm font-medium">{format(new Date(exam.endDate), "MMM d, yyyy")}</p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs text-muted-foreground">Instructions</p>
            <p className="text-sm font-medium">{exam.instructions}</p>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Submissions ({submissions.length})</h2>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <DataTable<Record<string, unknown>>
            columns={submissionColumns as unknown as ColumnDef<Record<string, unknown>>[]}
            data={submissions as unknown as Record<string, unknown>[]}
            searchableFields={["studentName"]}
            searchPlaceholder="Search students..."
            emptyMessage="No submissions yet."
          />
        </div>
      </div>
    </div>
  );
}
