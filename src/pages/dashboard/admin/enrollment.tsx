import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { BookOpen, Clock, CreditCard, Users, Loader2 } from "lucide-react";

import { api, ApiEnrollment, ApiIntake, ApiCourse } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString()}`;
}

// ─── Admin View ────────────────────────────────────────────────────────────────

function AdminEnrollmentView() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await api.getEnrollments();
      setEnrollments(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "payment_pending":
        return (
          <Badge className="border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Payment Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "dropped":
        return <Badge variant="destructive">Dropped</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredEnrollments = useMemo(() => {
    if (statusFilter === "all") return enrollments;
    return enrollments.filter((e) => e.status === statusFilter);
  }, [statusFilter, enrollments]);

  const columns: ColumnDef<ApiEnrollment>[] = [
    {
      key: "student_id",
      header: "Student ID",
      render: (row) => <span className="font-mono text-xs">{row.student_id.slice(0, 8)}...</span>,
    },
    {
      key: "intake_id",
      header: "Intake ID",
      render: (row) => <span className="font-mono text-xs">{row.intake_id.slice(0, 8)}...</span>,
    },
    {
      key: "enrollment_date",
      header: "Enrollment Date",
      render: (row) => formatDate(row.enrollment_date),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "payment_status",
      header: "Payment Status",
      render: (row) => getPaymentBadge(row.payment_status),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment Management"
        description="View and manage student enrollments across intakes."
      />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-4 flex items-center gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Filter by Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="payment_pending">Payment Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable<Record<string, unknown>>
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={filteredEnrollments as unknown as Record<string, unknown>[]}
          searchableFields={["student_id"]}
          searchPlaceholder="Search enrollments..."
          emptyMessage="No enrollments found."
        />
      </div>
    </div>
  );
}

// ─── Student View ──────────────────────────────────────────────────────────────

function StudentEnrollmentView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([]);
  const [intakes, setIntakes] = useState<ApiIntake[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  const [yearFilter, setYearFilter] = useState<string>("all");
  const [feeRange, setFeeRange] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enrollmentData, intakeData, courseData] = await Promise.all([
        api.getEnrollments(),
        api.getIntakes(),
        api.getCourses(),
      ]);
      setEnrollments(enrollmentData);
      setIntakes(intakeData);
      setCourses(courseData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Already enrolled intake IDs (not dropped)
  const enrolledIntakeIds = enrollments
    .filter((e) => e.status !== "dropped")
    .map((e) => e.intake_id);

  // Available intakes (active, has capacity, not already enrolled)
  const availableIntakes = useMemo(() => {
    let filtered = intakes.filter(
      (i) =>
        i.status === "active" &&
        i.enrolled_count < i.capacity &&
        !enrolledIntakeIds.includes(i.id),
    );

    if (yearFilter !== "all") {
      filtered = filtered.filter((i) => i.year_level === parseInt(yearFilter));
    }

    if (feeRange !== "all") {
      switch (feeRange) {
        case "under3m":
          filtered = filtered.filter((i) => i.fee < 3000000);
          break;
        case "3m-5m":
          filtered = filtered.filter((i) => i.fee >= 3000000 && i.fee <= 5000000);
          break;
        case "over5m":
          filtered = filtered.filter((i) => i.fee > 5000000);
          break;
      }
    }

    return filtered;
  }, [intakes, yearFilter, feeRange, enrolledIntakeIds]);

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.title ?? courseId.slice(0, 8);
  };

  const getIntakeCourseNames = (intake: ApiIntake) => {
    if (!intake.course_ids || intake.course_ids.length === 0) return "No courses";
    return intake.course_ids.map((id) => getCourseName(id)).join(", ");
  };

  const handleCompletePayment = async (enrollment: ApiEnrollment) => {
    try {
      setPaying(enrollment.id);
      const updated = await api.completeEnrollmentPayment(enrollment.id);
      setEnrollments((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e)),
      );
      toast.success("Payment completed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete payment");
    } finally {
      setPaying(null);
    }
  };

  const getIntakeName = (intakeId: string) => {
    const intake = intakes.find((i) => i.id === intakeId);
    return intake?.name ?? intakeId.slice(0, 8);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "payment_pending":
        return (
          <Badge className="border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Payment Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "dropped":
        return <Badge variant="destructive">Dropped</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const historyColumns: ColumnDef<ApiEnrollment>[] = [
    {
      key: "intake_id",
      header: "Intake",
      render: (row) => getIntakeName(row.intake_id),
    },
    {
      key: "enrollment_date",
      header: "Enrollment Date",
      render: (row) => format(new Date(row.enrollment_date), "MMM dd, yyyy"),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "payment_status",
      header: "Payment Status",
      render: (row) => getPaymentBadge(row.payment_status),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment"
        description="Browse available intakes and manage your enrollments."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Year Level</Label>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="1">Year 1</SelectItem>
              <SelectItem value="2">Year 2</SelectItem>
              <SelectItem value="3">Year 3</SelectItem>
              <SelectItem value="4">Year 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Fee Range</Label>
          <Select value={feeRange} onValueChange={setFeeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Fees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fees</SelectItem>
              <SelectItem value="under3m">Under UGX 3M</SelectItem>
              <SelectItem value="3m-5m">UGX 3M - 5M</SelectItem>
              <SelectItem value="over5m">Over UGX 5M</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Available Intakes Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Available Intakes</h2>
        {availableIntakes.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-soft">
            <p>No intakes match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableIntakes.map((intake) => (
              <Card key={intake.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base leading-tight">{intake.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">Year {intake.year_level}</p>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="truncate">{getIntakeCourseNames(intake)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>{formatUGX(intake.fee)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{intake.enrolled_count} / {intake.capacity} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {format(new Date(intake.start_date), "MMM dd, yyyy")} –{" "}
                      {format(new Date(intake.end_date), "MMM dd, yyyy")}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => navigate(`/dashboard/enrollment/${intake.id}`)}>
                    View Courses
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Enrollment History */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">My Enrollments</h2>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <DataTable<Record<string, unknown>>
            columns={historyColumns as unknown as ColumnDef<Record<string, unknown>>[]}
            data={enrollments as unknown as Record<string, unknown>[]}
            searchableFields={["intake_id"]}
            searchPlaceholder="Search enrollments..."
            emptyMessage="You have no enrollments yet."
            rowActions={(row) => {
              const enrollment = row as unknown as ApiEnrollment;
              if (enrollment.status === "payment_pending") {
                return (
                  <Button
                    size="sm"
                    onClick={() => handleCompletePayment(enrollment)}
                    disabled={paying === enrollment.id}
                  >
                    {paying === enrollment.id ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : null}
                    Complete Payment
                  </Button>
                );
              }
              return null;
            }}
          />
        </div>
      </div>

    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DashboardEnrollment() {
  const { user } = useAuth();

  if (user.role === "student") {
    return <StudentEnrollmentView />;
  }

  return <AdminEnrollmentView />;
}
