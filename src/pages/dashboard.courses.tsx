import { PageHeader } from "@/components/dashboard/page-header";

export default function DashboardCourses() {
  return (
    <div className="space-y-6">
      <PageHeader title="Course Management" description="Create, edit, and manage courses." />
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Course management interface coming soon.</p>
      </div>
    </div>
  );
}
