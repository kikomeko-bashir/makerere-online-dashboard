import { PageHeader } from "@/components/dashboard/page-header";

export default function DashboardSchools() {
  return (
    <div className="space-y-6">
      <PageHeader title="School Management" description="Manage schools and faculties across the platform." />
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>School management interface coming soon.</p>
      </div>
    </div>
  );
}
