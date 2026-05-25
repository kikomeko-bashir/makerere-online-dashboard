import { useState, useEffect } from "react";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { api, type ApiSchool, type ApiUser } from "@/lib/api";
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

const schoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  code: z.string().min(1, "Code is required").max(10, "Code must be 10 characters or less"),
  description: z.string().optional(),
  head_of_school: z.string().optional(),
  departments_count: z.number().min(0, "Must be 0 or more"),
  status: z.enum(["active", "inactive"]),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

const emptyForm: SchoolFormData = {
  name: "",
  code: "",
  description: "",
  head_of_school: "",
  departments_count: 0,
  status: "active",
};

export default function DashboardSchools() {
  const { user } = useAuth();
  const [schools, setSchools] = useState<ApiSchool[]>([]);
  const [staffUsers, setStaffUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<ApiSchool | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<ApiSchool | null>(null);
  const [formData, setFormData] = useState<SchoolFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof SchoolFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = user.role === "super_admin";

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const [schoolsData, usersData] = await Promise.all([
        api.getSchools(),
        api.getUsers(),
      ]);
      setSchools(schoolsData);
      setStaffUsers(usersData.filter((u) => u.role === "lecturer" || u.role === "admin" || u.role === "super_admin"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load schools";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const columns: ColumnDef<Record<string, unknown>>[] = [
    { key: "name", header: "Name" },
    { key: "code", header: "Code" },
    {
      key: "head_of_school",
      header: "Head of School",
      render: (row) => {
        const userId = row.head_of_school as string;
        const found = staffUsers.find((u) => u.id === userId);
        return found ? found.name : (userId || "—");
      },
    },
    { key: "departments_count", header: "Departments" },
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
    setEditingSchool(null);
    setFormData(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEditForm = (school: ApiSchool) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      code: school.code,
      description: school.description || "",
      head_of_school: school.head_of_school || "",
      departments_count: school.departments_count,
      status: school.status as "active" | "inactive",
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDeleteDialog = (school: ApiSchool) => {
    setDeletingSchool(school);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    const result = schoolSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SchoolFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof SchoolFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: result.data.name,
        code: result.data.code,
        description: result.data.description ?? "",
        head_of_school: result.data.head_of_school || null,
        departments_count: result.data.departments_count,
        status: result.data.status,
      };

      if (editingSchool) {
        await api.updateSchool(editingSchool.id, payload);
        toast.success("School updated successfully");
      } else {
        await api.createSchool(payload);
        toast.success("School created successfully");
      }
      setFormOpen(false);
      await fetchSchools();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSchool) return;
    try {
      await api.deleteSchool(deletingSchool.id);
      toast.success("School deleted successfully");
      setDeleteOpen(false);
      setDeletingSchool(null);
      await fetchSchools();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete school";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Management"
        description="Manage schools and faculties across the platform."
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add School
        </Button>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns}
          data={schools as unknown as Record<string, unknown>[]}
          searchableFields={["name", "code"]}
          searchPlaceholder="Search schools..."
          rowActions={(row) => {
            const school = row as unknown as ApiSchool;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditForm(school)}>
                    Edit
                  </DropdownMenuItem>
                  {isSuperAdmin && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => openDeleteDialog(school)}
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
        title={editingSchool ? "Edit School" : "Add School"}
        description={editingSchool ? "Update school details." : "Create a new school."}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="school-name">School Name</Label>
            <Input
              id="school-name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. School of Computing"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="school-code">School Code</Label>
            <Input
              id="school-code"
              value={formData.code}
              onChange={(e) => setFormData((f) => ({ ...f, code: e.target.value }))}
              placeholder="e.g. SCIT"
              maxLength={10}
            />
            {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="school-description">Description</Label>
            <Textarea
              id="school-description"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the school"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="school-head">Head of School</Label>
            <Select
              value={formData.head_of_school || ""}
              onValueChange={(val) =>
                setFormData((f) => ({ ...f, head_of_school: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select head of school" />
              </SelectTrigger>
              <SelectContent>
                {staffUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.role.replace("_", " ")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="school-departments">Departments Count</Label>
            <Input
              id="school-departments"
              type="number"
              min={0}
              value={formData.departments_count}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  departments_count: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="0"
            />
            {errors.departments_count && (
              <p className="text-xs text-destructive">{errors.departments_count}</p>
            )}
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
              {editingSchool ? "Updating..." : "Creating..."}
            </div>
          )}
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete School"
        description={`Are you sure you want to delete "${deletingSchool?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
