import { useState, useEffect } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import type { UserRole } from "@/lib/types";
import { api, type ApiUser } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
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

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["super_admin", "admin", "lecturer", "student"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type UserFormData = z.infer<typeof userSchema>;

const emptyForm: UserFormData = {
  name: "",
  email: "",
  role: "student",
  password: "",
};

export default function DashboardAdmins() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<ApiUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = currentUser.role === "super_admin";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch users";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Badge variant="default">Super Admin</Badge>;
      case "admin":
        return <Badge variant="secondary">Admin</Badge>;
      case "lecturer":
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            Lecturer
          </Badge>
        );
      case "student":
        return (
          <Badge variant="outline" className="border-green-300 text-green-700">
            Student
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const columns: ColumnDef<ApiUser>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (row) => getRoleBadge(row.role),
    },
    {
      key: "created_at",
      header: "Created At",
      render: (row) => format(new Date(row.created_at), "dd MMM yyyy"),
    },
  ];

  const roleOptions: { value: UserRole; label: string }[] = isSuperAdmin
    ? [
        { value: "super_admin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "lecturer", label: "Lecturer" },
        { value: "student", label: "Student" },
      ]
    : [
        { value: "admin", label: "Admin" },
        { value: "lecturer", label: "Lecturer" },
        { value: "student", label: "Student" },
      ];

  const openCreateForm = () => {
    setFormData(emptyForm);
    setFormErrors({});
    setFormOpen(true);
  };

  const openDeleteDialog = (user: ApiUser) => {
    setDeletingUser(user);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    const result = userSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UserFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof UserFormData;
        fieldErrors[field] = err.message;
      });
      setFormErrors(fieldErrors);
      return;
    }

    try {
      setSubmitting(true);
      await api.createUser(
        result.data.name,
        result.data.email,
        result.data.password,
        result.data.role,
      );
      toast.success("User created successfully");
      setFormOpen(false);
      await fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create user";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await api.deleteUser(deletingUser.id);
      toast.success("User deleted successfully");
      setDeleteOpen(false);
      setDeletingUser(null);
      await fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete user";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          description="Manage all user accounts and permissions."
        />
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchUsers}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all user accounts and permissions."
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={users as unknown as Record<string, unknown>[]}
          searchableFields={["name", "email"]}
          searchPlaceholder="Search users..."
          rowActions={
            isSuperAdmin
              ? (row) => {
                  const user = row as unknown as ApiUser;
                  // Don't show delete for the current user
                  if (user.id === currentUser.id) return null;
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(user)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
              : undefined
          }
        />
      </div>

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Add User"
        description="Create a new user account."
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Full name"
            />
            {formErrors.name && (
              <p className="text-xs text-destructive">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="email@mak.ac.ug"
            />
            {formErrors.email && (
              <p className="text-xs text-destructive">{formErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="Min 6 characters"
            />
            {formErrors.password && (
              <p className="text-xs text-destructive">{formErrors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(val) =>
                setFormData((f) => ({
                  ...f,
                  role: val as UserFormData["role"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.role && (
              <p className="text-xs text-destructive">{formErrors.role}</p>
            )}
          </div>
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete User"
        description={`Are you sure you want to delete "${deletingUser?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
