import { useState } from "react";
import { MoreHorizontal, Plus, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import type { CourseUnit, ApprovalStatus } from "@/lib/types";
import { mockCourseUnits, mockCourses, mockUsers } from "@/lib/mock-data";
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

const courseUnitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  courseId: z.string().min(1, "Course is required"),
  creditHours: z.number().min(1, "Credit hours must be at least 1"),
  lecturerId: z.string().min(1, "Lecturer is required"),
});

type CourseUnitFormData = z.infer<typeof courseUnitSchema>;

const emptyForm: CourseUnitFormData = {
  title: "",
  description: "",
  courseId: "",
  creditHours: 3,
  lecturerId: "",
};

export default function DashboardCourseUnits() {
  const { user } = useAuth();
  const isLecturer = user.role === "lecturer";

  const [units, setUnits] = useState<CourseUnit[]>([...mockCourseUnits]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<CourseUnit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<CourseUnit | null>(null);
  const [formData, setFormData] = useState<CourseUnitFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseUnitFormData, string>>>({});

  const lecturers = mockUsers.filter((u) => u.role === "lecturer");

  // Lecturers only see their own course units
  const displayedUnits = isLecturer
    ? units.filter((u) => u.lecturerId === user.id)
    : units;

  const getCourseName = (courseId: string) => {
    const course = mockCourses.find((c) => c.id === courseId);
    return course?.title ?? "Unknown";
  };

  const getLecturerName = (lecturerId: string) => {
    const user = mockUsers.find((u) => u.id === lecturerId);
    return user?.name ?? "Unknown";
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "pending_approval":
        return (
          <Badge className="border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending Approval
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  const columns: ColumnDef<CourseUnit>[] = [
    { key: "title", header: "Title" },
    {
      key: "courseId",
      header: "Course",
      render: (row) => getCourseName(row.courseId),
    },
    {
      key: "lecturerId",
      header: "Lecturer",
      render: (row) => getLecturerName(row.lecturerId),
    },
    { key: "creditHours", header: "Credit Hours" },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
  ];

  const openCreateForm = () => {
    setEditingUnit(null);
    setFormData(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEditForm = (unit: CourseUnit) => {
    setEditingUnit(unit);
    setFormData({
      title: unit.title,
      description: unit.description,
      courseId: unit.courseId,
      creditHours: unit.creditHours,
      lecturerId: unit.lecturerId,
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDeleteDialog = (unit: CourseUnit) => {
    setDeletingUnit(unit);
    setDeleteOpen(true);
  };

  const handleSubmit = () => {
    const dataToValidate = isLecturer
      ? { ...formData, lecturerId: user.id }
      : formData;
    const result = courseUnitSchema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CourseUnitFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof CourseUnitFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (editingUnit) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === editingUnit.id
            ? { ...u, ...result.data, description: result.data.description ?? "" }
            : u,
        ),
      );
      toast.success("Course unit updated successfully");
    } else {
      const newUnit: CourseUnit = {
        id: `unit-${Date.now()}`,
        title: result.data.title,
        description: result.data.description ?? "",
        courseId: result.data.courseId,
        creditHours: result.data.creditHours,
        lecturerId: isLecturer ? user.id : result.data.lecturerId,
        status: isLecturer ? "pending_approval" : "active",
      };
      setUnits((prev) => [...prev, newUnit]);
      toast.success(
        isLecturer
          ? "Course unit submitted for approval"
          : "Course unit created successfully",
      );
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deletingUnit) {
      setUnits((prev) => prev.filter((u) => u.id !== deletingUnit.id));
      toast.success("Course unit deleted successfully");
      setDeleteOpen(false);
      setDeletingUnit(null);
    }
  };

  const handleApprove = (unit: CourseUnit) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unit.id ? { ...u, status: "active" as ApprovalStatus } : u)),
    );
    toast.success(`"${unit.title}" has been approved`);
  };

  const handleReject = (unit: CourseUnit) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unit.id ? { ...u, status: "rejected" as ApprovalStatus } : u)),
    );
    toast.success(`"${unit.title}" has been rejected`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLecturer ? "My Course Units" : "Course Units"}
        description={isLecturer ? "Manage your course units and modules." : "Manage course units and modules."}
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course Unit
        </Button>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={displayedUnits as unknown as Record<string, unknown>[]}
          searchableFields={["title"]}
          searchPlaceholder="Search course units..."
          rowActions={(row) => {
            const unit = row as unknown as CourseUnit;
            return (
              <div className="flex items-center justify-end gap-1">
                {!isLecturer && unit.status === "pending_approval" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => handleApprove(unit)}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleReject(unit)}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditForm(unit)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => openDeleteDialog(unit)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          }}
        />
      </div>

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingUnit ? "Edit Course Unit" : "Add Course Unit"}
        description={editingUnit ? "Update course unit details." : "Create a new course unit."}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unit-title">Title</Label>
            <Input
              id="unit-title"
              value={formData.title}
              onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Data Structures and Algorithms"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit-description">Description</Label>
            <Textarea
              id="unit-description"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the course unit"
            />
          </div>

          <div className="space-y-2">
            <Label>Course</Label>
            <Select
              value={formData.courseId}
              onValueChange={(val) => setFormData((f) => ({ ...f, courseId: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {mockCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.courseId && <p className="text-xs text-destructive">{errors.courseId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit-credit-hours">Credit Hours</Label>
            <Input
              id="unit-credit-hours"
              type="number"
              min={1}
              value={formData.creditHours}
              onChange={(e) =>
                setFormData((f) => ({ ...f, creditHours: Number(e.target.value) }))
              }
            />
            {errors.creditHours && (
              <p className="text-xs text-destructive">{errors.creditHours}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Lecturer</Label>
            {isLecturer ? (
              <Input value={user.name} disabled />
            ) : (
              <Select
                value={formData.lecturerId}
                onValueChange={(val) => setFormData((f) => ({ ...f, lecturerId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lecturer" />
                </SelectTrigger>
                <SelectContent>
                  {lecturers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.lecturerId && (
              <p className="text-xs text-destructive">{errors.lecturerId}</p>
            )}
          </div>
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Course Unit"
        description={`Are you sure you want to delete "${deletingUnit?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
