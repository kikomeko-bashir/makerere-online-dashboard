import {
  Users,
  DollarSign,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  mockReportingKpis,
  mockEnrollmentTrends,
  mockRevenueBySchool,
  mockTopCourses,
  mockLecturerPerformance,
} from "@/lib/mock-data";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import type { TopCourse, LecturerPerformance } from "@/lib/mock-data";

function formatUGX(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `UGX ${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `UGX ${(amount / 1_000_000).toFixed(0)}M`;
  }
  return `UGX ${amount.toLocaleString()}`;
}

export default function DashboardReporting() {
  const topCoursesColumns: ColumnDef<TopCourse>[] = [
    { key: "courseTitle", header: "Course" },
    { key: "schoolName", header: "School" },
    {
      key: "enrollmentCount",
      header: "Enrollments",
      render: (row) => row.enrollmentCount.toLocaleString(),
    },
    {
      key: "passRate",
      header: "Pass Rate",
      render: (row) => `${row.passRate}%`,
    },
  ];

  const lecturerColumns: ColumnDef<LecturerPerformance>[] = [
    { key: "lecturerName", header: "Lecturer Name" },
    {
      key: "courses",
      header: "Courses",
      render: (row) => String(row.courses),
    },
    {
      key: "students",
      header: "Students",
      render: (row) => row.students.toLocaleString(),
    },
    {
      key: "averageRating",
      header: "Avg Rating",
      render: (row) => `${row.averageRating.toFixed(1)} / 5.0`,
    },
    {
      key: "passRate",
      header: "Pass Rate",
      render: (row) => `${row.passRate}%`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporting & Analytics"
        description="View reports and analytics across the platform."
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          value={mockReportingKpis.totalEnrollments.toLocaleString()}
          label="Total Enrollments"
        />
        <KpiCard
          icon={DollarSign}
          value={formatUGX(mockReportingKpis.totalRevenue)}
          label="Total Revenue"
        />
        <KpiCard
          icon={TrendingUp}
          value={`${mockReportingKpis.averagePassRate}%`}
          label="Average Pass Rate"
        />
        <KpiCard
          icon={GraduationCap}
          value={String(mockReportingKpis.activeLecturers)}
          label="Active Lecturers"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enrollment Trends */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold">
            Enrollment Trends (Past 12 Months)
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockEnrollmentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [value, "Enrollments"]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by School */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold">Revenue by School</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRevenueBySchool} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  fontSize={12}
                  tickFormatter={(value: number) =>
                    `${(value / 1_000_000_000).toFixed(1)}B`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="schoolName"
                  fontSize={11}
                  width={120}
                  tickFormatter={(value: string) =>
                    value.length > 15 ? `${value.slice(0, 15)}...` : value
                  }
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatUGX(value),
                    "Revenue",
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Courses */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Top Performing Courses</h2>
        <DataTable<Record<string, unknown>>
          columns={
            topCoursesColumns as unknown as ColumnDef<
              Record<string, unknown>
            >[]
          }
          data={mockTopCourses as unknown as Record<string, unknown>[]}
          searchableFields={["courseTitle", "schoolName"]}
          searchPlaceholder="Search courses..."
        />
      </div>

      {/* Lecturer Performance */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Lecturer Performance</h2>
        <DataTable<Record<string, unknown>>
          columns={
            lecturerColumns as unknown as ColumnDef<
              Record<string, unknown>
            >[]
          }
          data={
            mockLecturerPerformance as unknown as Record<string, unknown>[]
          }
          searchableFields={["lecturerName"]}
          searchPlaceholder="Search lecturers..."
        />
      </div>
    </div>
  );
}
