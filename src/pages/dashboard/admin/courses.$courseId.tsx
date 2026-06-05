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
  Plus,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  api,
  type ApiCourse,
  type ApiCourseUnit,
  type ApiSchool,
  type ApiEnrollment,
  resolveImageUrl,
} from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DashboardCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<ApiCourse | null>(null);
  const [school, setSchool] = useState<ApiSchool | null>(null);
  const [courseUnits, setCourseUnits] = useState<ApiCourseUnit[]>([]);
  const [allUnits, setAllUnits] = useState<ApiCourseUnit[]>([]);
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([]);

  // Add unit dialog state
  const [addUnitOpen, setAddUnitOpen] = useState(false);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Image edit state
  const [editingImage, setEditingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [savingImage, setSavingImage] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function loadData() {
    try {
      setLoading(true);

      const courses = await api.getCourses();
      const foundCourse = courses.find((c) => c.id === courseId);
      if (!foundCourse) {
        setCourse(null);
        setLoading(false);
        return;
      }

      setCourse(foundCourse);

      const schools = await api.getSchools().catch(() => [] as ApiSchool[]);
      const foundSchool = schools.find((s) => s.id === foundCourse.school_id);
      setSchool(foundSchool ?? null);

      const units = await api.getCourseUnits();
      setAllUnits(units);

      const unitIds = await api.getCourseUnitIds(courseId!).catch(() => [] as string[]);
      const linkedUnits = units.filter((u) => unitIds.includes(u.id));
      setCourseUnits(linkedUnits);

      // Fetch enrollments for this course
      const allEnrollments = await api.getEnrollments();
      setEnrollments(allEnrollments.filter((e) => e.course_id === courseId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load course details");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUnits() {
    if (!courseId || selectedUnitIds.length === 0) return;
    try {
      setSaving(true);
      const existingIds = courseUnits.map((u) => u.id);
      const newIds = [...existingIds, ...selectedUnitIds];
      await api.updateCourse(courseId, { unit_ids: newIds });
      toast.success("Units added successfully");
      setAddUnitOpen(false);
      setSelectedUnitIds([]);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add units");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveImage() {
    if (!courseId || !imageFile) return;
    try {
      setSavingImage(true);
      const uploadResult = await api.uploadImage(imageFile);
      const updated = await api.updateCourse(courseId, { image_url: uploadResult.url });
      setCourse(updated);
      setEditingImage(false);
      setImageFile(null);
      setImagePreview("");
      toast.success("Course image updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update image");
    } finally {
      setSavingImage(false);
    }
  }

  async function handleRemoveUnit(unitId: string) {
    if (!courseId) return;
    try {
      const remainingIds = courseUnits.map((u) => u.id).filter((id) => id !== unitId);
      await api.updateCourse(courseId, { unit_ids: remainingIds });
      toast.success("Unit removed");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove unit");
    }
  }

  function toggleUnitSelection(unitId: string) {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId],
    );
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

  // Available units for adding (not already linked)
  const linkedIds = courseUnits.map((u) => u.id);
  const availableUnits = allUnits.filter((u) => !linkedIds.includes(u.id));

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
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>

        {/* ─── Details Tab ─────────────────────────────────────────── */}
        <TabsContent value="details">
          {/* Course Image */}
          <div className="mt-4 rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
            <div className="relative h-48 bg-muted">
              <img
                src={resolveImageUrl(course.image_url) || "/assets/makerere-logo.png"}
                alt={course.title}
                className={`h-full w-full ${course.image_url ? "object-cover" : "object-contain p-8 opacity-30"}`}
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-3 right-3"
                onClick={() => { setImageFile(null); setImagePreview(""); setEditingImage(true); }}
              >
                Change Image
              </Button>
            </div>
            {editingImage && (
              <div className="p-4 border-t space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="image-file-edit">Upload New Image</Label>
                  <Input
                    id="image-file-edit"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setImageFile(file);
                      if (file) {
                        setImagePreview(URL.createObjectURL(file));
                      } else {
                        setImagePreview("");
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">JPEG, PNG, GIF, WebP — max 5MB</p>
                </div>
                {imagePreview && (
                  <div className="rounded-lg border overflow-hidden h-32 w-48">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveImage} disabled={savingImage || !imageFile}>
                    {savingImage ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                    Upload & Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingImage(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            <InfoCard
              icon={<GraduationCap className="h-4 w-4" />}
              label="School"
              value={school?.name ?? "Unknown"}
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Course Units ({courseUnits.length})</h2>
              <Button
                size="sm"
                onClick={() => setAddUnitOpen(true)}
                disabled={availableUnits.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Unit
              </Button>
            </div>

            {courseUnits.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                <p>No course units assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courseUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-soft"
                  >
                    <div>
                      <p className="font-medium">{unit.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {unit.credit_hours} credit hours
                        {unit.lecturer_id && ` · Lecturer assigned`}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUnit(unit.id)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Enrollments Tab ─────────────────────────────────────── */}
        <TabsContent value="enrollments">
          <div className="mt-4 space-y-4">
            <h2 className="text-lg font-semibold">Enrollments ({enrollments.length})</h2>

            {enrollments.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                <p>No enrollments for this course yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Student ID</th>
                      <th className="px-4 py-3 text-left font-medium">Intake</th>
                      <th className="px-4 py-3 text-left font-medium">Enrollment Date</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td className="px-4 py-3 font-mono text-xs">{enrollment.student_id}</td>
                        <td className="px-4 py-3">{enrollment.intake_id || "—"}</td>
                        <td className="px-4 py-3">
                          {format(new Date(enrollment.enrollment_date), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={enrollment.status === "active" ? "default" : "secondary"}
                          >
                            {enrollment.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              enrollment.payment_status === "completed"
                                ? "default"
                                : enrollment.payment_status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {enrollment.payment_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Add Unit Dialog ───────────────────────────────────────── */}
      <Dialog open={addUnitOpen} onOpenChange={setAddUnitOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Course Units</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {availableUnits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available units to add.</p>
            ) : (
              availableUnits.map((unit) => (
                <label
                  key={unit.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedUnitIds.includes(unit.id)}
                    onCheckedChange={() => toggleUnitSelection(unit.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{unit.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {unit.credit_hours} credit hours
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddUnitOpen(false);
                setSelectedUnitIds([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUnits} disabled={selectedUnitIds.length === 0 || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add {selectedUnitIds.length > 0 ? `(${selectedUnitIds.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
