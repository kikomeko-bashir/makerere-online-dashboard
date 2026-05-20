import type { LucideIcon } from "lucide-react";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import type { UserRole } from "@/lib/types";

interface KpiItem {
  icon: LucideIcon;
  value: string;
  label: string;
  delta?: string;
}

function getKpisForRole(role: UserRole): KpiItem[] {
  switch (role) {
    case "super_admin":
    case "admin":
      return [
        { icon: GraduationCap, value: "24,812", label: "Total Students", delta: "+12% this term" },
        { icon: Users, value: "640", label: "Active Lecturers", delta: "+3% this term" },
        { icon: BookOpen, value: "320", label: "Live Courses", delta: "+8 new" },
        { icon: DollarSign, value: "UGX 184.2M", label: "Revenue", delta: "+18% this term" },
      ];
    case "lecturer":
      return [
        { icon: BookOpen, value: "5", label: "My Courses" },
        { icon: GraduationCap, value: "428", label: "Total Students", delta: "+24 this week" },
        { icon: Calendar, value: "2", label: "Upcoming Classes" },
        { icon: FileText, value: "18", label: "Pending Submissions", delta: "3 overdue" },
      ];
    case "student":
      return [
        { icon: BookOpen, value: "6", label: "Enrolled Courses" },
        { icon: Calendar, value: "2", label: "Upcoming Classes" },
        { icon: CreditCard, value: "1", label: "Pending Payments" },
        { icon: TrendingUp, value: "82%", label: "Average Grade", delta: "+4% this term" },
      ];
  }
}

function getPageTitle(role: UserRole): { title: string; description: string } {
  switch (role) {
    case "super_admin":
    case "admin":
      return { title: "Platform Overview", description: "Key metrics and performance indicators across the platform" };
    case "lecturer":
      return { title: "My Dashboard", description: "Your teaching activity and upcoming schedule" };
    case "student":
      return { title: "My Dashboard", description: "Your academic progress and upcoming activities" };
  }
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const kpis = getKpisForRole(user.role);
  const { title, description } = getPageTitle(user.role);

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            icon={kpi.icon}
            value={kpi.value}
            label={kpi.label}
            delta={kpi.delta}
          />
        ))}
      </div>
    </div>
  );
}
