import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Clock, Users, CalendarDays, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  api,
  resolveImageUrl,
  type ApiCourse,
  type ApiIntake,
  type ApiEnrollment,
} from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function StudentAvailableCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [intakes, setIntakes] = useState<ApiIntake[]>([]);
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Enrollment dialog
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [coursesData, intakesData, enrollmentsData] = await Promise.all([
        api.getCourses(),
        api.getIntakes(),
        api.getEnrollments(),
      ]);
      setCourses(coursesData);
      setIntakes(intakesData);
      setEnrollments(enrollmentsData);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  // Check if student is already enrolled in a course within an intake
  function isAlreadyEnrolled(courseId: string, intakeId: string): boolean {
    return enrollments.some(
      (e) => e.course_id === courseId && e.intake_id === intakeId && e.status !== "dropped",
    );
  }

  // Get intakes that include the selected course and have open enrollment
  function getAvailableIntakes(): ApiIntake[] {
    if (!selectedCourse) return [];
    const today = new Date().toISOString().split("T")[0];
    return intakes.filter(
      (intake) =>
        intake.status === "active" &&
        intake.course_ids.includes(selectedCourse.id) &&
        intake.enrollment_deadline >= today &&
        intake.enrolled_count < intake.capacity,
    );
  }

  function handleEnrollClick(course: ApiCourse) {
    setSelectedCourse(course);
    setEnrollDialogOpen(true);
  }

  async function handleEnroll(intakeId: string) {
    if (!selectedCourse) return;
    setEnrolling(true);
    try {
      await api.createEnrollment(intakeId, selectedCourse.id);
      toast.success("Enrolled successfully!", {
        description: `You have been enrolled in ${selectedCourse.title}. Complete payment to activate.`,
      });
      setEnrollDialogOpen(false);
      // Refresh enrollments
      const updatedEnrollments = await api.getEnrollments();
      setEnrollments(updatedEnrollments);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  }

  // Check if student is enrolled in this course (any intake)
  function getEnrollmentStatus(courseId: string): string | null {
    const enrollment = enrollments.find(
      (e) => e.course_id === courseId && e.status !== "dropped",
    );
    if (!enrollment) return null;
    return enrollment.status;
  }

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
        title="Available Courses"
        description="Browse and enroll in courses. Select a course and choose an intake to get started."
      />

      {courses.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
          <BookOpen className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium">No courses available</p>
          <p className="mt-1 text-sm">Check back later for new programs.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const status = getEnrollmentStatus(course.id);
            return (
              <div
                key={course.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft hover:shadow-elegant transition-all"
              >
                <div className="relative h-40 overflow-hidden bg-muted">
                  <img
                    src={resolveImageUrl(course.image_url) || "/assets/makerere-logo.png"}
                    alt={course.title}
                    className={`h-full w-full ${course.image_url ? "object-cover" : "object-contain p-8 opacity-30"} group-hover:scale-105 transition-transform duration-500`}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="secondary"
                      className="bg-card/90 text-foreground text-xs font-semibold"
                    >
                      {course.fee === 0 ? "Free" : `UGX ${course.fee.toLocaleString()}`}
                    </Badge>
                  </div>
                  {status && (
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={
                          status === "active"
                            ? "bg-green-100 text-green-800 border-transparent"
                            : "bg-yellow-100 text-yellow-800 border-transparent"
                        }
                      >
                        {status === "active" ? "Enrolled" : "Pending Payment"}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-base font-semibold leading-tight line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {course.description || "No description"}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration} {course.duration_unit}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Pass: {course.pass_mark}%
                    </span>
                  </div>
                  <div className="mt-auto pt-3">
                    {status === "active" ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/dashboard/my-courses/${course.id}`)}
                      >
                        View Course
                      </Button>
                    ) : status === "payment_pending" ? (
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => navigate("/dashboard/enrollment")}
                      >
                        Complete Payment
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleEnrollClick(course)}
                      >
                        Enroll Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Intake Selection Dialog ──────────────────────────────────────── */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose an Intake</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Select an available intake to enroll in{" "}
              <strong>{selectedCourse?.title}</strong>:
            </p>
            {getAvailableIntakes().length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/50 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No intakes with open enrollment are available for this course right now.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {getAvailableIntakes().map((intake) => {
                  const alreadyEnrolled = isAlreadyEnrolled(
                    selectedCourse!.id,
                    intake.id,
                  );
                  return (
                    <div
                      key={intake.id}
                      className="rounded-xl border border-border p-4 hover:border-primary/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{intake.name}</h4>
                          <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                            <p className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {format(new Date(intake.start_date), "MMM d, yyyy")} –{" "}
                              {format(new Date(intake.end_date), "MMM d, yyyy")}
                            </p>
                            <p>
                              Year {intake.year_level} ·{" "}
                              {intake.capacity - intake.enrolled_count} spots left
                            </p>
                            <p className="text-yellow-700">
                              Deadline:{" "}
                              {format(
                                new Date(intake.enrollment_deadline),
                                "MMM d, yyyy",
                              )}
                            </p>
                          </div>
                        </div>
                        {alreadyEnrolled ? (
                          <Badge variant="secondary" className="text-xs">
                            Already Enrolled
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleEnroll(intake.id)}
                            disabled={enrolling}
                          >
                            {enrolling ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Enroll"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
