import { useState, useEffect } from "react";
import {
  FileText,
  Video,
  Presentation,
  FileCheck,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { api, type ApiMaterial, type ApiCourseUnit } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function StudentMaterials() {
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [courseUnits, setCourseUnits] = useState<ApiCourseUnit[]>([]);
  const [loading, setLoading] = useState(true);

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
        description="Study materials from your enrolled course units."
      />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        {Object.keys(materialsByUnit).length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <FileText className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No study materials available yet</p>
            <p className="mt-1 text-sm">
              Materials will appear here once your lecturers upload them to your course units.
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
    </div>
  );
}
