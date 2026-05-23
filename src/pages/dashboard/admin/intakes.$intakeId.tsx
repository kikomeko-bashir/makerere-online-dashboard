import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";

import { mockIntakes, mockCourses, mockEnrollments, mockUsers } from "@/lib/mock-data";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardIntakeDetail() {
  const { intakeId } = useParams<{ intakeId: string }>();

  const intake = mockIntakes.find((i) => i.id === intakeId);

  if (!intake) {
    return (
      <div className="space-y-6">
        <PageHeader title="Intake Not Found" />
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          <p>The intake you are looking for does not exist.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/dashboard/intakes">Back to Intakes</Link>
          </Button>
        </div>
      </div>
    );
  }

  const course = mockCourses.find((c) => c.id === intake.courseId);
  const enrollments = mockEnrollments.filter((e) => e.intakeId === intakeId);

  const getStudentName = (studentId: string) => {
    const user = mockUsers.find((u) => u.id === studentId);
    return user?.name ?? "Unknown";
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  const enrollmentColumns: ColumnDef<(typeof enrollments)[0]>[] = [
    {
      key: "studentId",
      header: "Student",
      render: (row) => getStudentName(row.studentId),
    },
    {
      key: "enrollmentDate",
      header: "Enrollment Date",
      render: (row) => formatDate(row.enrollmentDate),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          variant={
            row.status === "active"
              ? "default"
              : row.status === "completed"
                ? "secondary"
                : "destructive"
          }
        >
          {row.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (row) => (
        <Badge
          variant={
            row.paymentStatus === "completed"
              ? "default"
              : row.paymentStatus === "pending"
                ? "secondary"
                : "destructive"
          }
        >
          {row.paymentStatus}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/intakes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <PageHeader title={intake.name} description={course?.title ?? "Unknown Course"}>
        <Badge variant={intake.status === "active" ? "default" : "secondary"}>
          {intake.status}
        </Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Start Date</span>
          </div>
          <p className="mt-2 text-sm font-medium">{formatDate(intake.startDate)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">End Date</span>
          </div>
          <p className="mt-2 text-sm font-medium">{formatDate(intake.endDate)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-xs">Enrollment</span>
          </div>
          <p className="mt-2 text-sm font-medium">
            {intake.enrolledCount} / {intake.capacity}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Fee</span>
          </div>
          <p className="mt-2 text-sm font-medium">
            UGX {(intake.feeOverride ?? course?.fee ?? 0).toLocaleString()}
            {intake.feeOverride && (
              <span className="ml-1 text-xs text-muted-foreground">(override)</span>
            )}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">
          Enrolled Students ({enrollments.length})
        </h2>
        <DataTable<Record<string, unknown>>
          columns={enrollmentColumns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={enrollments as unknown as Record<string, unknown>[]}
          searchableFields={["studentId"]}
          searchPlaceholder="Search students..."
          emptyMessage="No students enrolled in this intake yet."
        />
      </div>
    </div>
  );
}
