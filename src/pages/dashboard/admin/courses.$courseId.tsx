import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, DollarSign, GraduationCap } from "lucide-react";

import { mockCourses, mockSchools, mockCourseUnits, mockUsers } from "@/lib/mock-data";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();

  const course = mockCourses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="space-y-6">
        <PageHeader title="Course Not Found" />
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          <p>The course you are looking for does not exist.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/dashboard/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const school = mockSchools.find((s) => s.id === course.schoolId);
  const courseUnits = mockCourseUnits.filter((u) => course.unitIds.includes(u.id));

  const getLecturerName = (lecturerId: string) => {
    const user = mockUsers.find((u) => u.id === lecturerId);
    return user?.name ?? "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <PageHeader title={course.title} description={course.description}>
        <Badge variant={course.status === "active" ? "default" : "secondary"}>
          {course.status}
        </Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs">School</span>
          </div>
          <p className="mt-2 text-sm font-medium">{school?.name ?? "Unknown"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Duration</span>
          </div>
          <p className="mt-2 text-sm font-medium">
            {course.duration} {course.durationUnit}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Fee</span>
          </div>
          <p className="mt-2 text-sm font-medium">UGX {course.fee.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs">Pass Mark</span>
          </div>
          <p className="mt-2 text-sm font-medium">{course.passMark}%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Assigned Course Units ({courseUnits.length})</h2>
        {courseUnits.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No course units assigned yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {courseUnits.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{unit.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Lecturer: {getLecturerName(unit.lecturerId)} · {unit.creditHours} credit hours
                  </p>
                </div>
                <Badge
                  variant={
                    unit.status === "active"
                      ? "default"
                      : unit.status === "pending_approval"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {unit.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
