import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Award, Download, Eye, Search } from "lucide-react";
import { toast } from "sonner";

import type { Certificate } from "@/lib/types";
import { mockCertificates, mockCourses, mockUsers } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
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

// ─── Certificate Preview Component ────────────────────────────────────────────

function CertificatePreview({
  certificate,
  onClose,
  onDownload,
}: {
  certificate: Certificate;
  onClose: () => void;
  onDownload: (cert: Certificate) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Certificate Preview</h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="mx-auto max-w-2xl rounded-xl border-4 border-primary/20 bg-linear-to-br from-primary/5 to-background p-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Award className="h-8 w-8 text-primary" />
          <span className="font-display text-xl font-bold text-primary">Makerere University</span>
        </div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Certificate of Completion
        </p>
        <div className="my-6 border-y border-border py-6">
          <p className="text-sm text-muted-foreground">This is to certify that</p>
          <p className="mt-2 font-display text-2xl font-bold">{certificate.studentName}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            has successfully completed the course
          </p>
          <p className="mt-2 text-lg font-semibold">{certificate.courseTitle}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Completion Date: {format(new Date(certificate.completionDate), "dd MMMM yyyy")}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Serial: {certificate.serialNumber}</span>
          <span>Issued: {format(new Date(certificate.issueDate), "dd MMM yyyy")}</span>
        </div>
        <Badge
          variant={certificate.status === "valid" ? "default" : "destructive"}
          className="mt-4"
        >
          {certificate.status === "valid" ? "Valid" : "Revoked"}
        </Badge>
      </div>
      <div className="mt-4 flex justify-center">
        <Button onClick={() => onDownload(certificate)}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}

// ─── Admin View ────────────────────────────────────────────────────────────────

function AdminCertificatesView() {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [studentSearch, setStudentSearch] = useState("");

  const filteredCertificates = useMemo(() => {
    let result = [...mockCertificates];
    if (courseFilter && courseFilter !== "all") {
      result = result.filter((c) => c.courseId === courseFilter);
    }
    if (studentSearch.trim()) {
      const query = studentSearch.toLowerCase();
      result = result.filter((c) => c.studentName.toLowerCase().includes(query));
    }
    return result;
  }, [courseFilter, studentSearch]);

  const getStudentName = (studentId: string) => {
    const user = mockUsers.find((u) => u.id === studentId);
    return user?.name ?? "Unknown";
  };

  const getCourseTitle = (courseId: string) => {
    const course = mockCourses.find((c) => c.id === courseId);
    return course?.title ?? "Unknown";
  };

  const handleDownload = (cert: Certificate) => {
    toast.success("PDF download started", {
      description: `Certificate ${cert.serialNumber} is being generated.`,
    });
  };

  const columns: ColumnDef<Certificate>[] = [
    { key: "serialNumber", header: "Serial Number" },
    {
      key: "studentName",
      header: "Student Name",
      render: (row) => getStudentName(row.studentId),
    },
    {
      key: "courseTitle",
      header: "Course",
      render: (row) => getCourseTitle(row.courseId),
    },
    {
      key: "issueDate",
      header: "Issue Date",
      render: (row) => format(new Date(row.issueDate), "dd MMM yyyy"),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={row.status === "valid" ? "default" : "destructive"}>
          {row.status === "valid" ? "Valid" : "Revoked"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certification Management"
        description="Manage and issue student certificates."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Filter by Course</Label>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {mockCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Search Student</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student name..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-[250px] pl-9"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={filteredCertificates as unknown as Record<string, unknown>[]}
          searchableFields={["serialNumber", "studentName"]}
          searchPlaceholder="Search certificates..."
          rowActions={(row) => {
            const cert = row as unknown as Certificate;
            return (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setSelectedCertificate(cert)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDownload(cert)}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            );
          }}
        />
      </div>

      {/* Certificate Preview */}
      {selectedCertificate && (
        <CertificatePreview
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}

// ─── Student View ──────────────────────────────────────────────────────────────

function StudentCertificatesView() {
  const { user } = useAuth();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const myCertificates = mockCertificates.filter((c) => c.studentId === user.id);

  const handleDownload = (cert: Certificate) => {
    toast.success("PDF download started", {
      description: `Certificate ${cert.serialNumber} is being generated.`,
    });
  };

  const columns: ColumnDef<Certificate>[] = [
    { key: "serialNumber", header: "Serial Number" },
    { key: "courseTitle", header: "Course" },
    {
      key: "issueDate",
      header: "Issue Date",
      render: (row) => format(new Date(row.issueDate), "dd MMM yyyy"),
    },
    {
      key: "completionDate",
      header: "Completion Date",
      render: (row) => format(new Date(row.completionDate), "dd MMM yyyy"),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={row.status === "valid" ? "default" : "destructive"}>
          {row.status === "valid" ? "Valid" : "Revoked"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Certificates"
        description="View and download your earned certificates."
      />

      {myCertificates.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-soft">
          <Award className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="font-medium">No certificates yet</p>
          <p className="mt-1 text-sm">Complete your courses to earn certificates.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <DataTable<Record<string, unknown>>
            columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
            data={myCertificates as unknown as Record<string, unknown>[]}
            searchableFields={["courseTitle", "serialNumber"]}
            searchPlaceholder="Search certificates..."
            rowActions={(row) => {
              const cert = row as unknown as Certificate;
              return (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCertificate(cert)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(cert)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              );
            }}
          />
        </div>
      )}

      {/* Certificate Preview */}
      {selectedCertificate && (
        <CertificatePreview
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DashboardCertificates() {
  const { user } = useAuth();

  if (user.role === "student") {
    return <StudentCertificatesView />;
  }

  return <AdminCertificatesView />;
}
