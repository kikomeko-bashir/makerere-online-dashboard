import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";

import type { Intake } from "@/lib/types";
import { mockIntakes, mockCourses } from "@/lib/mock-data";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const intakeSchema = z
  .object({
    name: z.string().min(1, "Intake name is required"),
    courseId: z.string().min(1, "Course is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    feeOverride: z.number().optional(),
    status: z.enum(["active", "inactive"]),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type IntakeFormData = {
  name: string;
  courseId: string;
  startDate: string;
  endDate: string;
  capacity: number;
  feeOverride?: number;
  status: "active" | "inactive";
};

const emptyForm: IntakeFormData = {
  name: "",
  courseId: "",
  startDate: "",
  endDate: "",
  capacity: 50,
  feeOverride: undefined,
  status: "active",
};

export default function DashboardIntakes() {
  const navigate = useNavigate();
  const [intakes, setIntakes] = useState<Intake[]>([...mockIntakes]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingIntake, setEditingIntake] = useState<Intake | null>(null);
  const [deletingIntake, setDeletingIntake] = useState<Intake | null>(null);
  const [formData, setFormData] = useState<IntakeFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const getCourseName = (courseId: string) => {
    const course = mockCourses.find((c) => c.id === courseId);
    return course?.title ?? "Unknown";
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  const columns: ColumnDef<Intake>[] = [
    { key: "name", header: "Intake Name" },
    {
      key: "courseId",
      header: "Course",
      render: (row) => getCourseName(row.courseId),
    },
    {
      key: "startDate",
      header: "Start Date",
      render: (row) => formatDate(row.startDate),
    },
    {
      key: "endDate",
      header: "End Date",
      render: (row) => formatDate(row.endDate),
    },
    { key: "capacity", header: "Capacity" },
    { key: "enrolledCount", header: "Enrolled" },
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

  const openEditForm = (intake: Intake) => {
    setEditingIntake(intake);
    setFormData({
      name: intake.name,
      courseId: intake.courseId,
      startDate: intake.startDate,
      endDate: intake.endDate,
      capacity: intake.capacity,
      feeOverride: intake.feeOverride,
      status: intake.status,
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDeleteDialog = (intake: Intake) => {
    setDeletingIntake(intake);
    setDeleteOpen(true);
  };

  const handleSubmit = () => {
    const result = intakeSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (editingIntake) {
      setIntakes((prev) =>
        prev.map((i) =>
          i.id === editingIntake.id
            ? {
                ...i,
                name: result.data.name,
                courseId: result.data.courseId,
                startDate: result.data.startDate,
                endDate: result.data.endDate,
                capacity: result.data.capacity,
                feeOverride: result.data.feeOverride,
                status: result.data.status,
              }
            : i,
        ),
      );
      toast.success("Intake updated successfully");
    } else {
      const newIntake: Intake = {
        id: `intake-${Date.now()}`,
        name: result.data.name,
        courseId: result.data.courseId,
        startDate: result.data.startDate,
        endDate: result.data.endDate,
        capacity: result.data.capacity,
        enrolledCount: 0,
        feeOverride: result.data.feeOverride,
        status: result.data.status,
      };
      setIntakes((prev) => [...prev, newIntake]);
      toast.success("Intake created successfully");
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deletingIntake) {
      setIntakes((prev) => prev.filter((i) => i.id !== deletingIntake.id));
      toast.success("Intake deleted successfully");
      setDeleteOpen(false);
      setDeletingIntake(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intake Management"
        description="Manage student intakes and cohorts."
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Intake
        </Button>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={intakes as unknown as Record<string, unknown>[]}
          searchableFields={["name"]}
          searchPlaceholder="Search intakes..."
          rowActions={(row) => {
            const intake = row as unknown as Intake;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => navigate(`/dashboard/intakes/${intake.id}`)}
                  >
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEditForm(intake)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => openDeleteDialog(intake)}
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
        title={editingIntake ? "Edit Intake" : "Add Intake"}
        description={editingIntake ? "Update intake details." : "Create a new intake."}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intake-name">Intake Name</Label>
            <Input
              id="intake-name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. January 2025 Intake"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intake-start">Start Date</Label>
              <Input
                id="intake-start"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="intake-end">End Date</Label>
              <Input
                id="intake-end"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
              />
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intake-capacity">Maximum Capacity</Label>
            <Input
              id="intake-capacity"
              type="number"
              min={1}
              value={formData.capacity}
              onChange={(e) =>
                setFormData((f) => ({ ...f, capacity: Number(e.target.value) }))
              }
            />
            {errors.capacity && <p className="text-xs text-destructive">{errors.capacity}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="intake-fee-override">Fee Override (UGX, optional)</Label>
            <Input
              id="intake-fee-override"
              type="number"
              min={0}
              value={formData.feeOverride ?? ""}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  feeOverride: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              placeholder="Leave empty to use course fee"
            />
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
        title="Delete Intake"
        description={`Are you sure you want to delete "${deletingIntake?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
