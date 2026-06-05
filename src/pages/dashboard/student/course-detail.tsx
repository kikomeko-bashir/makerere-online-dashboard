import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  DollarSign,
  GraduationCap,
  Loader2,
  Users,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  api,
  type ApiCourse,
  type ApiCourseUnit,
  type ApiAssessment,
  type ApiVirtualClass,
} from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function StudentCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<ApiCourse | null>(null);
  const [courseUnits, setCourseUnits] = useState<ApiCourseUnit[]>([]);
  const [assessments, setAssessments] = useState<ApiAssessment[]>([]);
  const [virtualClasses, setVirtualClasses] = useState<ApiVirtualClass[]>([]);

  useEffect(() => {
    if (!courseId) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function loadData() {
    try {
      setLoading(true);

      // Fetch course
      const courses = await api.getCourses();
      const foundCourse = courses.find((c) => c.id === courseId);
      if (!foundCourse) {
        setCourse(null);
        setLoading(false);
        return;
      }

      setCourse(foundCourse);

      // Fetch student's enrolled units for this course
      const allUnits = await api.getCourseUnits();
      let linkedUnits: ApiCourseUnit[] = [];

      try {
        // Try to get unit enrollments for this student/course
        const unitEnrollments = await api.getMyUnitEnrollments(courseId!);
        const enrolledUnitIds = unitEnrollments.map((ue) => ue.course_unit_id);
        linkedUnits = allUnits.filter((u) => enrolledUnitIds.includes(u.id));
      } catch {
        // Fallback: get units from course links (for older enrollments before auto-enrollment)
        const unitIds = await api.getCourseUnitIds(courseId!).catch(() => [] as string[]);
        linkedUnits = allUnits.filter((u) => unitIds.includes(u.id));
      }

      setCourseUnits(linkedUnits);

      // Fetch virtual classes and assessments for each unit
      if (linkedUnits.length > 0) {
        const vcPromises = linkedUnits.map((u) =>
          api.getVirtualClasses(u.id).catch(() => [] as ApiVirtualClass[]),
        );
        const assessPromises = linkedUnits.map((u) =>
          api.getAssessments(u.id).catch(() => [] as ApiAssessment[]),
        );

        const [vcResults, assessResults] = await Promise.all([
          Promise.all(vcPromises),
          Promise.all(assessPromises),
        ]);

        setVirtualClasses(vcResults.flat());
        setAssessments(assessResults.flat());
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load course details");
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not found state
  if (!course) {
    return (
      <div className="space-y-6">
        <PageHeader title="Course Not Found" />
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          <p>The course you are looking for does not exist.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/courses")}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Header */}
      <PageHeader title={course.title} description={course.description}>
        <Badge variant={course.status === "active" ? "default" : "secondary"}>
          {course.status}
        </Badge>
      </PageHeader>

      {/* Tabbed content */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="units">Course Units</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        {/* ─── Details Tab ─────────────────────────────────────────── */}
        <TabsContent value="details">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            <InfoCard
              icon={<GraduationCap className="h-4 w-4" />}
              label="School"
              value={course.school_id}
            />
            <InfoCard
              icon={<Clock className="h-4 w-4" />}
              label="Duration"
              value={`${course.duration} ${course.duration_unit}`}
            />
            <InfoCard
              icon={<DollarSign className="h-4 w-4" />}
              label="Fee"
              value={`UGX ${course.fee.toLocaleString()}`}
            />
            <InfoCard
              icon={<BookOpen className="h-4 w-4" />}
              label="Pass Mark"
              value={`${course.pass_mark}%`}
            />
            <InfoCard
              icon={<CalendarDays className="h-4 w-4" />}
              label="Created"
              value={format(new Date(course.created_at), "MMM d, yyyy")}
            />
            <InfoCard icon={<Users className="h-4 w-4" />} label="Status" value={course.status} />
          </div>
          {course.description && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
              <p className="text-sm leading-relaxed">{course.description}</p>
            </div>
          )}
        </TabsContent>

        {/* ─── Course Units Tab ────────────────────────────────────── */}
        <TabsContent value="units">
          <div className="mt-4 space-y-4">
            <h2 className="text-lg font-semibold">Course Units ({courseUnits.length})</h2>

            {courseUnits.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                <p>No course units assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courseUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-soft cursor-pointer hover:border-primary/50 hover:shadow-elegant transition-all"
                    onClick={() => navigate(`/dashboard/my-courses/${courseId}/units/${unit.id}`)}
                  >
                    <div>
                      <p className="font-medium">{unit.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {unit.credit_hours} credit hours
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          unit.status === "active"
                            ? "default"
                            : unit.status === "pending_approval"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {unit.status.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">View →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Timetable Tab ───────────────────────────────────────── */}
        <TabsContent value="timetable">
          <div className="mt-4 space-y-4">
            <h2 className="text-lg font-semibold">
              Upcoming Virtual Classes ({virtualClasses.length})
            </h2>

            {virtualClasses.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                <p>No upcoming virtual classes scheduled.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {virtualClasses.map((vc) => (
                  <div
                    key={vc.id}
                    className="rounded-xl border border-border bg-card p-5 shadow-soft space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{vc.title}</h3>
                      {vc.is_live && <Badge variant="default">Live</Badge>}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Date: {format(new Date(vc.date), "MMM d, yyyy")}</p>
                      <p>Time: {vc.start_time}</p>
                      <p>Duration: {vc.duration} min</p>
                      <p>Platform: {vc.platform}</p>
                    </div>
                    {vc.meeting_link && (
                      <Button size="sm" asChild>
                        <a href={vc.meeting_link} target="_blank" rel="noopener noreferrer">
                          Join Class
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Assessments Tab ─────────────────────────────────────── */}
        <TabsContent value="assessments">
          <div className="mt-4 space-y-4">
            <h2 className="text-lg font-semibold">Assessments ({assessments.length})</h2>

            {assessments.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                <p>No assessments available.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="rounded-xl border border-border bg-card p-5 shadow-soft space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{assessment.title}</h3>
                      <Badge variant="secondary">{assessment.type}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Pass Mark: {assessment.pass_mark}%</p>
                      {assessment.time_limit && <p>Time Limit: {assessment.time_limit} min</p>}
                      {assessment.end_date && (
                        <p>Due: {format(new Date(assessment.end_date), "MMM d, yyyy")}</p>
                      )}
                      <p>Max Attempts: {assessment.max_attempts}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Helper Component ─────────────────────────────────────────────────── */

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}
