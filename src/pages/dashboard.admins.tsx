import { PageHeader } from "@/components/dashboard/page-header";

export default function DashboardAdmins() {
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Management" description="Manage administrator accounts and permissions." />
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Admin management interface coming soon.</p>
      </div>
    </div>
  );
}
