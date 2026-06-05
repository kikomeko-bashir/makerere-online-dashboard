import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { api, type ApiCourse, type ApiSchool, type ApiCourseUnit } from "@/lib/api";
import { resolveImageUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  school_id: z.string().min(1, "School is required"),
  duration: z.number().min(1, "Duration must be at least 1"),
  duration_unit: z.enum(["months", "years"]),
  fee: z.number().min(0, "Fee must be positive"),
  pass_mark: z.number().min(0, "Pass mark must be 0-100").max(100, "Pass mark must be 0-100"),
  status: z.enum(["active", "inactive"]),
  image_url: z.string().min(1, "Course image URL is required"),
  unit_ids: z.array(z.string()).min(1, "At least one course unit is required"),
});

type CourseFormData = z.infer<typeof courseSchema> & { imageFile?: File | null };

const emptyForm: CourseFormData = {
  title: "",
  description: "",
  school_id: "",
  duration: 12,
  duration_unit: "months",
  fee: 0,
  pass_mark: 50,
  status: "active",
  image_url: "",
  unit_ids: [],
  imageFile: null,
};

export default function DashboardCourses() {
  const { user } = useAuth();

  if (user.role === "student") {
    return <StudentCoursesView />;
  }

  return <AdminCoursesView />;
}

// ─── Student View ──────────────────────────────────────────────────────────────

function StudentCoursesView() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      const [enrollments, allCourses] = await Promise.all([
        api.getEnrollments(),
        api.getCourses(),
      ]);
      // Get course IDs from enrollments
      const enrolledCourseIds = enrollments.map((e) => e.course_id);
      const myCourses = allCourses.filter((c) => enrolledCourseIds.includes(c.id));
      setCourses(myCourses);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Courses" description="Courses you are enrolled in." />

      {courses.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
          <p className="font-medium">No courses yet</p>
          <p className="mt-1 text-sm">Enroll in an intake to start learning.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft hover:shadow-elegant transition-all cursor-pointer"
              onClick={() => navigate(`/dashboard/my-courses/${course.id}`)}
            >
              <div className="relative h-40 overflow-hidden bg-muted">
                <img
                  src={resolveImageUrl(course.image_url) || "/assets/makerere-logo.png"}
                  alt={course.title}
                  className={`h-full w-full ${course.image_url ? "object-cover" : "object-contain p-8 opacity-30"} group-hover:scale-105 transition-transform duration-500`}
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-card/90 text-foreground text-xs font-semibold">
                    {course.fee === 0 ? "Free" : `UGX ${course.fee.toLocaleString()}`}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-base font-semibold leading-tight line-clamp-2">
                  {course.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {course.description || "No description"}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{course.duration} {course.duration_unit}</span>
                  <span>Pass: {course.pass_mark}%</span>
                </div>
                <Badge variant="default" className="mt-2 w-fit">Enrolled</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin View ────────────────────────────────────────────────────────────────

function AdminCoursesView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user.role === "super_admin";

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [schools, setSchools] = useState<ApiSchool[]>([]);
  const [courseUnits, setCourseUnits] = useState<ApiCourseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ApiCourse | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<ApiCourse | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [coursesData, schoolsData, unitsData] = await Promise.all([
        api.getCourses(),
        api.getSchools(),
        api.getCourseUnits(),
      ]);
      setCourses(coursesData);
      setSchools(schoolsData);
      setCourseUnits(unitsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSchoolName = (schoolId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    return school?.name ?? "Unknown";
  };

  const formatFee = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const columns: ColumnDef<Record<string, unknown>>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <button
          className="text-left font-medium text-primary hover:underline"
          onClick={() => navigate(`/dashboard/courses/${(row as unknown as ApiCourse).id}`)}
        >
          {(row as unknown as ApiCourse).title}
        </button>
      ),
    },
    {
      key: "school_id",
      header: "School",
      render: (row) => getSchoolName(row.school_id as string),
    },
    {
      key: "duration",
      header: "Duration",
      render: (row) => `${row.duration} ${row.duration_unit}`,
    },
    {
      key: "fee",
      header: "Fee",
      render: (row) => formatFee(row.fee as number),
    },
    {
      key: "pass_mark",
      header: "Pass Mark",
      render: (row) => `${row.pass_mark}%`,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={row.status === "active" ? "default" : "secondary"}>
          {row.status as string}
        </Badge>
      ),
    },
  ];

  const openCreateForm = () => {
    setEditingCourse(null);
    setFormData(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEditForm = async (course: ApiCourse) => {
    setEditingCourse(course);
    // Fetch linked unit IDs from junction table
    let linkedUnitIds: string[] = [];
    try {
      linkedUnitIds = await api.getCourseUnitIds(course.id);
    } catch {
      // Fallback: no units linked
    }
    setFormData({
      title: course.title,
      description: course.description,
      school_id: course.school_id,
      duration: course.duration,
      duration_unit: course.duration_unit as "months" | "years",
      fee: course.fee,
      pass_mark: course.pass_mark,
      status: course.status as "active" | "inactive",
      image_url: course.image_url || "",
      unit_ids: linkedUnitIds,
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDeleteDialog = (course: ApiCourse) => {
    setDeletingCourse(course);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    // If new image file selected, we need to upload it first
    let imageUrl = formData.image_url;

    // For new courses, require image file; for edits, existing image_url is fine
    if (formData.imageFile) {
      // Will upload below
    } else if (!editingCourse && !formData.image_url) {
      setErrors({ image_url: "Course image is required" });
      return;
    }

    const result = courseSchema.safeParse({
      ...formData,
      image_url: formData.imageFile ? "pending_upload" : formData.image_url,
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CourseFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof CourseFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setSubmitting(true);

      // Upload image file if selected
      if (formData.imageFile) {
        const uploadResult = await api.uploadImage(formData.imageFile);
        imageUrl = uploadResult.url;
      }

      if (editingCourse) {
        const updated = await api.updateCourse(editingCourse.id, {
          title: result.data.title,
          description: result.data.description ?? "",
          school_id: result.data.school_id,
          duration: result.data.duration,
          duration_unit: result.data.duration_unit,
          fee: result.data.fee,
          pass_mark: result.data.pass_mark,
          status: result.data.status,
          image_url: imageUrl,
          unit_ids: result.data.unit_ids,
        });
        setCourses((prev) =>
          prev.map((c) => (c.id === editingCourse.id ? updated : c)),
        );
        toast.success("Course updated successfully");
      } else {
        const created = await api.createCourse({
          title: result.data.title,
          description: result.data.description ?? "",
          school_id: result.data.school_id,
          duration: result.data.duration,
          duration_unit: result.data.duration_unit,
          fee: result.data.fee,
          pass_mark: result.data.pass_mark,
          status: result.data.status,
          image_url: imageUrl,
          unit_ids: result.data.unit_ids,
        });
        setCourses((prev) => [created, ...prev]);
        toast.success("Course created successfully");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    try {
      await api.deleteCourse(deletingCourse.id);
      setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id));
      toast.success("Course deleted successfully");
      setDeleteOpen(false);
      setDeletingCourse(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchData} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management"
        description="Create, edit, and manage courses."
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns}
          data={courses as unknown as Record<string, unknown>[]}
          searchableFields={["title"]}
          searchPlaceholder="Search courses..."
          rowActions={(row) => {
            const course = row as unknown as ApiCourse;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/dashboard/courses/${course.id}`)}>
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEditForm(course)}>
                    Edit
                  </DropdownMenuItem>
                  {isSuperAdmin && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => openDeleteDialog(course)}
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }}
        />
      </div>

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingCourse ? "Edit Course" : "Create Course"}
        description={editingCourse ? "Update course details." : "Create a new course."}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course-title">Title</Label>
            <Input
              id="course-title"
              value={formData.title}
              onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Bachelor of Science in Computer Science"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              placeholder="Course description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-image">Course Image <span className="text-destructive">*</span></Label>
            <Input
              id="course-image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) {
                  setFormData((f) => ({ ...f, imageFile: file, image_url: URL.createObjectURL(file) }));
                }
              }}
            />
            {formData.image_url && (
              <div className="mt-2 rounded-lg border overflow-hidden h-32 w-full">
                <img
                  src={formData.image_url}
                  alt="Course preview"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            {!editingCourse && !formData.image_url && (
              <p className="text-xs text-muted-foreground">Upload an image for the course (JPEG, PNG, GIF, WebP — max 5MB)</p>
            )}
            {errors.image_url && <p className="text-xs text-destructive">{errors.image_url}</p>}
          </div>

          <div className="space-y-2">
            <Label>School</Label>
            <Select
              value={formData.school_id}
              onValueChange={(val) => setFormData((f) => ({ ...f, school_id: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.school_id && <p className="text-xs text-destructive">{errors.school_id}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-duration">Duration</Label>
              <Input
                id="course-duration"
                type="number"
                min={1}
                value={formData.duration}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, duration: Number(e.target.value) }))
                }
              />
              {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={formData.duration_unit}
                onValueChange={(val) =>
                  setFormData((f) => ({ ...f, duration_unit: val as "months" | "years" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-fee">Fee (UGX)</Label>
              <Input
                id="course-fee"
                type="number"
                min={0}
                value={formData.fee}
                onChange={(e) => setFormData((f) => ({ ...f, fee: Number(e.target.value) }))}
              />
              {errors.fee && <p className="text-xs text-destructive">{errors.fee}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-passmark">Pass Mark (%)</Label>
              <Input
                id="course-passmark"
                type="number"
                min={0}
                max={100}
                value={formData.pass_mark}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, pass_mark: Number(e.target.value) }))
                }
              />
              {errors.pass_mark && <p className="text-xs text-destructive">{errors.pass_mark}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Course Units (select at least one)</Label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
              {courseUnits.length === 0 ? (
                <p className="text-xs text-muted-foreground">No available course units. Create course units first.</p>
              ) : (
                courseUnits.map((unit) => (
                    <div key={unit.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`unit-${unit.id}`}
                        checked={formData.unit_ids.includes(unit.id)}
                        onCheckedChange={(checked) => {
                          setFormData((f) => ({
                            ...f,
                            unit_ids: checked
                              ? [...f.unit_ids, unit.id]
                              : f.unit_ids.filter((id) => id !== unit.id),
                          }));
                        }}
                      />
                      <label htmlFor={`unit-${unit.id}`} className="text-sm">
                        {unit.title}
                      </label>
                    </div>
                  ))
              )}
            </div>
            {errors.unit_ids && <p className="text-xs text-destructive">{errors.unit_ids}</p>}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val) =>
                setFormData((f) => ({ ...f, status: val as "active" | "inactive" }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {submitting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </div>
          )}
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Course"
        description={`Are you sure you want to delete "${deletingCourse?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
