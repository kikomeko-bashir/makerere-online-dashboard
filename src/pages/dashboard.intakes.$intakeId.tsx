import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/dashboard/page-header";

export default function DashboardIntakeDetail() {
  const { intakeId } = useParams<{ intakeId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title="Intake Detail" description={`Viewing intake: ${intakeId}`} />
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Intake detail view coming soon.</p>
      </div>
    </div>
  );
}
