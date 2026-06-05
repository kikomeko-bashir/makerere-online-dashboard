import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { api, type ApiIntake, type ApiCourse } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString()}`;
}

export default function EnrollmentIntake() {
  const { intakeId } = useParams<{ intakeId: string }>();
  const navigate = useNavigate();

  const [intake, setIntake] = useState<ApiIntake | null>(null);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);

  useEffect(() => {
    loadData();
  }, [intakeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [intakesData, coursesData] = await Promise.all([
        api.getIntakes(),
        api.getCourses(),
      ]);
      const found = intakesData.find((i) => i.id === intakeId);
      setIntake(found || null);

      // Filter courses that belong to this intake
      if (found) {
        const intakeCourses = coursesData.filter((c) =>
          found.course_ids.includes(c.id),
        );
        setCourses(intakeCourses);
      }
    } catch {
      toast.error("Failed to load intake data");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (course: ApiCourse) => {
    setSelectedCourse(course);
    setConfirmOpen(true);
  };

  const handleConfirmEnroll = async () => {
    if (!selectedCourse || !intakeId) return;

    try {
      setEnrolling(true);
      await api.createEnrollment(intakeId, selectedCourse.id);
      toast.success("Enrolled successfully!", {
        description: `You have enrolled in "${selectedCourse.title}". Complete payment to activate.`,
      });
      setConfirmOpen(false);
      navigate("/dashboard/enrollment");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to enroll";
      toast.error(message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!intake) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard/enrollment")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-center text-muted-foreground">Intake not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/enrollment")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Intakes
        </Button>
      </div>

      <PageHeader
        title={intake.name}
        description={`Year ${intake.year_level} — Choose a course to enroll in`}
      >
        <Badge variant="default">Year {intake.year_level}</Badge>
      </PageHeader>

      {courses.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
          <BookOpen className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
          <p>No courses available in this intake.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{course.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{course.description || "No description"}</p>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 pb-3">
                <div className="text-sm text-muted-foreground">
                  Duration: {course.duration} {course.duration_unit}
                </div>
                <div className="text-sm text-muted-foreground">
                  Pass Mark: {course.pass_mark}%
                </div>
                <Badge variant={course.status === "active" ? "default" : "secondary"}>
                  {course.status}
                </Badge>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleEnrollClick(course)}>
                  Enroll in this Course
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Enrollment"
        description={
          selectedCourse
            ? `You are about to enroll in "${selectedCourse.title}" under "${intake.name}" (Year ${intake.year_level}). You will need to complete payment to activate your enrollment.`
            : ""
        }
        confirmLabel={enrolling ? "Enrolling..." : "Confirm Enrollment"}
        onConfirm={handleConfirmEnroll}
        destructive={false}
      />
    </div>
  );
}
