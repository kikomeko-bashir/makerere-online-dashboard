import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/dashboard/page-header";

export default function DashboardExamDetail() {
  const { examId } = useParams<{ examId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title="Exam Detail" description={`Viewing exam: ${examId}`} />
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Exam detail view coming soon.</p>
      </div>
    </div>
  );
}
