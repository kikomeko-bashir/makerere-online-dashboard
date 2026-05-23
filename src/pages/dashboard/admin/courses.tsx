import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import type { Course } from "@/lib/types";
import { mockCourses, mockSchools, mockCourseUnits } from "@/lib/mock-data";
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
  schoolId: z.string().min(1, "School is required"),
  duration: z.number().min(1, "Duration must be at least 1"),
  durationUnit: z.enum(["months", "years"]),
  fee: z.number().min(0, "Fee must be positive"),
  passMark: z.number().min(0, "Pass mark must be 0-100").max(100, "Pass mark must be 0-100"),
  unitIds: z.array(z.string()),
  status: z.enum(["active", "inactive"]),
});

type CourseFormData = z.infer<typeof courseSchema>;

const emptyForm: CourseFormData = {
  title: "",
  description: "",
  schoolId: "",
  duration: 12,
  durationUnit: "months",
  fee: 0,
  passMark: 50,
  unitIds: [],
  status: "active",
};

export default function DashboardCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([...mockCourses]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});

  const getSchoolName = (schoolId: string) => {
    const school = mockSchools.find((s) => s.id === schoolId);
    return school?.name ?? "Unknown";
  };

  const formatFee = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const columns: ColumnDef<Course>[] = [
    { key: "title", header: "Title" },
    {
      key: "schoolId",
      header: "School",
      render: (row) => getSchoolName(row.schoolId),
    },
    {
      key: "duration",
      header: "Duration",
      render: (row) => `${row.duration} ${row.durationUnit}`,
    },
    {
      key: "fee",
      header: "Fee",
      render: (row) => formatFee(row.fee),
    },
    { key: "passMark", header: "Pass Mark", render: (row) => `${row.passMark}%` },
    {
      key: "unitIds",
      header: "Units",
      render: (row) => row.unitIds.length,
    },
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
    setEditingCourse(null);
    setFormData(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEditForm = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      schoolId: course.schoolId,
      duration: course.duration,
      durationUnit: course.durationUnit,
      fee: course.fee,
      passMark: course.passMark,
      unitIds: course.unitIds,
      status: course.status,
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDeleteDialog = (course: Course) => {
    setDeletingCourse(course);
    setDeleteOpen(true);
  };

  const handleSubmit = () => {
    const result = courseSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CourseFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof CourseFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (editingCourse) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourse.id
            ? { ...c, ...result.data, description: result.data.description ?? "" }
            : c,
        ),
      );
      toast.success("Course updated successfully");
    } else {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: result.data.title,
        description: result.data.description ?? "",
        schoolId: result.data.schoolId,
        duration: result.data.duration,
        durationUnit: result.data.durationUnit,
        fee: result.data.fee,
        passMark: result.data.passMark,
        unitIds: result.data.unitIds,
        status: result.data.status,
      };
      setCourses((prev) => [...prev, newCourse]);
      toast.success("Course created successfully");
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deletingCourse) {
      setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id));
      toast.success("Course deleted successfully");
      setDeleteOpen(false);
      setDeletingCourse(null);
    }
  };

  const toggleUnit = (unitId: string) => {
    setFormData((f) => ({
      ...f,
      unitIds: f.unitIds.includes(unitId)
        ? f.unitIds.filter((id) => id !== unitId)
        : [...f.unitIds, unitId],
    }));
  };

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
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={courses as unknown as Record<string, unknown>[]}
          searchableFields={["title"]}
          searchPlaceholder="Search courses..."
          rowActions={(row) => {
            const course = row as unknown as Course;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                  >
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEditForm(course)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => openDeleteDialog(course)}
                  >
                    Delete
                  </DropdownMenuItem>
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
            <Label>School</Label>
            <Select
              value={formData.schoolId}
              onValueChange={(val) => setFormData((f) => ({ ...f, schoolId: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select school" />
              </SelectTrigger>
              <SelectContent>
                {mockSchools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.schoolId && <p className="text-xs text-destructive">{errors.schoolId}</p>}
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
                value={formData.durationUnit}
                onValueChange={(val) =>
                  setFormData((f) => ({ ...f, durationUnit: val as "months" | "years" }))
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
                value={formData.passMark}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, passMark: Number(e.target.value) }))
                }
              />
              {errors.passMark && <p className="text-xs text-destructive">{errors.passMark}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Course Units</Label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
              {mockCourseUnits.map((unit) => (
                <div key={unit.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`unit-${unit.id}`}
                    checked={formData.unitIds.includes(unit.id)}
                    onCheckedChange={() => toggleUnit(unit.id)}
                  />
                  <label htmlFor={`unit-${unit.id}`} className="text-sm">
                    {unit.title}
                  </label>
                </div>
              ))}
            </div>
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
