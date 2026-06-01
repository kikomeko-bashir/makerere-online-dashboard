import { useState, useEffect } from "react";
import { MoreHorizontal, Plus, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { api, type ApiCourseUnit, type ApiUser } from "@/lib/api";
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
  credit_hours: z.number().min(1, "Credit hours must be at least 1"),
  lecturer_id: z.string().optional(),
});

type CourseUnitFormData = z.infer<typeof courseUnitSchema>;

const emptyForm: CourseUnitFormData = {
  title: "",
  description: "",
  credit_hours: 3,
  lecturer_id: "",
};

export default function DashboardCourseUnits() {
  const { user } = useAuth();
  const isLecturer = user.role === "lecturer";
  const isAdmin = user.role === "admin" || user.role === "super_admin";
  const isSuperAdmin = user.role === "super_admin";

  const [units, setUnits] = useState<ApiCourseUnit[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ApiCourseUnit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<ApiCourseUnit | null>(null);
  const [formData, setFormData] = useState<CourseUnitFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseUnitFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [unitsData, usersData] = await Promise.all([
        api.getCourseUnits(),
        api.getUsers().catch(() => [] as ApiUser[]),
      ]);
      setUnits(unitsData);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const lecturers = users.filter((u) => u.role === "lecturer");

  const getLecturerName = (lecturerId: string | null) => {
    if (!lecturerId) return "Unassigned";
    const lecturer = users.find((u) => u.id === lecturerId);
    return lecturer?.name ?? "Unknown";
  };

  const getStatusBadge = (status: string) => {
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
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: ColumnDef<Record<string, unknown>>[] = [
    { key: "title", header: "Title" },
    {
      key: "lecturer_id",
      header: "Lecturer",
      render: (row) => getLecturerName(row.lecturer_id as string | null),
    },
    { key: "credit_hours", header: "Credit Hours" },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status as string),
    },
  ];

  const openCreateForm = () => {
    setEditingUnit(null);
    setFormData(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEditForm = (unit: ApiCourseUnit) => {
    setEditingUnit(unit);
    setFormData({
      title: unit.title,
      description: unit.description,
      credit_hours: unit.credit_hours,
      lecturer_id: unit.lecturer_id ?? "",
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDeleteDialog = (unit: ApiCourseUnit) => {
    setDeletingUnit(unit);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    const dataToValidate = isLecturer
      ? { ...formData, lecturer_id: user.id }
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

    try {
      setSubmitting(true);
      if (editingUnit) {
        const updated = await api.updateCourseUnit(editingUnit.id, {
          title: result.data.title,
          description: result.data.description ?? "",
          credit_hours: result.data.credit_hours,
          lecturer_id: result.data.lecturer_id || null,
        });
        setUnits((prev) =>
          prev.map((u) => (u.id === editingUnit.id ? updated : u)),
        );
        toast.success("Course unit updated successfully");
      } else {
        const created = await api.createCourseUnit({
          title: result.data.title,
          description: result.data.description ?? "",
          course_id: null,
          credit_hours: result.data.credit_hours,
          lecturer_id: isLecturer ? user.id : (result.data.lecturer_id || null),
          status: isLecturer ? "pending_approval" : "active",
        });
        setUnits((prev) => [created, ...prev]);
        toast.success(
          isLecturer
            ? "Course unit submitted for approval"
            : "Course unit created successfully",
        );
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUnit) return;
    try {
      await api.deleteCourseUnit(deletingUnit.id);
      setUnits((prev) => prev.filter((u) => u.id !== deletingUnit.id));
      toast.success("Course unit deleted successfully");
      setDeleteOpen(false);
      setDeletingUnit(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleApprove = async (unit: ApiCourseUnit) => {
    try {
      const updated = await api.approveCourseUnit(unit.id);
      setUnits((prev) => prev.map((u) => (u.id === unit.id ? updated : u)));
      toast.success(`"${unit.title}" has been approved`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Approve failed");
    }
  };

  const handleReject = async (unit: ApiCourseUnit) => {
    try {
      const updated = await api.rejectCourseUnit(unit.id);
      setUnits((prev) => prev.map((u) => (u.id === unit.id ? updated : u)));
      toast.success(`"${unit.title}" has been rejected`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reject failed");
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
        title={isLecturer ? "My Course Units" : "Course Units"}
        description={
          isLecturer
            ? "Manage your course units and modules."
            : "Manage course units and modules."
        }
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course Unit
        </Button>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns}
          data={units as unknown as Record<string, unknown>[]}
          searchableFields={["title"]}
          searchPlaceholder="Search course units..."
          rowActions={(row) => {
            const unit = row as unknown as ApiCourseUnit;
            return (
              <div className="flex items-center justify-end gap-1">
                {isAdmin && unit.status === "pending_approval" && (
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
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => openEditForm(unit)}>
                        Edit
                      </DropdownMenuItem>
                    )}
                    {isSuperAdmin && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => openDeleteDialog(unit)}
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
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
        description={
          editingUnit ? "Update course unit details." : "Create a new course unit."
        }
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
              onChange={(e) =>
                setFormData((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Brief description of the course unit"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit-credit-hours">Credit Hours</Label>
            <Input
              id="unit-credit-hours"
              type="number"
              min={1}
              value={formData.credit_hours}
              onChange={(e) =>
                setFormData((f) => ({ ...f, credit_hours: Number(e.target.value) }))
              }
            />
            {errors.credit_hours && (
              <p className="text-xs text-destructive">{errors.credit_hours}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Lecturer</Label>
            {isLecturer ? (
              <Input value={user.name} disabled />
            ) : (
              <Select
                value={formData.lecturer_id}
                onValueChange={(val) =>
                  setFormData((f) => ({ ...f, lecturer_id: val }))
                }
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
            {errors.lecturer_id && (
              <p className="text-xs text-destructive">{errors.lecturer_id}</p>
            )}
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
        title="Delete Course Unit"
        description={`Are you sure you want to delete "${deletingUnit?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
