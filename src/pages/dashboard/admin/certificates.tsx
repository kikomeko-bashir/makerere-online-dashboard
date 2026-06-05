import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Award, Download, Eye, Search, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

import { api } from "@/lib/api";
import type { ApiCertificate, ApiUser, ApiCourse, ApiCourseUnit } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import crest from "@/assets/makerere-logo.png";

// ─── PDF Download Helper ──────────────────────────────────────────────────────

function loadImageAsBase64(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject("Canvas not supported"); return; }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject("Failed to load image");
    img.src = src;
  });
}

async function downloadCertificatePDF(cert: ApiCertificate) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // Background
  pdf.setFillColor(250, 248, 245);
  pdf.rect(0, 0, w, h, "F");

  // Border (maroon)
  pdf.setDrawColor(107, 29, 29);
  pdf.setLineWidth(1.2);
  pdf.roundedRect(12, 10, w - 24, h - 20, 4, 4, "S");

  // Inner border (gold)
  pdf.setDrawColor(196, 160, 60);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(16, 14, w - 32, h - 28, 3, 3, "S");

  // Corner decorations (gold)
  pdf.setDrawColor(196, 160, 60);
  pdf.setLineWidth(0.8);
  pdf.line(18, 16, 18, 26); pdf.line(18, 16, 28, 16);
  pdf.line(w - 18, 16, w - 18, 26); pdf.line(w - 18, 16, w - 28, 16);
  pdf.line(18, h - 16, 18, h - 26); pdf.line(18, h - 16, 28, h - 16);
  pdf.line(w - 18, h - 16, w - 18, h - 26); pdf.line(w - 18, h - 16, w - 28, h - 16);

  // Add logo
  try {
    const logoBase64 = await loadImageAsBase64(crest);
    pdf.addImage(logoBase64, "PNG", w / 2 - 8, 20, 16, 16);
  } catch {
    // Skip logo if loading fails
  }

  // School name (below logo)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(107, 29, 29);
  pdf.text("MAKERERE ONLINE SCHOOL", w / 2, 44, { align: "center" });

  // Gold divider
  pdf.setDrawColor(196, 160, 60);
  pdf.setLineWidth(0.5);
  pdf.line(w / 2 - 40, 49, w / 2 + 40, 49);

  // Certificate of Completion
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(196, 160, 60);
  pdf.text("CERTIFICATE OF COMPLETION", w / 2, 56, { align: "center" });

  // "This is to certify that"
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(107, 114, 128);
  pdf.text("This is to certify that", w / 2, 70, { align: "center" });

  // Student name
  pdf.setFont("times", "bold");
  pdf.setFontSize(26);
  pdf.setTextColor(31, 41, 55);
  pdf.text(cert.student_name, w / 2, 84, { align: "center" });

  // "has successfully completed the course/unit"
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(107, 114, 128);
  const typeText = cert.certificate_type === "course" ? "course" : "course unit";
  pdf.text(`has successfully completed the ${typeText}`, w / 2, 96, { align: "center" });

  // Course/unit title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(107, 29, 29);
  pdf.text(cert.title, w / 2, 108, { align: "center" });

  // Gold divider
  pdf.setDrawColor(196, 160, 60);
  pdf.setLineWidth(0.5);
  pdf.line(w / 2 - 40, 115, w / 2 + 40, 115);

  // Issue date
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(107, 114, 128);
  const dateStr = format(new Date(cert.issue_date), "dd MMMM yyyy");
  pdf.text(`Issued on ${dateStr}`, w / 2, 124, { align: "center" });

  // Footer — certificate number
  pdf.setFont("courier", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(156, 163, 175);
  pdf.text(cert.certificate_number, 30, h - 22);

  // Footer — status
  if (cert.status === "active") {
    pdf.setTextColor(5, 150, 105);
    pdf.text("Verified", w - 30, h - 22, { align: "right" });
  } else {
    pdf.setTextColor(220, 38, 38);
    pdf.text("Revoked", w - 30, h - 22, { align: "right" });
  }

  pdf.save(`Certificate-${cert.certificate_number}.pdf`);
}

// ─── Certificate Render (reusable for preview and download) ──────────────────

function CertificateDesign({ cert }: { cert: ApiCertificate }) {
  return (
    <div
      className="relative rounded-xl p-10 text-center"
      style={{
        background: "linear-gradient(135deg, #faf8f5 0%, #ffffff 40%, #faf8f5 100%)",
        border: "3px solid oklch(0.42 0.18 25)",
        boxShadow: "inset 0 0 0 6px oklch(0.42 0.18 25 / 0.08)",
      }}
    >
      <div className="absolute inset-3 rounded-lg pointer-events-none" style={{ border: "1px solid oklch(0.78 0.14 80 / 0.6)" }} />
      <div className="absolute top-4 left-4 h-10 w-10 border-t-2 border-l-2 rounded-tl-md" style={{ borderColor: "oklch(0.78 0.14 80)" }} />
      <div className="absolute top-4 right-4 h-10 w-10 border-t-2 border-r-2 rounded-tr-md" style={{ borderColor: "oklch(0.78 0.14 80)" }} />
      <div className="absolute bottom-4 left-4 h-10 w-10 border-b-2 border-l-2 rounded-bl-md" style={{ borderColor: "oklch(0.78 0.14 80)" }} />
      <div className="absolute bottom-4 right-4 h-10 w-10 border-b-2 border-r-2 rounded-br-md" style={{ borderColor: "oklch(0.78 0.14 80)" }} />

      <div className="mb-6 flex flex-col items-center gap-3">
        <img src={crest} alt="Makerere Online Logo" className="h-16 w-16 object-contain" />
        <h2 className="font-display text-xl font-bold tracking-wide" style={{ color: "oklch(0.42 0.18 25)" }}>
          MAKERERE ONLINE SCHOOL
        </h2>
      </div>

      <div className="mx-auto mb-4 h-0.5 w-48" style={{ background: "linear-gradient(90deg, transparent, oklch(0.78 0.14 80), transparent)" }} />

      <p className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: "oklch(0.78 0.14 80)" }}>
        Certificate of Completion
      </p>

      <div className="my-8 space-y-4">
        <p className="text-sm text-gray-500">This is to certify that</p>
        <p className="font-display text-3xl font-bold" style={{ color: "oklch(0.22 0.08 30)" }}>
          {cert.student_name}
        </p>
        <p className="text-sm text-gray-500">
          has successfully completed the {cert.certificate_type === "course" ? "course" : "course unit"}
        </p>
        <p className="text-xl font-semibold" style={{ color: "oklch(0.42 0.18 25)" }}>
          {cert.title}
        </p>
      </div>

      <div className="mx-auto mb-6 h-0.5 w-48" style={{ background: "linear-gradient(90deg, transparent, oklch(0.78 0.14 80), transparent)" }} />

      <p className="text-sm text-gray-500">
        Issued on <span className="font-medium text-gray-700">{format(new Date(cert.issue_date), "dd MMMM yyyy")}</span>
      </p>

      <div className="mt-8 flex items-center justify-between px-6 text-xs text-gray-400">
        <span className="font-mono">{cert.certificate_number}</span>
        <span className="font-semibold" style={{ color: cert.status === "active" ? "oklch(0.55 0.15 145)" : "oklch(0.55 0.2 25)" }}>
          {cert.status === "active" ? "✓ Verified" : "✗ Revoked"}
        </span>
      </div>
    </div>
  );
}

// ─── Issue Certificate Dialog ─────────────────────────────────────────────────

function IssueCertificateDialog({
  open, onOpenChange, users, courses, courseUnits, onIssued,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  users: ApiUser[];
  courses: ApiCourse[];
  courseUnits: ApiCourseUnit[];
  onIssued: () => void;
}) {
  const [studentId, setStudentId] = useState("");
  const [certType, setCertType] = useState<"course" | "course_unit">("course");
  const [courseId, setCourseId] = useState("");
  const [courseUnitId, setCourseUnitId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const students = users.filter((u) => u.role === "student");
  const selectedStudent = students.find((s) => s.id === studentId);
  const selectedCourse = courses.find((c) => c.id === courseId);
  const selectedUnit = courseUnits.find((u) => u.id === courseUnitId);

  async function handleSubmit() {
    if (!studentId) { toast.error("Select a student"); return; }
    if (certType === "course" && !courseId) { toast.error("Select a course"); return; }
    if (certType === "course_unit" && !courseUnitId) { toast.error("Select a course unit"); return; }

    setSubmitting(true);
    try {
      await api.issueCertificate({
        student_id: studentId,
        certificate_type: certType,
        course_id: certType === "course" ? courseId : undefined,
        course_unit_id: certType === "course_unit" ? courseUnitId : undefined,
        student_name: selectedStudent?.name || "",
        title: certType === "course" ? selectedCourse?.title || "" : selectedUnit?.title || "",
      });
      toast.success("Certificate issued");
      onOpenChange(false);
      onIssued();
      setStudentId(""); setCertType("course"); setCourseId(""); setCourseUnitId("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Issue Certificate</DialogTitle>
          <DialogDescription>Issue a completion certificate for a student.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger><SelectValue placeholder="Select student..." /></SelectTrigger>
              <SelectContent>{students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={certType} onValueChange={(v) => setCertType(v as "course" | "course_unit")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="course">Course Completion</SelectItem>
                <SelectItem value="course_unit">Course Unit Completion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {certType === "course" && (
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger><SelectValue placeholder="Select course..." /></SelectTrigger>
                <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {certType === "course_unit" && (
            <div className="space-y-2">
              <Label>Course Unit</Label>
              <Select value={courseUnitId} onValueChange={setCourseUnitId}>
                <SelectTrigger><SelectValue placeholder="Select unit..." /></SelectTrigger>
                <SelectContent>{courseUnits.map((u) => <SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Admin Certificates Page ─────────────────────────────────────────────

export default function DashboardCertificates() {
  const [certificates, setCertificates] = useState<ApiCertificate[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [courseUnits, setCourseUnits] = useState<ApiCourseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [previewCert, setPreviewCert] = useState<ApiCertificate | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);

  const [studentSearch, setStudentSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  function loadData() {
    setLoading(true);
    Promise.all([api.getCertificates(), api.getUsers(), api.getCourses(), api.getCourseUnits()])
      .then(([certs, u, c, cu]) => { setCertificates(certs); setUsers(u); setCourses(c); setCourseUnits(cu); })
      .catch((err) => toast.error(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  const filtered = certificates.filter((cert) => {
    if (typeFilter !== "all" && cert.certificate_type !== typeFilter) return false;
    if (statusFilter !== "all" && cert.status !== statusFilter) return false;
    if (studentSearch.trim() && !cert.student_name.toLowerCase().includes(studentSearch.toLowerCase())) return false;
    return true;
  });

  async function handleDownload(cert: ApiCertificate) {
    setDownloading(true);
    try {
      await downloadCertificatePDF(cert);
      toast.success("Certificate downloaded!");
    } catch {
      toast.error("PDF generation failed");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadSample() {
    setDownloading(true);
    try {
      await downloadCertificatePDF(sampleCert);
      toast.success("Sample certificate downloaded!");
    } catch {
      toast.error("PDF generation failed");
    } finally {
      setDownloading(false);
    }
  }

  const sampleCert: ApiCertificate = {
    id: "sample",
    student_id: "sample",
    certificate_type: "course",
    course_id: null,
    course_unit_id: null,
    certificate_number: "MAK-2026-XXXXX",
    student_name: "John Doe (Sample)",
    title: "Bachelor of Computer Science",
    issue_date: new Date().toISOString().split("T")[0],
    status: "active",
    created_at: new Date().toISOString(),
  };

  const columns: ColumnDef<ApiCertificate>[] = [
    { key: "certificate_number", header: "Certificate No." },
    { key: "student_name", header: "Student" },
    { key: "title", header: "Title" },
    { key: "certificate_type", header: "Type", render: (row) => <Badge variant="outline">{row.certificate_type === "course" ? "Course" : "Unit"}</Badge> },
    { key: "issue_date", header: "Issued", render: (row) => format(new Date(row.issue_date), "dd MMM yyyy") },
    { key: "status", header: "Status", render: (row) => <Badge variant={row.status === "active" ? "default" : "destructive"}>{row.status}</Badge> },
  ];

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Certification Management" description="Issue and manage student certificates." />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setIssueOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Issue Certificate</Button>
        <Button variant="outline" onClick={handleDownloadSample} disabled={downloading} className="gap-2">
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download Sample
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Search Student</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="w-[220px] pl-9" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="course_unit">Unit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={filtered as unknown as Record<string, unknown>[]}
          searchableFields={["certificate_number", "student_name", "title"]}
          searchPlaceholder="Search certificates..."
          rowActions={(row) => {
            const cert = row as unknown as ApiCertificate;
            return (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPreviewCert(cert)}><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDownload(cert)}><Download className="h-4 w-4" /></Button>
              </div>
            );
          }}
        />
      </div>

      {/* Certificate Preview Dialog */}
      {previewCert && (
        <Dialog open={!!previewCert} onOpenChange={() => setPreviewCert(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Certificate Preview</DialogTitle></DialogHeader>
            <CertificateDesign cert={previewCert} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewCert(null)}>Close</Button>
              <Button onClick={() => { handleDownload(previewCert); setPreviewCert(null); }} className="gap-2">
                <Download className="h-4 w-4" />Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Issue Dialog */}
      <IssueCertificateDialog
        open={issueOpen}
        onOpenChange={setIssueOpen}
        users={users}
        courses={courses}
        courseUnits={courseUnits}
        onIssued={loadData}
      />
    </div>
  );
}
