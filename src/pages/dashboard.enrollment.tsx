import { PageHeader } from "@/components/dashboard/page-header";

export default function DashboardEnrollment() {
  return (
    <div className="space-y-6">
      <PageHeader title="Enrollment" description="Manage student enrollments across courses." />
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Enrollment management interface coming soon.</p>
      </div>
    </div>
  );
}
