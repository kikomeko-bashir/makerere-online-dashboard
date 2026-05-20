import { PageHeader } from "@/components/dashboard/page-header";

export default function DashboardPayments() {
  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Track and manage payments and transactions." />
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Payments interface coming soon.</p>
      </div>
    </div>
  );
}
