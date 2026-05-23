import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { BookOpen, Clock, CreditCard } from "lucide-react";

import type { Enrollment, EnrollmentStatus, Course } from "@/lib/types";
import {
  mockEnrollments,
  mockUsers,
  mockCourses,
  mockCourseUnits,
  mockSchools,
} from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const getStudentName = (studentId: string) => {
    const user = mockUsers.find((u) => u.id === studentId);
    return user?.name ?? "Unknown";
  };

  const getCourseOrUnitName = (enrollment: Enrollment) => {
    if (enrollment.courseId) {
      const course = mockCourses.find((c) => c.id === enrollment.courseId);
      return course?.title ?? "Unknown Course";
    }
    if (enrollment.courseUnitId) {
      const unit = mockCourseUnits.find((u) => u.id === enrollment.courseUnitId);
      return unit?.title ?? "Unknown Unit";
    }
    return "N/A";
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: EnrollmentStatus) => {
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
    if (statusFilter === "all") return mockEnrollments;
    return mockEnrollments.filter((e) => e.status === statusFilter);
  }, [statusFilter]);

  const columns: ColumnDef<Enrollment>[] = [
    {
      key: "studentId",
      header: "Student",
      render: (row) => getStudentName(row.studentId),
    },
    {
      key: "courseId",
      header: "Course / Unit",
      render: (row) => getCourseOrUnitName(row),
    },
    {
      key: "enrollmentDate",
      header: "Enrollment Date",
      render: (row) => formatDate(row.enrollmentDate),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      render: (row) => getPaymentBadge(row.paymentStatus),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment Management"
        description="View and manage student enrollments across courses."
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
          searchableFields={["studentId"]}
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

  const [enrollments, setEnrollments] = useState<Enrollment[]>([...mockEnrollments]);
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [feeRange, setFeeRange] = useState<string>("all");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Student's enrollments
  const myEnrollments = enrollments.filter((e) => e.studentId === user.id);

  // Already enrolled course IDs
  const enrolledCourseIds = myEnrollments
    .filter((e) => e.status !== "dropped")
    .map((e) => e.courseId)
    .filter(Boolean);

  // Available courses (active, not already enrolled)
  const availableCourses = useMemo(() => {
    let courses = mockCourses.filter(
      (c) => c.status === "active" && !enrolledCourseIds.includes(c.id),
    );

    if (schoolFilter !== "all") {
      courses = courses.filter((c) => c.schoolId === schoolFilter);
    }

    if (durationFilter !== "all") {
      switch (durationFilter) {
        case "short":
          courses = courses.filter((c) => {
            const months = c.durationUnit === "years" ? c.duration * 12 : c.duration;
            return months <= 12;
          });
          break;
        case "medium":
          courses = courses.filter((c) => {
            const months = c.durationUnit === "years" ? c.duration * 12 : c.duration;
            return months > 12 && months <= 36;
          });
          break;
        case "long":
          courses = courses.filter((c) => {
            const months = c.durationUnit === "years" ? c.duration * 12 : c.duration;
            return months > 36;
          });
          break;
      }
    }

    if (feeRange !== "all") {
      switch (feeRange) {
        case "under3m":
          courses = courses.filter((c) => c.fee < 3000000);
          break;
        case "3m-5m":
          courses = courses.filter((c) => c.fee >= 3000000 && c.fee <= 5000000);
          break;
        case "over5m":
          courses = courses.filter((c) => c.fee > 5000000);
          break;
      }
    }

    return courses;
  }, [schoolFilter, durationFilter, feeRange, enrolledCourseIds]);

  const getSchoolName = (schoolId: string) => {
    const school = mockSchools.find((s) => s.id === schoolId);
    return school?.name ?? "Unknown School";
  };

  const getDurationLabel = (course: Course) => {
    return `${course.duration} ${course.durationUnit}`;
  };

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setEnrollDialogOpen(true);
  };

  const handleConfirmEnroll = () => {
    if (!selectedCourse) return;

    const newEnrollment: Enrollment = {
      id: `enroll-${Date.now()}`,
      studentId: user.id,
      courseId: selectedCourse.id,
      enrollmentDate: new Date().toISOString().split("T")[0],
      status: "payment_pending",
      paymentStatus: "pending",
    };

    setEnrollments((prev) => [...prev, newEnrollment]);
    toast.success("Enrollment initiated!", {
      description: `Please complete payment for ${selectedCourse.title}.`,
    });
    setEnrollDialogOpen(false);
    setSelectedCourse(null);
  };

  const handleCompletePayment = (enrollment: Enrollment) => {
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === enrollment.id
          ? { ...e, status: "active" as const, paymentStatus: "completed" as const }
          : e,
      ),
    );
    toast.success("Payment completed successfully!");
  };

  const getCourseOrUnitName = (enrollment: Enrollment) => {
    if (enrollment.courseId) {
      const course = mockCourses.find((c) => c.id === enrollment.courseId);
      return course?.title ?? "Unknown Course";
    }
    if (enrollment.courseUnitId) {
      const unit = mockCourseUnits.find((u) => u.id === enrollment.courseUnitId);
      return unit?.title ?? "Unknown Unit";
    }
    return "N/A";
  };

  const getStatusBadge = (status: EnrollmentStatus) => {
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

  const historyColumns: ColumnDef<Enrollment>[] = [
    {
      key: "courseId",
      header: "Course / Unit",
      render: (row) => getCourseOrUnitName(row),
    },
    {
      key: "enrollmentDate",
      header: "Enrollment Date",
      render: (row) => format(new Date(row.enrollmentDate), "MMM dd, yyyy"),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      render: (row) => getPaymentBadge(row.paymentStatus),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment"
        description="Browse available courses and manage your enrollments."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">School</Label>
          <Select value={schoolFilter} onValueChange={setSchoolFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Schools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {mockSchools
                .filter((s) => s.status === "active")
                .map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Duration</Label>
          <Select value={durationFilter} onValueChange={setDurationFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Durations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Durations</SelectItem>
              <SelectItem value="short">Short (≤ 12 months)</SelectItem>
              <SelectItem value="medium">Medium (1-3 years)</SelectItem>
              <SelectItem value="long">Long (3+ years)</SelectItem>
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

      {/* Available Courses Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Available Courses</h2>
        {availableCourses.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-soft">
            <p>No courses match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map((course) => (
              <Card key={course.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base leading-tight">{course.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{getSchoolName(course.schoolId)}</p>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{getDurationLabel(course)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>{formatUGX(course.fee)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{course.unitIds.length} units</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleEnrollClick(course)}>
                    Enroll
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
            data={myEnrollments as unknown as Record<string, unknown>[]}
            searchableFields={["courseId"]}
            searchPlaceholder="Search enrollments..."
            emptyMessage="You have no enrollments yet."
            rowActions={(row) => {
              const enrollment = row as unknown as Enrollment;
              if (enrollment.status === "payment_pending") {
                return (
                  <Button size="sm" onClick={() => handleCompletePayment(enrollment)}>
                    Complete Payment
                  </Button>
                );
              }
              return null;
            }}
          />
        </div>
      </div>

      {/* Enrollment Confirmation Dialog */}
      <ConfirmDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        title="Confirm Enrollment"
        description={
          selectedCourse
            ? `You are about to enroll in "${selectedCourse.title}". The fee is ${formatUGX(selectedCourse.fee)}. You will need to complete payment to activate your enrollment.`
            : ""
        }
        confirmLabel="Confirm Enrollment"
        onConfirm={handleConfirmEnroll}
        destructive={false}
      />
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
