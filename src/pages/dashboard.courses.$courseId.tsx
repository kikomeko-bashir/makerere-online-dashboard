import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/dashboard/page-header";

export default function DashboardCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title="Course Detail" description={`Viewing course: ${courseId}`} />
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Course detail view coming soon.</p>
      </div>
    </div>
  );
}
