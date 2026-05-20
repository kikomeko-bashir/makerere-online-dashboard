import { PageHeader } from "@/components/dashboard/page-header";

export default function DashboardCertificates() {
  return (
    <div className="space-y-6">
      <PageHeader title="Certificates" description="Manage and issue certificates." />
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Certificate management interface coming soon.</p>
      </div>
    </div>
  );
}
