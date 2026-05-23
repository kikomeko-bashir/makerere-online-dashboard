import { useState } from "react";
import { MoreHorizontal, Plus, School as SchoolIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import type { School } from "@/lib/types";
import { mockSchools, mockUsers } from "@/lib/mock-data";
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
  headOfSchool: z.string().min(1, "Head of School is required"),
  status: z.enum(["active", "inactive"]),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

const emptyForm: SchoolFormData = {
  name: "",
  code: "",
  description: "",
  headOfSchool: "",
  status: "active",
};

export default function DashboardSchools() {
  const [schools, setSchools] = useState<School[]>([...mockSchools]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState<SchoolFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof SchoolFormData, string>>>({});

  const lecturers = mockUsers.filter(
    (u) => u.role === "lecturer" || u.role === "admin" || u.role === "super_admin",
  );

  const getUserName = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    return user?.name ?? "Unknown";
  };

  const columns: ColumnDef<School>[] = [
    { key: "name", header: "Name" },
    { key: "code", header: "Code" },
    {
      key: "headOfSchool",
      header: "Head of School",
      render: (row) => getUserName(row.headOfSchool),
    },
    { key: "departmentsCount", header: "Departments" },
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
    setEditingSchool(null);
    setFormData(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEditForm = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      code: school.code,
      description: school.description,
      headOfSchool: school.headOfSchool,
      status: school.status,
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDeleteDialog = (school: School) => {
    setDeletingSchool(school);
    setDeleteOpen(true);
  };

  const handleSubmit = () => {
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

    if (editingSchool) {
      setSchools((prev) =>
        prev.map((s) =>
          s.id === editingSchool.id
            ? { ...s, ...result.data, description: result.data.description ?? "" }
            : s,
        ),
      );
      toast.success("School updated successfully");
    } else {
      const newSchool: School = {
        id: `school-${Date.now()}`,
        name: result.data.name,
        code: result.data.code,
        description: result.data.description ?? "",
        headOfSchool: result.data.headOfSchool,
        departmentsCount: 0,
        status: result.data.status,
      };
      setSchools((prev) => [...prev, newSchool]);
      toast.success("School created successfully");
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deletingSchool) {
      setSchools((prev) => prev.filter((s) => s.id !== deletingSchool.id));
      toast.success("School deleted successfully");
      setDeleteOpen(false);
      setDeletingSchool(null);
    }
  };

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
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={schools as unknown as Record<string, unknown>[]}
          searchableFields={["name", "code"]}
          searchPlaceholder="Search schools..."
          rowActions={(row) => {
            const school = row as unknown as School;
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
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => openDeleteDialog(school)}
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
            <Label>Head of School</Label>
            <Select
              value={formData.headOfSchool}
              onValueChange={(val) => setFormData((f) => ({ ...f, headOfSchool: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select head of school" />
              </SelectTrigger>
              <SelectContent>
                {lecturers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.headOfSchool && (
              <p className="text-xs text-destructive">{errors.headOfSchool}</p>
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
