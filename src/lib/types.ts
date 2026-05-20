// ─── Enums / Union Types ───────────────────────────────────────────────────────

export type UserRole = "super_admin" | "admin" | "lecturer" | "student";
export type Status = "active" | "inactive";
export type ApprovalStatus = "active" | "pending_approval" | "rejected";
export type PaymentStatus = "completed" | "pending" | "failed";
export type EnrollmentStatus =
  | "active"
  | "payment_pending"
  | "completed"
  | "dropped";
export type ExamType = "quiz" | "assignment" | "final_exam";
export type MaterialType = "pdf" | "video" | "presentation" | "assignment";
export type NotificationCategory =
  | "enrollment"
  | "payment"
  | "class"
  | "exam";
export type Platform = "zoom" | "jitsi";
export type PaymentMethod = "mobile_money" | "bank_transfer" | "card";
export type CertificateStatus = "valid" | "revoked";
export type TutoringSessionStatus = "upcoming" | "completed" | "cancelled";

// ─── Entity Interfaces ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  description: string;
  headOfSchool: string; // User ID
  departmentsCount: number;
  status: Status;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  schoolId: string;
  duration: number; // in months
  durationUnit: "months" | "years";
  fee: number; // UGX
  passMark: number; // 0-100
  unitIds: string[]; // CourseUnit IDs
  status: Status;
}

export interface CourseUnit {
  id: string;
  title: string;
  description: string;
  courseId: string;
  lecturerId: string;
  creditHours: number;
  status: ApprovalStatus;
}

export interface Intake {
  id: string;
  name: string;
  courseId: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  capacity: number;
  enrolledCount: number;
  feeOverride?: number; // UGX, optional override
  status: Status;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId?: string;
  courseUnitId?: string;
  intakeId?: string;
  enrollmentDate: string; // ISO date
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  courseUnitId: string;
  type: MaterialType;
  fileUrl: string;
  fileSize: number; // bytes
  uploadDate: string; // ISO date
  downloadCount: number;
  uploadedBy: string; // User ID
}

export interface VirtualClass {
  id: string;
  title: string;
  courseUnitId: string;
  lecturerId: string;
  date: string; // ISO date
  startTime: string; // HH:mm
  duration: number; // minutes
  platform: Platform;
  meetingLink: string;
  attendeeCount: number;
  isLive: boolean;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  joinTime: string; // ISO datetime
  leaveTime?: string; // ISO datetime
}

export interface Examination {
  id: string;
  title: string;
  courseUnitId: string;
  type: ExamType;
  instructions: string;
  passMark: number; // 0-100
  timeLimit?: number; // minutes, optional
  maxAttempts: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  status: Status;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  submissionDate: string; // ISO datetime
  score: number;
  status: "passed" | "failed" | "pending";
  attemptNumber: number;
}

export interface Certificate {
  id: string;
  serialNumber: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  issueDate: string; // ISO date
  completionDate: string; // ISO date
  status: CertificateStatus;
}

export interface Payment {
  id: string;
  transactionId: string;
  studentId: string;
  description: string;
  amount: number; // UGX
  date: string; // ISO datetime
  method: PaymentMethod;
  phoneNumber?: string; // for mobile money
  status: PaymentStatus;
  failureReason?: string;
}

export interface TutoringSession {
  id: string;
  tutorId: string;
  studentId: string;
  subject: string;
  date: string; // ISO date
  timeSlot: string; // HH:mm
  duration: number; // hours (1-3)
  hourlyRate: number; // UGX
  status: TutoringSessionStatus;
}

export interface TutorProfile {
  id: string;
  userId: string;
  name: string;
  subjects: string[];
  hourlyRate: number; // UGX
  rating: number; // 0-5
  availability: WeeklyAvailability;
}

export interface WeeklyAvailability {
  monday: string[]; // time slots e.g. ["09:00", "10:00", "14:00"]
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: string; // ISO datetime
  linkTo?: string; // route to navigate to
}

export interface ReportingKpis {
  totalEnrollments: number;
  totalRevenue: number; // UGX
  averagePassRate: number; // percentage
  activeLecturers: number;
}

export interface EnrollmentTrend {
  month: string; // "Jan", "Feb", etc.
  year: number;
  count: number;
}

export interface RevenueBySchool {
  schoolName: string;
  revenue: number; // UGX
}
