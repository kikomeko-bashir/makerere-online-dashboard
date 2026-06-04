import { useState, useEffect } from "react";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { api, type ApiSubject } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SubjectFormData {
  name: string;
  description: string;
}

const emptyForm: SubjectFormData = {
  name: "",
  description: "",
};

export default function DashboardSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<ApiSubject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<ApiSubject | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof SubjectFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = user.role === "super_admin";

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load subjects";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const columns: ColumnDef<Record<string, unknown>>[] = [
    { key: "name", header: "Name" },
    {
      key: "description",
      header: "Description",
      render: (row) => {
        const desc = row.description as string;
        if (!desc) return <span className="text-muted-foreground">—</span>;
        return desc.length > 80 ? desc.slice(0, 80) + "…" : desc;
      },
    },
    {
      key: "created_at",
      header: "Created At",
      render: (row) => format(new Date(row.created_at as string), "MMM d, yyyy"),
    },
  ];

  const openCreateForm = () => {
    setEditingSubject(null);
    setFormData(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEditForm = (subject: ApiSubject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description,
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDeleteDialog = (subject: ApiSubject) => {
    setDeletingSubject(subject);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    const newErrors: Partial<Record<keyof SubjectFormData, string>> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Subject name is required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (editingSubject) {
        await api.updateSubject(editingSubject.id, {
          name: formData.name.trim(),
          description: formData.description,
        });
        toast.success("Subject updated successfully");
      } else {
        await api.createSubject({
          name: formData.name.trim(),
          description: formData.description,
        });
        toast.success("Subject created successfully");
      }
      setFormOpen(false);
      await fetchSubjects();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSubject) return;
    try {
      await api.deleteSubject(deletingSubject.id);
      toast.success("Subject deleted successfully");
      setDeleteOpen(false);
      setDeletingSubject(null);
      await fetchSubjects();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete subject";
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
        title="Subject Management"
        description="Manage subjects available for tutoring and courses."
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns}
          data={subjects as unknown as Record<string, unknown>[]}
          searchableFields={["name"]}
          searchPlaceholder="Search subjects..."
          rowActions={(row) => {
            const subject = row as unknown as ApiSubject;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditForm(subject)}>
                    Edit
                  </DropdownMenuItem>
                  {isSuperAdmin && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => openDeleteDialog(subject)}
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
        title={editingSubject ? "Edit Subject" : "Add Subject"}
        description={editingSubject ? "Update subject details." : "Create a new subject."}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject-name">Name</Label>
            <Input
              id="subject-name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Data Structures"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-description">Description</Label>
            <Textarea
              id="subject-description"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the subject"
              rows={4}
            />
          </div>

          {submitting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {editingSubject ? "Updating..." : "Creating..."}
            </div>
          )}
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Subject"
        description={`Are you sure you want to delete "${deletingSubject?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
