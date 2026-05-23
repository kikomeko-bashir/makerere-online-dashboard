import { useState } from "react";
import { Plus, FileText, Video, Presentation, FileCheck, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import type { StudyMaterial, MaterialType } from "@/lib/types";
import { mockMaterials, mockCourseUnits, mockEnrollments, mockCourses } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
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

function getMaterialIcon(type: MaterialType) {
  switch (type) {
    case "pdf":
      return <FileText className="h-4 w-4 text-red-500" />;
    case "video":
      return <Video className="h-4 w-4 text-blue-500" />;
    case "presentation":
      return <Presentation className="h-4 w-4 text-orange-500" />;
    case "assignment":
      return <FileCheck className="h-4 w-4 text-green-500" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

interface MaterialFormData {
  title: string;
  description: string;
  courseUnitId: string;
  type: MaterialType | "";
  file: File | null;
}

const emptyForm: MaterialFormData = {
  title: "",
  description: "",
  courseUnitId: "",
  type: "",
  file: null,
};

export default function DashboardMaterials() {
  const { user } = useAuth();
  const isLecturer = user.role === "lecturer";
  const isStudent = user.role === "student";

  const [materials, setMaterials] = useState<StudyMaterial[]>([...mockMaterials]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState<StudyMaterial | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // Get enrolled course unit IDs for students
  const enrolledCourseUnitIds = (() => {
    if (!isStudent) return [];
    const studentEnrollments = mockEnrollments.filter(
      (e) => e.studentId === user.id && e.status !== "dropped",
    );
    const enrolledCourseIds = studentEnrollments.map((e) => e.courseId).filter(Boolean) as string[];
    const unitIdsFromCourses = mockCourses
      .filter((c) => enrolledCourseIds.includes(c.id))
      .flatMap((c) => c.unitIds);
    const directUnitIds = studentEnrollments.map((e) => e.courseUnitId).filter(Boolean) as string[];
    return [...new Set([...unitIdsFromCourses, ...directUnitIds])];
  })();

  // Filter materials based on role
  const displayedMaterials = isLecturer
    ? materials.filter((m) => m.uploadedBy === user.id)
    : isStudent
      ? materials.filter((m) => enrolledCourseUnitIds.includes(m.courseUnitId))
      : materials;

  // Group materials by course unit
  const materialsByUnit = displayedMaterials.reduce(
    (acc, material) => {
      const unitId = material.courseUnitId;
      if (!acc[unitId]) acc[unitId] = [];
      acc[unitId].push(material);
      return acc;
    },
    {} as Record<string, StudyMaterial[]>,
  );

  const getCourseUnitName = (unitId: string) => {
    const unit = mockCourseUnits.find((u) => u.id === unitId);
    return unit?.title ?? "Unknown Unit";
  };

  const openUploadForm = () => {
    setFormData(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openDeleteDialog = (material: StudyMaterial) => {
    setDeletingMaterial(material);
    setDeleteOpen(true);
  };

  const handleSubmit = () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.courseUnitId) newErrors.courseUnitId = "Course unit is required";
    if (!formData.type) newErrors.type = "Material type is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newMaterial: StudyMaterial = {
      id: `mat-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      courseUnitId: formData.courseUnitId,
      type: formData.type as MaterialType,
      fileUrl: `/files/${formData.title.toLowerCase().replace(/\s+/g, "-")}.${formData.type === "video" ? "mp4" : formData.type === "presentation" ? "pptx" : "pdf"}`,
      fileSize: formData.file?.size ?? 1500000,
      uploadDate: new Date().toISOString().split("T")[0],
      downloadCount: 0,
      uploadedBy: user.id,
    };

    setMaterials((prev) => [...prev, newMaterial]);
    toast.success("Material uploaded successfully");
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deletingMaterial) {
      setMaterials((prev) => prev.filter((m) => m.id !== deletingMaterial.id));
      toast.success("Material deleted successfully");
      setDeleteOpen(false);
      setDeletingMaterial(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Materials"
        description={
          isStudent
            ? "Access study materials for your enrolled courses."
            : isLecturer
              ? "Upload and manage your study materials."
              : "Upload and manage study materials, notes, and past papers."
        }
      >
        {!isStudent && (
          <Button onClick={openUploadForm}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Material
          </Button>
        )}
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        {Object.keys(materialsByUnit).length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No materials uploaded yet.</p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {Object.entries(materialsByUnit).map(([unitId, unitMaterials]) => (
              <AccordionItem key={unitId} value={unitId}>
                <AccordionTrigger className="px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getCourseUnitName(unitId)}</span>
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
                              <span>{formatFileSize(material.fileSize)}</span>
                              <span>{format(new Date(material.uploadDate), "MMM d, yyyy")}</span>
                              <span>{material.downloadCount} downloads</span>
                            </div>
                          </div>
                        </div>
                        {isStudent ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.success(`Downloading ${material.title}...`)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(material)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Upload Material"
        description="Add a new study material for your course unit."
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mat-title">Title</Label>
            <Input
              id="mat-title"
              value={formData.title}
              onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Introduction to Algorithms - Lecture Notes"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mat-description">Description</Label>
            <Textarea
              id="mat-description"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the material"
            />
          </div>

          <div className="space-y-2">
            <Label>Course Unit</Label>
            <Select
              value={formData.courseUnitId}
              onValueChange={(val) => setFormData((f) => ({ ...f, courseUnitId: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course unit" />
              </SelectTrigger>
              <SelectContent>
                {mockCourseUnits.map((unit) => (
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
              onValueChange={(val) => setFormData((f) => ({ ...f, type: val as MaterialType }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mat-file">File Upload</Label>
            <Input
              id="mat-file"
              type="file"
              onChange={(e) => setFormData((f) => ({ ...f, file: e.target.files?.[0] ?? null }))}
            />
          </div>
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Material"
        description={`Are you sure you want to delete "${deletingMaterial?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
