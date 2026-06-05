import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Award, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

import { api } from "@/lib/api";
import type { ApiCertificate } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import crest from "@/assets/makerere-logo.png";

// ─── PDF Download Helper ──────────────────────────────────────────────────────

function downloadCertificatePDF(cert: ApiCertificate) {
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

  // Corner decorations
  pdf.setDrawColor(196, 160, 60);
  pdf.setLineWidth(0.8);
  pdf.line(18, 16, 18, 26); pdf.line(18, 16, 28, 16);
  pdf.line(w - 18, 16, w - 18, 26); pdf.line(w - 18, 16, w - 28, 16);
  pdf.line(18, h - 16, 18, h - 26); pdf.line(18, h - 16, 28, h - 16);
  pdf.line(w - 18, h - 16, w - 18, h - 26); pdf.line(w - 18, h - 16, w - 28, h - 16);

  // School name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(107, 29, 29);
  pdf.text("MAKERERE ONLINE SCHOOL", w / 2, 38, { align: "center" });

  // Gold divider
  pdf.setDrawColor(196, 160, 60);
  pdf.setLineWidth(0.5);
  pdf.line(w / 2 - 40, 44, w / 2 + 40, 44);

  // Certificate of Completion
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(196, 160, 60);
  pdf.text("CERTIFICATE OF COMPLETION", w / 2, 52, { align: "center" });

  // This is to certify that
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(107, 114, 128);
  pdf.text("This is to certify that", w / 2, 68, { align: "center" });

  // Student name
  pdf.setFont("times", "bold");
  pdf.setFontSize(26);
  pdf.setTextColor(31, 41, 55);
  pdf.text(cert.student_name, w / 2, 82, { align: "center" });

  // has successfully completed
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(107, 114, 128);
  const typeText = cert.certificate_type === "course" ? "course" : "course unit";
  pdf.text(`has successfully completed the ${typeText}`, w / 2, 94, { align: "center" });

  // Course title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(107, 29, 29);
  pdf.text(cert.title, w / 2, 106, { align: "center" });

  // Gold divider
  pdf.setDrawColor(196, 160, 60);
  pdf.setLineWidth(0.5);
  pdf.line(w / 2 - 40, 114, w / 2 + 40, 114);

  // Date
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Issued on ${format(new Date(cert.issue_date), "dd MMMM yyyy")}`, w / 2, 124, { align: "center" });

  // Certificate number
  pdf.setFont("courier", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(156, 163, 175);
  pdf.text(cert.certificate_number, 30, h - 22);

  // Status
  if (cert.status === "active") {
    pdf.setTextColor(5, 150, 105);
    pdf.text("Verified", w - 30, h - 22, { align: "right" });
  } else {
    pdf.setTextColor(220, 38, 38);
    pdf.text("Revoked", w - 30, h - 22, { align: "right" });
  }

  pdf.save(`Certificate-${cert.certificate_number}.pdf`);
}

// ─── Certificate Card ─────────────────────────────────────────────────────────

function CertificateCard({
  certificate,
  onDownload,
  downloading,
}: {
  certificate: ApiCertificate;
  onDownload: (cert: ApiCertificate) => void;
  downloading: string | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      {/* The certificate design */}
      <div className="mx-auto max-w-3xl">
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
          <p className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: "oklch(0.78 0.14 80)" }}>Certificate of Completion</p>

          <div className="my-8 space-y-4">
            <p className="text-sm text-gray-500">This is to certify that</p>
            <p className="font-display text-3xl font-bold" style={{ color: "oklch(0.22 0.08 30)" }}>{certificate.student_name}</p>
            <p className="text-sm text-gray-500">has successfully completed the {certificate.certificate_type === "course" ? "course" : "course unit"}</p>
            <p className="text-xl font-semibold" style={{ color: "oklch(0.42 0.18 25)" }}>{certificate.title}</p>
          </div>

          <div className="mx-auto mb-6 h-0.5 w-48" style={{ background: "linear-gradient(90deg, transparent, oklch(0.78 0.14 80), transparent)" }} />
          <p className="text-sm text-gray-500">Issued on <span className="font-medium text-gray-700">{format(new Date(certificate.issue_date), "dd MMMM yyyy")}</span></p>

          <div className="mt-8 flex items-center justify-between px-6 text-xs text-gray-400">
            <span className="font-mono">{certificate.certificate_number}</span>
            <span className="font-semibold" style={{ color: certificate.status === "active" ? "oklch(0.55 0.15 145)" : "oklch(0.55 0.2 25)" }}>
              {certificate.status === "active" ? "✓ Verified" : "✗ Revoked"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          onClick={() => onDownload(certificate)}
          disabled={downloading === certificate.id}
          className="gap-2"
        >
          {downloading === certificate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download PDF
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState<ApiCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    api
      .getCertificates()
      .then(setCertificates)
      .catch((err) => toast.error(err.message || "Failed to load certificates"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload(cert: ApiCertificate) {
    setDownloading(cert.id);
    try {
      downloadCertificatePDF(cert);
      toast.success("Certificate downloaded!");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Certificates"
        description="View and download your earned certificates."
      />

      {certificates.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-soft">
          <Award className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="font-medium">No certificates yet</p>
          <p className="mt-1 text-sm">
            Complete your courses and course units to earn certificates.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              onDownload={handleDownload}
              downloading={downloading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
