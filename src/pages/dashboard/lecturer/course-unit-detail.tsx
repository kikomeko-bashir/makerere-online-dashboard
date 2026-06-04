import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, FileText, Video, Presentation, FileCheck,
  Trash2, Loader2, Users, ClipboardCheck, MonitorPlay, BookOpen,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { api, type ApiCourseUnit, type ApiMaterial, type ApiAssessment, type ApiVirtualClass } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMaterialIcon(type: string) {
  switch (type) {
    case "pdf": return <FileText className="h-4 w-4 text-red-500" />;
    case "video": return <Video className="h-4 w-4 text-blue-500" />;
    case "presentation": return <Presentation className="h-4 w-4 text-orange-500" />;
    case "assignment": return <FileCheck className="h-4 w-4 text-green-500" />;
    default: return <FileText className="h-4 w-4" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CourseUnitDetail() {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [unit, setUnit] = useState<ApiCourseUnit | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab data from API
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [assessments, setAssessments] = useState<ApiAssessment[]>([]);
  const [lectures, setLectures] = useState<ApiVirtualClass[]>([]);

  // Loading states per tab
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [lecturesLoading, setLecturesLoading] = useState(false);

  // Form states
  const [materialFormOpen, setMaterialFormOpen] = useState(false);
  const [assessmentFormOpen, setAssessmentFormOpen] = useState(false);
  const [lectureFormOpen, setLectureFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ type: string; id: string; title: string } | null>(null);

  // Material form
  const [matForm, setMatForm] = useState({ title: "", description: "", type: "pdf" as string, file: null as File | null });
  // Assessment form
  const [assessForm, setAssessForm] = useState({ title: "", type: "quiz" as string, passMark: 50, timeLimit: "", maxAttempts: 1, startDate: "", endDate: "", instructions: "" });
  // Lecture form
  const [lectForm, setLectForm] = useState({ title: "", date: "", startTime: "", duration: 60, platform: "zoom" as string, meetingLink: "" });

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

  // ─── Material CRUD ───────────────────────────────────────────────────────────

  const handleAddMaterial = async () => {
    if (!matForm.title.trim()) { toast.error("Title is required"); return; }
    if (!unitId) return;
    try {
      await api.createMaterial({
        course_unit_id: unitId,
        title: matForm.title,
        description: matForm.description,
        type: matForm.type,
        file_url: "",
        file_size: matForm.file?.size ?? 0,
      });
      setMatForm({ title: "", description: "", type: "pdf", file: null });
      setMaterialFormOpen(false);
      toast.success("Material uploaded");
      fetchMaterials();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload material");
    }
  };

  // ─── Assessment CRUD ─────────────────────────────────────────────────────────

  const handleAddAssessment = async () => {
    if (!assessForm.title.trim()) { toast.error("Title is required"); return; }
    if (!unitId) return;
    try {
      await api.createAssessment({
        course_unit_id: unitId,
        title: assessForm.title,
        type: assessForm.type,
        pass_mark: assessForm.passMark,
        time_limit: assessForm.timeLimit ? Number(assessForm.timeLimit) : null,
        max_attempts: assessForm.maxAttempts,
        start_date: assessForm.startDate || null,
        end_date: assessForm.endDate || null,
        instructions: assessForm.instructions,
      });
      setAssessForm({ title: "", type: "quiz", passMark: 50, timeLimit: "", maxAttempts: 1, startDate: "", endDate: "", instructions: "" });
      setAssessmentFormOpen(false);
      toast.success("Assessment created");
      fetchAssessments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create assessment");
    }
  };

  // ─── Lecture CRUD ────────────────────────────────────────────────────────────

  const handleAddLecture = async () => {
    if (!lectForm.title.trim()) { toast.error("Title is required"); return; }
    if (!unitId) return;
    try {
      await api.createVirtualClass({
        course_unit_id: unitId,
        title: lectForm.title,
        date: lectForm.date,
        start_time: lectForm.startTime,
        duration: lectForm.duration,
        platform: lectForm.platform,
        meeting_link: lectForm.meetingLink,
      });
      setLectForm({ title: "", date: "", startTime: "", duration: 60, platform: "zoom", meetingLink: "" });
      setLectureFormOpen(false);
      toast.success("Lecture scheduled");
      fetchLectures();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule lecture");
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      if (deletingItem.type === "material") {
        await api.deleteMaterial(deletingItem.id);
        fetchMaterials();
      }
      if (deletingItem.type === "assessment") {
        await api.deleteAssessment(deletingItem.id);
        fetchAssessments();
      }
      if (deletingItem.type === "lecture") {
        await api.deleteVirtualClass(deletingItem.id);
        fetchLectures();
      }
      toast.success(`${deletingItem.title} deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleteOpen(false);
      setDeletingItem(null);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!unit) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard/course-units")}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        <p className="text-center text-muted-foreground">Course unit not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/course-units")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      </div>

      <PageHeader title={unit.title} description={unit.description || "Course unit details"}>
        <Badge variant="default">{unit.credit_hours} Credit Hours</Badge>
      </PageHeader>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="materials" className="gap-2"><BookOpen className="h-4 w-4" />Study Materials</TabsTrigger>
          <TabsTrigger value="students" className="gap-2"><Users className="h-4 w-4" />Enrolled Students</TabsTrigger>
          <TabsTrigger value="assessment" className="gap-2"><ClipboardCheck className="h-4 w-4" />Assessment</TabsTrigger>
          <TabsTrigger value="lectures" className="gap-2"><MonitorPlay className="h-4 w-4" />Lectures</TabsTrigger>
        </TabsList>

        {/* ─── Study Materials Tab ──────────────────────────────────────────── */}
        <TabsContent value="materials" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setMaterialFormOpen(true)}><Plus className="mr-2 h-4 w-4" />Upload Material</Button>
          </div>
          {materialsLoading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : materials.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
              <BookOpen className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
              <p>No study materials yet. Upload your first material.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {materials.map((mat) => (
                <div key={mat.id} className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    {getMaterialIcon(mat.type)}
                    <div>
                      <p className="text-sm font-medium">{mat.title}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(mat.file_size)} · {format(new Date(mat.created_at), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setDeletingItem({ type: "material", id: mat.id, title: mat.title }); setDeleteOpen(true); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Enrolled Students Tab ────────────────────────────────────────── */}
        <TabsContent value="students" className="space-y-4">
          <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
            <Users className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">Enrolled Students</p>
            <p className="text-sm mt-1">Student enrollment data will be available once students enroll in intakes containing this course unit.</p>
          </div>
        </TabsContent>

        {/* ─── Assessment Tab ───────────────────────────────────────────────── */}
        <TabsContent value="assessment" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setAssessmentFormOpen(true)}><Plus className="mr-2 h-4 w-4" />Create Assessment</Button>
          </div>
          {assessmentsLoading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : assessments.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
              <ClipboardCheck className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
              <p>No assessments yet. Create your first quiz or exam.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assessments.map((assess) => (
                <div key={assess.id} className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{assess.title}</p>
                      <Badge variant="secondary" className="text-xs">{assess.type.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pass: {assess.pass_mark}% · {assess.time_limit ? `${assess.time_limit} min` : "Untimed"} · {assess.max_attempts} attempt{assess.max_attempts > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setDeletingItem({ type: "assessment", id: assess.id, title: assess.title }); setDeleteOpen(true); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Lectures Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="lectures" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setLectureFormOpen(true)}><Plus className="mr-2 h-4 w-4" />Schedule Lecture</Button>
          </div>
          {lecturesLoading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : lectures.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
              <MonitorPlay className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
              <p>No lectures scheduled. Schedule your first virtual class.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lectures.map((lect) => (
                <div key={lect.id} className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{lect.title}</p>
                        {lect.is_live && <Badge className="bg-red-100 text-red-800">Live</Badge>}
                        <Badge variant="outline">{lect.platform === "zoom" ? "Zoom" : "Jitsi"}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{lect.date} at {lect.start_time} · {lect.duration} min</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {lect.meeting_link && (
                      <Button size="sm" variant="outline" onClick={() => window.open(lect.meeting_link, "_blank")}>
                        <ExternalLink className="mr-1 h-3 w-3" />Join
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { setDeletingItem({ type: "lecture", id: lect.id, title: lect.title }); setDeleteOpen(true); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Material Upload Form ─────────────────────────────────────────── */}
      <EntityFormDialog open={materialFormOpen} onOpenChange={setMaterialFormOpen} title="Upload Material" description="Add study material for this course unit." onSubmit={handleAddMaterial}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={matForm.title} onChange={(e) => setMatForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Week 1 - Introduction" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={matForm.description} onChange={(e) => setMatForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={matForm.type} onValueChange={(val) => setMatForm((f) => ({ ...f, type: val }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>File</Label>
            <Input type="file" onChange={(e) => setMatForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))} />
          </div>
        </div>
      </EntityFormDialog>

      {/* ─── Assessment Form ──────────────────────────────────────────────── */}
      <EntityFormDialog open={assessmentFormOpen} onOpenChange={setAssessmentFormOpen} title="Create Assessment" description="Set up a quiz, assignment, or exam." onSubmit={handleAddAssessment}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={assessForm.title} onChange={(e) => setAssessForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Mid-semester Quiz" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={assessForm.type} onValueChange={(val) => setAssessForm((f) => ({ ...f, type: val }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="final_exam">Final Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pass Mark (%)</Label>
              <Input type="number" min={0} max={100} value={assessForm.passMark} onChange={(e) => setAssessForm((f) => ({ ...f, passMark: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Time Limit (min, optional)</Label>
              <Input type="number" min={1} value={assessForm.timeLimit} onChange={(e) => setAssessForm((f) => ({ ...f, timeLimit: e.target.value }))} placeholder="Leave empty for untimed" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Max Attempts</Label>
            <Input type="number" min={1} value={assessForm.maxAttempts} onChange={(e) => setAssessForm((f) => ({ ...f, maxAttempts: Number(e.target.value) }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={assessForm.startDate} onChange={(e) => setAssessForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={assessForm.endDate} onChange={(e) => setAssessForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
        </div>
      </EntityFormDialog>

      {/* ─── Lecture Form ─────────────────────────────────────────────────── */}
      <EntityFormDialog open={lectureFormOpen} onOpenChange={setLectureFormOpen} title="Schedule Lecture" description="Schedule a virtual class session." onSubmit={handleAddLecture}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={lectForm.title} onChange={(e) => setLectForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Binary Trees - Part 1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={lectForm.date} onChange={(e) => setLectForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={lectForm.startTime} onChange={(e) => setLectForm((f) => ({ ...f, startTime: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input type="number" min={15} value={lectForm.duration} onChange={(e) => setLectForm((f) => ({ ...f, duration: Number(e.target.value) }))} />
          </div>
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={lectForm.platform} onValueChange={(val) => setLectForm((f) => ({ ...f, platform: val }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="jitsi">Jitsi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Meeting Link</Label>
            <Input type="url" value={lectForm.meetingLink} onChange={(e) => setLectForm((f) => ({ ...f, meetingLink: e.target.value }))} placeholder="https://zoom.us/j/..." />
          </div>
        </div>
      </EntityFormDialog>

      {/* ─── Delete Confirmation ──────────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete"
        description={`Are you sure you want to delete "${deletingItem?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
