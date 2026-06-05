import { useEffect, useState } from "react";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { api, type ApiIntake, type ApiCourse } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type IntakeFormData = {
  name: string;
  year_level: number;
  start_date: string;
  end_date: string;
  enrollment_deadline: string;
  capacity: number;
  course_ids: string[];
  status: string;
};

const emptyForm: IntakeFormData = {
  name: "",
  year_level: 1,
  start_date: "",
  end_date: "",
  enrollment_deadline: "",
  capacity: 100,
  course_ids: [],
  status: "active",
};

export default function DashboardIntakes() {
  const { user } = useAuth();
  const isSuperAdmin = user.role === "super_admin";

  const [intakes, setIntakes] = useState<ApiIntake[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingIntake, setEditingIntake] = useState<ApiIntake | null>(null);
  const [deletingIntake, setDeletingIntake] = useState<ApiIntake | null>(null);
  const [formData, setFormData] = useState<IntakeFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [intakesData, coursesData] = await Promise.all([
        api.getIntakes(),
        api.getCourses(),
      ]);
      setIntakes(intakesData);
      setCourses(coursesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load data";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.title ?? "Unknown";
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  const columns: ColumnDef<ApiIntake>[] = [
    { key: "name", header: "Intake Name" },
    {
      key: "year_level",
      header: "Year/Level",
      render: (row) => `Year ${row.year_level}`,
    },
    {
      key: "course_ids",
      header: "Courses",
      render: (row) => (
        <span title={row.course_ids.map(getCourseName).join(", ")}>
          <Badge variant="secondary">{row.course_ids.length} course{row.course_ids.length !== 1 ? "s" : ""}</Badge>
        </span>
      ),
    },
    {
      key: "start_date",
      header: "Start Date",
      render: (row) => formatDate(row.start_date),
    },
    {
      key: "end_date",
      header: "End Date",
      render: (row) => formatDate(row.end_date),
    },
    {
      key: "enrollment_deadline",
      header: "Enrollment Deadline",
      render: (row) => formatDate(row.enrollment_deadline),
    },
    { key: "capacity", header: "Capacity" },
    { key: "enrolled_count", header: "Enrolled" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={row.status === "active" ? "default" : "secondary"}>
          {row.status}
        </Badge>
      ),
    },
  ];

  const openCreateForm = () => {
    setEditingIntake(null);
    setFormData(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEditForm = (intake: ApiIntake) => {
    setEditingIntake(intake);
    setFormData({
      name: intake.name,
      year_level: intake.year_level,
      start_date: intake.start_date,
      end_date: intake.end_date,
      enrollment_deadline: intake.enrollment_deadline,
      capacity: intake.capacity,
      course_ids: intake.course_ids,
      status: intake.status,
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDeleteDialog = (intake: ApiIntake) => {
    setDeletingIntake(intake);
    setDeleteOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Intake name is required";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }
    if (formData.start_date && formData.end_date && formData.end_date <= formData.start_date) {
      newErrors.end_date = "End date must be after start date";
    }
    if (!formData.enrollment_deadline) {
      newErrors.enrollment_deadline = "Enrollment deadline is required";
    }
    if (formData.enrollment_deadline && formData.end_date && formData.enrollment_deadline > formData.end_date) {
      newErrors.enrollment_deadline = "Deadline must be before or on end date";
    }
    if (formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    }
    if (formData.course_ids.length === 0) {
      newErrors.course_ids = "You must select at least one course";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingIntake) {
        const updated = await api.updateIntake(editingIntake.id, formData);
        setIntakes((prev) => prev.map((i) => (i.id === editingIntake.id ? updated : i)));
        toast.success("Intake updated successfully");
      } else {
        const created = await api.createIntake(formData);
        setIntakes((prev) => [created, ...prev]);
        toast.success("Intake created successfully");
      }
      setFormOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Operation failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingIntake) return;

    try {
      await api.deleteIntake(deletingIntake.id);
      setIntakes((prev) => prev.filter((i) => i.id !== deletingIntake.id));
      toast.success("Intake deleted successfully");
      setDeleteOpen(false);
      setDeletingIntake(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    }
  };

  const toggleCourse = (courseId: string) => {
    setFormData((f) => {
      const exists = f.course_ids.includes(courseId);
      return {
        ...f,
        course_ids: exists
          ? f.course_ids.filter((id) => id !== courseId)
          : [...f.course_ids, courseId],
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Intake Management"
          description="Manage student intakes and cohorts."
        />
        <div className="rounded-2xl border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intake Management"
        description="Manage student intakes and cohorts."
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create Intake
        </Button>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={intakes as unknown as Record<string, unknown>[]}
          searchableFields={["name"]}
          searchPlaceholder="Search intakes..."
          rowActions={(row) => {
            const intake = row as unknown as ApiIntake;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditForm(intake)}>
                    Edit
                  </DropdownMenuItem>
                  {isSuperAdmin && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => openDeleteDialog(intake)}
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
        title={editingIntake ? "Edit Intake" : "Create Intake"}
        description={
          editingIntake
            ? "Update intake details."
            : "Create a new intake with courses, year level, and dates."
        }
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intake-name">Intake Name</Label>
            <Input
              id="intake-name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. January 2026 Intake"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label>Year / Level</Label>
            <Select
              value={String(formData.year_level)}
              onValueChange={(val) =>
                setFormData((f) => ({ ...f, year_level: Number(val) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
                <SelectItem value="4">Year 4</SelectItem>
                <SelectItem value="5">Year 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intake-start">Start Date</Label>
              <Input
                id="intake-start"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, start_date: e.target.value }))
                }
              />
              {errors.start_date && (
                <p className="text-xs text-destructive">{errors.start_date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="intake-end">End Date</Label>
              <Input
                id="intake-end"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, end_date: e.target.value }))
                }
              />
              {errors.end_date && (
                <p className="text-xs text-destructive">{errors.end_date}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intake-capacity">Capacity</Label>
            <Input
              id="intake-capacity"
              type="number"
              min={1}
              value={formData.capacity}
              onChange={(e) =>
                setFormData((f) => ({ ...f, capacity: Number(e.target.value) }))
              }
            />
            {errors.capacity && (
              <p className="text-xs text-destructive">{errors.capacity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="intake-deadline">Enrollment Deadline</Label>
            <Input
              id="intake-deadline"
              type="date"
              value={formData.enrollment_deadline}
              onChange={(e) =>
                setFormData((f) => ({ ...f, enrollment_deadline: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">Students cannot enroll after this date.</p>
            {errors.enrollment_deadline && (
              <p className="text-xs text-destructive">{errors.enrollment_deadline}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Courses (select at least one)</Label>
            <div className="max-h-48 overflow-y-auto rounded-md border p-3 space-y-2">
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses available. Create courses first.</p>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`course-${course.id}`}
                      checked={formData.course_ids.includes(course.id)}
                      onCheckedChange={() => toggleCourse(course.id)}
                    />
                    <label
                      htmlFor={`course-${course.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {course.title}
                    </label>
                  </div>
                ))
              )}
            </div>
            {errors.course_ids && (
              <p className="text-xs text-destructive">{errors.course_ids}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData((f) => ({ ...f, status: val }))}
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
        title="Delete Intake"
        description={`Are you sure you want to delete "${deletingIntake?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
