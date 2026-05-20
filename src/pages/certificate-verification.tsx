import { useState } from "react";
import { mockCertificates } from "@/lib/mock-data";
import type { Certificate } from "@/lib/types";
import crest from "@/assets/makerere-logo.png";
import { Search, ShieldCheck, ShieldX, Loader2 } from "lucide-react";

export default function CertificateVerification() {
  const [serialNumber, setSerialNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<
    | { type: "found"; certificate: Certificate }
    | { type: "not-found" }
    | null
  >(null);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!serialNumber.trim()) return;

    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      const certificate = mockCertificates.find(
        (cert) =>
          cert.serialNumber.toLowerCase() === serialNumber.trim().toLowerCase(),
      );

      if (certificate) {
        setResult({ type: "found", certificate });
      } else {
        setResult({ type: "not-found" });
      }
      setIsLoading(false);
    }, 1500);
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] flex flex-col items-center px-4 py-12 md:py-20">
      <div className="flex flex-col items-center gap-3 mb-10">
        <img
          src={crest}
          alt="Makerere University crest"
          className="h-16 w-16 object-contain drop-shadow-sm"
        />
        <div className="text-center">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Certificate Verification
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold font-medium">
            Makerere Online School
          </p>
        </div>
      </div>

      <p className="max-w-md text-center text-sm text-muted-foreground mb-8">
        Verify the authenticity of a certificate issued by Makerere Online
        School. Enter the certificate serial number below.
      </p>

      <form onSubmit={handleVerify} className="w-full max-w-md flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="e.g. MAK-2024-CS-00145"
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60"
            aria-label="Certificate serial number"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !serialNumber.trim()}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
        </button>
      </form>

      {isLoading && (
        <div className="mt-10 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Verifying certificate...</p>
        </div>
      )}

      {result?.type === "found" && (
        <div className="mt-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            {result.certificate.status === "valid" ? (
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 border border-emerald-200">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Valid Certificate</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 border border-red-200">
                <ShieldX className="h-5 w-5 text-red-600" />
                <span className="text-sm font-semibold text-red-700">Revoked Certificate</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField label="Student Name" value={result.certificate.studentName} />
              <DetailField label="Serial Number" value={result.certificate.serialNumber} />
              <DetailField label="Course" value={result.certificate.courseTitle} />
              <DetailField label="Issue Date" value={formatDate(result.certificate.issueDate)} />
              <DetailField label="Completion Date" value={formatDate(result.certificate.completionDate)} />
              <DetailField
                label="Verification Status"
                value={result.certificate.status === "valid" ? "Valid" : "Revoked"}
                highlight={result.certificate.status === "valid"}
              />
            </div>
          </div>
        </div>
      )}

      {result?.type === "not-found" && (
        <div className="mt-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
          <ShieldX className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <h3 className="mt-3 font-display text-lg font-semibold text-foreground">Certificate not found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No certificate matches the serial number you entered. Please double-check and try again.
          </p>
        </div>
      )}
    </section>
  );
}

function DetailField({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`mt-0.5 text-sm font-medium ${highlight ? "text-emerald-600" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-UG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
