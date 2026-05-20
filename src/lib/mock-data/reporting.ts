import type { EnrollmentTrend, ReportingKpis, RevenueBySchool } from "@/lib/types";

export const mockReportingKpis: ReportingKpis = {
  totalEnrollments: 1245,
  totalRevenue: 3850000000,
  averagePassRate: 72.5,
  activeLecturers: 48,
};

export const mockEnrollmentTrends: EnrollmentTrend[] = [
  { month: "Dec", year: 2023, count: 85 },
  { month: "Jan", year: 2024, count: 210 },
  { month: "Feb", year: 2024, count: 145 },
  { month: "Mar", year: 2024, count: 178 },
  { month: "Apr", year: 2024, count: 92 },
  { month: "May", year: 2024, count: 68 },
  { month: "Jun", year: 2024, count: 55 },
  { month: "Jul", year: 2024, count: 42 },
  { month: "Aug", year: 2024, count: 195 },
  { month: "Sep", year: 2024, count: 165 },
  { month: "Oct", year: 2024, count: 120 },
  { month: "Nov", year: 2024, count: 98 },
];

export const mockRevenueBySchool: RevenueBySchool[] = [
  { schoolName: "School of Computing and Informatics Technology", revenue: 1250000000 },
  { schoolName: "School of Business", revenue: 980000000 },
  { schoolName: "School of Engineering", revenue: 750000000 },
  { schoolName: "School of Education", revenue: 420000000 },
  { schoolName: "School of Law", revenue: 350000000 },
  { schoolName: "School of Health Sciences", revenue: 100000000 },
];

export interface TopCourse {
  courseTitle: string;
  schoolName: string;
  enrollmentCount: number;
  passRate: number;
}

export const mockTopCourses: TopCourse[] = [
  {
    courseTitle: "Bachelor of Science in Computer Science",
    schoolName: "SCIT",
    enrollmentCount: 320,
    passRate: 78.5,
  },
  {
    courseTitle: "Bachelor of Business Administration",
    schoolName: "SOB",
    enrollmentCount: 285,
    passRate: 72.0,
  },
  {
    courseTitle: "Diploma in Information Technology",
    schoolName: "SCIT",
    enrollmentCount: 210,
    passRate: 81.2,
  },
  {
    courseTitle: "Bachelor of Science in Civil Engineering",
    schoolName: "SOE",
    enrollmentCount: 165,
    passRate: 65.8,
  },
  {
    courseTitle: "Certificate in Data Science",
    schoolName: "SCIT",
    enrollmentCount: 145,
    passRate: 85.0,
  },
];

export interface LecturerPerformance {
  lecturerName: string;
  courses: number;
  students: number;
  averageRating: number;
  passRate: number;
}

export const mockLecturerPerformance: LecturerPerformance[] = [
  {
    lecturerName: "Dr. Agnes Namutebi",
    courses: 3,
    students: 156,
    averageRating: 4.8,
    passRate: 82.3,
  },
  {
    lecturerName: "Dr. Peter Ssekitoleko",
    courses: 3,
    students: 134,
    averageRating: 4.5,
    passRate: 75.6,
  },
  {
    lecturerName: "Dr. Florence Nakamya",
    courses: 3,
    students: 98,
    averageRating: 4.6,
    passRate: 70.2,
  },
  {
    lecturerName: "Dr. Ronald Mukisa",
    courses: 3,
    students: 112,
    averageRating: 4.3,
    passRate: 68.9,
  },
];
