import { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  Video,
  Presentation,
  FileCheck,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { api, type ApiMaterial, type ApiCourseUnit } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function getMaterialIcon(type: string) {
  switch (type) {
    case "pdf":
      return <FileText className="h-4 w-4 text-red-500" />;
    case "video":
      return <Video className="h-4 w-4 text-blue-500" />;
    case "presentation":
      return <Presentation className="h-4 w-4 text-orange-500" />;
    case "assignment":
      return <FileCheck className="h-4 w-4 text-green-500" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LecturerMaterials() {
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [courseUnits, setCourseUnits] = useState<ApiCourseUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload form state
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseUnitId: "",
    type: "pdf",
    file: null as File | null,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState<ApiMaterial | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [materialsData, unitsData] = await Promise.all([
        api.getAllMyMaterials(),
        api.getCourseUnits(),
      ]);
      setMaterials(materialsData);
      setCourseUnits(unitsData);
    } catch {
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  }

  // Group materials by course unit
  const materialsByUnit = materials.reduce(
    (acc, material) => {
      const unitId = material.course_unit_id;
      if (!acc[unitId]) acc[unitId] = [];
      acc[unitId].push(material);
      return acc;
    },
    {} as Record<string, ApiMaterial[]>,
  );

  const getUnitName = (unitId: string) => {
    const unit = courseUnits.find((u) => u.id === unitId);
    return unit?.title ?? "Unknown Unit";
  };

  const openUploadForm = () => {
    setFormData({ title: "", description: "", courseUnitId: "", type: "pdf", file: null });
    setErrors({});
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.courseUnitId) newErrors.courseUnitId = "Course unit is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      let fileUrl = "";
      let fileSize = 0;
      if (formData.file) {
        const uploadResult = await api.uploadImage(formData.file);
        fileUrl = uploadResult.url;
        fileSize = formData.file.size;
      }

      await api.createMaterial({
        course_unit_id: formData.courseUnitId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        file_url: fileUrl,
        file_size: fileSize,
      });
      toast.success("Material uploaded successfully");
      setFormOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMaterial) return;
    try {
      await api.deleteMaterial(deletingMaterial.id);
      toast.success("Material deleted");
      setDeleteOpen(false);
      setDeletingMaterial(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Materials"
        description="Materials you've uploaded to your course units."
      >
        <Button onClick={openUploadForm}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Material
        </Button>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        {Object.keys(materialsByUnit).length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <FileText className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No materials uploaded yet</p>
            <p className="mt-1 text-sm">
              Upload materials to your course units to get started.
            </p>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full" defaultValue={Object.keys(materialsByUnit)}>
            {Object.entries(materialsByUnit).map(([unitId, unitMaterials]) => (
              <AccordionItem key={unitId} value={unitId}>
                <AccordionTrigger className="px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getUnitName(unitId)}</span>
                    <Badge variant="secondary">{unitMaterials.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 px-2">
                    {unitMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {getMaterialIcon(material.type)}
                          <div>
                            <p className="text-sm font-medium">{material.title}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {material.description && (
                                <span className="max-w-[200px] truncate">
                                  {material.description}
                                </span>
                              )}
                              <span>{formatFileSize(material.file_size)}</span>
                              <span>
                                {format(new Date(material.created_at), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {material.type}
                          </Badge>
                          {material.file_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const url = material.file_url.startsWith("/")
                                  ? `${import.meta.env.VITE_API_URL || "https://api.makerereonlineschool.com"}${material.file_url}`
                                  : material.file_url;
                                window.open(url, "_blank");
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeletingMaterial(material);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Upload Form Dialog */}
      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Upload Material"
        description="Add a new study material to a course unit."
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mat-title">Title</Label>
            <Input
              id="mat-title"
              value={formData.title}
              onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Week 1 - Introduction Notes"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mat-description">Description</Label>
            <Textarea
              id="mat-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Brief description of the material"
            />
          </div>

          <div className="space-y-2">
            <Label>Course Unit</Label>
            <Select
              value={formData.courseUnitId}
              onValueChange={(val) =>
                setFormData((f) => ({ ...f, courseUnitId: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course unit" />
              </SelectTrigger>
              <SelectContent>
                {courseUnits
                  .filter((u) => u.status === "active")
                  .map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.courseUnitId && (
              <p className="text-xs text-destructive">{errors.courseUnitId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Material Type</Label>
            <Select
              value={formData.type}
              onValueChange={(val) => setFormData((f) => ({ ...f, type: val }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mat-file">File</Label>
            <Input
              id="mat-file"
              type="file"
              onChange={(e) =>
                setFormData((f) => ({ ...f, file: e.target.files?.[0] ?? null }))
              }
            />
          </div>

          {submitting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </div>
          )}
        </div>
      </EntityFormDialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Material"
        description={`Are you sure you want to delete "${deletingMaterial?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
