import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users, Loader2, CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { api, resolveImageUrl, type ApiCourse, type ApiIntake } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Courses() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [intakes, setIntakes] = useState<ApiIntake[]>([]);
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
      const [coursesData, intakesData] = await Promise.all([
        api.getPublicCourses(),
        api.getPublicIntakes(),
      ]);
      setCourses(coursesData);
      setIntakes(intakesData);
    } catch {
      // Silently fail — will show empty state
    } finally {
      setLoading(false);
    }
  }

  function handleEnrollClick(course: ApiCourse) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setSelectedCourse(course);
    setEnrollDialogOpen(true);
  }

  // Get intakes that include the selected course
  function getAvailableIntakes(): ApiIntake[] {
    if (!selectedCourse) return [];
    return intakes.filter((intake) => intake.course_ids.includes(selectedCourse.id));
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
      navigate("/dashboard/enrollment");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <>
      <section className="bg-hero-gradient py-20">
        <div className="container-tight">
          <span className="text-xs uppercase tracking-[0.25em] text-gold">Catalog</span>
          <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold text-cream max-w-3xl">
            Find a course worthy of your ambition.
          </h1>
          <p className="mt-5 text-cream/80 max-w-xl">
            Accredited, taught by experts, and built for the devices you already own.
          </p>
        </div>
      </section>

      <section className="container-tight py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">No courses available yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Check back soon for new programs.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <article
                key={course.id}
                className="group rounded-2xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={resolveImageUrl(course.image_url) || "/assets/makerere-logo.png"}
                    alt={course.title}
                    loading="lazy"
                    className={`h-full w-full ${course.image_url ? "object-cover" : "object-contain p-8 opacity-30"} group-hover:scale-105 transition duration-700`}
                  />
                  <span className="absolute top-3 right-3 text-xs bg-background/95 text-foreground px-2.5 py-1 rounded-full font-semibold">
                    {course.fee === 0 ? "Free" : `UGX ${course.fee.toLocaleString()}`}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold leading-snug line-clamp-2">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {course.duration} {course.duration_unit}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Pass: {course.pass_mark}%
                    </span>
                  </div>
                  <Button
                    className="mt-5 w-full"
                    onClick={() => handleEnrollClick(course)}
                  >
                    Enroll Now
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ─── Intake Selection Dialog ──────────────────────────────────────── */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose an Intake</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Select an available intake to enroll in <strong>{selectedCourse?.title}</strong>:
            </p>
            {getAvailableIntakes().length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/50 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No intakes with open enrollment are available for this course right now.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {getAvailableIntakes().map((intake) => (
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
                            {format(new Date(intake.start_date), "MMM d, yyyy")} – {format(new Date(intake.end_date), "MMM d, yyyy")}
                          </p>
                          <p>Year {intake.year_level} · {intake.capacity - intake.enrolled_count} spots left</p>
                          <p className="text-yellow-700">
                            Deadline: {format(new Date(intake.enrollment_deadline), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleEnroll(intake.id)}
                        disabled={enrolling}
                      >
                        {enrolling ? <Loader2 className="h-3 w-3 animate-spin" /> : "Enroll"}
                      </Button>
                    </div>
                  </div>
                ))}
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
    </>
  );
}
