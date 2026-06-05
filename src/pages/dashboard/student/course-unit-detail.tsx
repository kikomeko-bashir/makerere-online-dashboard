import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Video,
  Presentation,
  FileCheck,
  Loader2,
  ClipboardCheck,
  MonitorPlay,
  BookOpen,
  ExternalLink,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  api,
  type ApiCourseUnit,
  type ApiMaterial,
  type ApiAssessment,
  type ApiVirtualClass,
} from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function StudentCourseUnitDetail() {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();

  const [unit, setUnit] = useState<ApiCourseUnit | null>(null);
  const [loading, setLoading] = useState(true);

  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [assessments, setAssessments] = useState<ApiAssessment[]>([]);
  const [lectures, setLectures] = useState<ApiVirtualClass[]>([]);

  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [lecturesLoading, setLecturesLoading] = useState(false);

  useEffect(() => {
    fetchUnit();
  }, [unitId]);

  useEffect(() => {
    if (unitId) {
      fetchMaterials();
      fetchAssessments();
      fetchLectures();
    }
  }, [unitId]);

  const fetchUnit = async () => {
    try {
      setLoading(true);
      const units = await api.getCourseUnits();
      const found = units.find((u) => u.id === unitId);
      setUnit(found || null);
    } catch {
      toast.error("Failed to load course unit");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    if (!unitId) return;
    try {
      setMaterialsLoading(true);
      const data = await api.getMaterials(unitId);
      setMaterials(data);
    } catch {
      toast.error("Failed to load materials");
    } finally {
      setMaterialsLoading(false);
    }
  };

  const fetchAssessments = async () => {
    if (!unitId) return;
    try {
      setAssessmentsLoading(true);
      const data = await api.getAssessments(unitId);
      setAssessments(data);
    } catch {
      toast.error("Failed to load assessments");
    } finally {
      setAssessmentsLoading(false);
    }
  };

  const fetchLectures = async () => {
    if (!unitId) return;
    try {
      setLecturesLoading(true);
      const data = await api.getVirtualClasses(unitId);
      setLectures(data);
    } catch {
      toast.error("Failed to load lectures");
    } finally {
      setLecturesLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          <p>Course unit not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      </div>

      <PageHeader title={unit.title} description={unit.description || "Course unit content"}>
        <Badge variant="default">{unit.credit_hours} Credit Hours</Badge>
      </PageHeader>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="materials" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Study Materials
          </TabsTrigger>
          <TabsTrigger value="assessment" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="lectures" className="gap-2">
            <MonitorPlay className="h-4 w-4" />
            Lectures
          </TabsTrigger>
        </TabsList>

        {/* ─── Study Materials Tab ──────────────────────────────────────────── */}
        <TabsContent value="materials" className="space-y-4">
          {materialsLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : materials.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
              <BookOpen className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">No study materials available</p>
              <p className="text-sm mt-1">
                Your lecturer has not uploaded materials for this unit yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getMaterialIcon(mat.type)}
                    <div>
                      <p className="text-sm font-medium">{mat.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {mat.description && `${mat.description} · `}
                        {formatFileSize(mat.file_size)} ·{" "}
                        {format(new Date(mat.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="capitalize">
                      {mat.type}
                    </Badge>
                    {mat.file_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(mat.file_url, "_blank")}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Open
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Assessments Tab ──────────────────────────────────────────────── */}
        <TabsContent value="assessment" className="space-y-4">
          {assessmentsLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : assessments.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
              <ClipboardCheck className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">No assessments available</p>
              <p className="text-sm mt-1">
                No quizzes or exams have been set for this unit yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((assess) => (
                <div
                  key={assess.id}
                  className="rounded-xl border bg-card p-5 shadow-soft space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{assess.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {assess.instructions || "No instructions provided."}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {assess.type.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-xs text-muted-foreground">Pass Mark</p>
                      <p className="font-semibold">{assess.pass_mark}%</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-xs text-muted-foreground">Time Limit</p>
                      <p className="font-semibold">
                        {assess.time_limit ? `${assess.time_limit} min` : "Untimed"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-xs text-muted-foreground">Attempts</p>
                      <p className="font-semibold">{assess.max_attempts}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="font-semibold">
                        {assess.end_date
                          ? format(new Date(assess.end_date), "MMM d, yyyy")
                          : "No deadline"}
                      </p>
                    </div>
                  </div>
                  {assess.start_date && assess.end_date && (
                    <p className="text-xs text-muted-foreground">
                      Available: {format(new Date(assess.start_date), "MMM d")} –{" "}
                      {format(new Date(assess.end_date), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Lectures Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="lectures" className="space-y-4">
          {lecturesLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : lectures.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
              <MonitorPlay className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">No lectures scheduled</p>
              <p className="text-sm mt-1">
                Virtual classes will appear here once your lecturer schedules them.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lectures.map((lect) => (
                <div
                  key={lect.id}
                  className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{lect.title}</p>
                        {lect.is_live && (
                          <Badge className="bg-red-100 text-red-800 text-xs">Live Now</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {lect.platform === "zoom" ? "Zoom" : "Jitsi"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {lect.date} at {lect.start_time} · {lect.duration} min
                      </p>
                    </div>
                  </div>
                  {lect.meeting_link && (
                    <Button
                      size="sm"
                      onClick={() => window.open(lect.meeting_link, "_blank")}
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Join Class
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
