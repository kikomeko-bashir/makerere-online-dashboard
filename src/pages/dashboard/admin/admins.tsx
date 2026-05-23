import { useState, useMemo } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import type { User, UserRole } from "@/lib/types";
import { mockUsers } from "@/lib/mock-data";
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

const adminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["admin", "super_admin"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminFormData = z.infer<typeof adminSchema>;

const emptyForm: AdminFormData = {
  name: "",
  email: "",
  role: "admin",
  password: "",
};

export default function DashboardAdmins() {
  const [admins, setAdmins] = useState<User[]>(
    mockUsers.filter(
      (u) => u.role === "admin" || u.role === "super_admin",
    ),
  );
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<User | null>(null);
  const [formData, setFormData] = useState<AdminFormData>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AdminFormData, string>>
  >({});

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return <Badge variant="default">Super Admin</Badge>;
      case "admin":
        return <Badge variant="secondary">Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const columns: ColumnDef<User>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (row) => getRoleBadge(row.role),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (row) => format(new Date(row.createdAt), "dd MMM yyyy"),
    },
  ];

  const openCreateForm = () => {
    setEditingAdmin(null);
    setFormData(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEditForm = (admin: User) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role as "admin" | "super_admin",
      password: "",
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDeleteDialog = (admin: User) => {
    setDeletingAdmin(admin);
    setDeleteOpen(true);
  };

  const handleSubmit = () => {
    const schema = editingAdmin
      ? adminSchema.extend({
          password: z
            .string()
            .optional()
            .refine(
              (val) => !val || val.length >= 6,
              "Password must be at least 6 characters",
            ),
        })
      : adminSchema;

    const result = schema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof AdminFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof AdminFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (editingAdmin) {
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === editingAdmin.id
            ? { ...a, name: result.data.name, email: result.data.email, role: result.data.role as UserRole }
            : a,
        ),
      );
      toast.success("Admin updated successfully");
    } else {
      const newAdmin: User = {
        id: `user-${Date.now()}`,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role as UserRole,
        avatar: undefined,
        createdAt: new Date().toISOString(),
      };
      setAdmins((prev) => [...prev, newAdmin]);
      toast.success("Admin created successfully");
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deletingAdmin) {
      setAdmins((prev) => prev.filter((a) => a.id !== deletingAdmin.id));
      toast.success("Admin deleted successfully");
      setDeleteOpen(false);
      setDeletingAdmin(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Management"
        description="Manage administrator accounts and permissions."
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={admins as unknown as Record<string, unknown>[]}
          searchableFields={["name", "email"]}
          searchPlaceholder="Search admins..."
          rowActions={(row) => {
            const admin = row as unknown as User;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditForm(admin)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => openDeleteDialog(admin)}
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
        title={editingAdmin ? "Edit Admin" : "Add Admin"}
        description={
          editingAdmin
            ? "Update administrator details."
            : "Create a new administrator account."
        }
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-name">Name</Label>
            <Input
              id="admin-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Full name"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="email@mak.ac.ug"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(val) =>
                setFormData((f) => ({
                  ...f,
                  role: val as "admin" | "super_admin",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">
              Password{editingAdmin ? " (leave blank to keep current)" : ""}
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((f) => ({ ...f, password: e.target.value }))
              }
              placeholder={editingAdmin ? "••••••••" : "Min 6 characters"}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Admin"
        description={`Are you sure you want to delete "${deletingAdmin?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
