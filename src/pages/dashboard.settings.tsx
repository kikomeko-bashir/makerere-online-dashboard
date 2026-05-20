import { PageHeader } from "@/components/dashboard/page-header";

export default function DashboardSettings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure system settings and preferences." />
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Settings interface coming soon.</p>
      </div>
    </div>
  );
}
