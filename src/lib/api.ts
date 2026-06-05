const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.makerereonlineschool.com";

/**
 * Resolves a relative upload path (e.g. /uploads/abc.jpg) to the full URL.
 * If already a full URL (http/https), returns as-is.
 */
export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) return `${API_BASE_URL}${path}`;
  return path;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "lecturer" | "student";
  avatar: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export interface ApiSchool {
  id: string;
  name: string;
  code: string;
  description: string;
  head_of_school: string | null;
  departments_count: number;
  status: string;
  created_at: string;
}

export interface ApiCourse {
  id: string;
  title: string;
  description: string;
  school_id: string;
  duration: number;
  duration_unit: string;
  fee: number;
  pass_mark: number;
  status: string;
  image_url: string | null;
  created_at: string;
}

export interface ApiCourseUnit {
  id: string;
  title: string;
  description: string;
  course_id: string | null;
  lecturer_id: string | null;
  credit_hours: number;
  status: string;
  created_at: string;
}

export interface ApiIntake {
  id: string;
  name: string;
  year_level: number;
  start_date: string;
  end_date: string;
  enrollment_deadline: string;
  capacity: number;
  enrolled_count: number;
  course_ids: string[];
  status: string;
  created_at: string;
}

export interface ApiIntakeAssignment {
  id: string;
  intake_id: string;
  course_unit_id: string;
  lecturer_id: string;
  created_at: string;
}

export interface ApiMaterial {
  id: string;
  course_unit_id: string;
  title: string;
  description: string;
  type: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface ApiAssessment {
  id: string;
  course_unit_id: string;
  title: string;
  type: string;
  pass_mark: number;
  time_limit: number | null;
  max_attempts: number;
  start_date: string | null;
  end_date: string | null;
  instructions: string;
  created_by: string;
  created_at: string;
}

export interface ApiVirtualClass {
  id: string;
  course_unit_id: string;
  title: string;
  date: string;
  start_time: string;
  duration: number;
  platform: string;
  meeting_link: string;
  is_live: boolean;
  lecturer_id: string;
  created_at: string;
}

export interface ApiSubject {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface ApiTutorPublic {
  id: string;
  name: string;
  subjects: string[];
  hourly_rate: number;
  bio: string;
  is_available: boolean;
}

export interface ApiTutorProfile {
  id: string;
  user_id: string;
  subjects: string[];
  hourly_rate: number;
  bio: string;
  is_available: boolean;
  approval_status: string;
}

export interface ApiTutorAdmin {
  id: string;
  user_id: string;
  name: string;
  subjects: string[];
  hourly_rate: number;
  bio: string;
  is_available: boolean;
  approval_status: string;
  created_at: string | null;
}

export interface ApiEnrollment {
  id: string;
  student_id: string;
  intake_id: string;
  course_id: string;
  enrollment_date: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export interface ApiTutoringBooking {
  id: string;
  student_id: string;
  tutor_profile_id: string;
  subject: string;
  date: string;
  time_slot: string;
  duration: number;
  total_cost: number;
  status: string;
  created_at: string;
}

export interface ApiError {
  detail: string;
}

export interface ApiCertificate {
  id: string;
  student_id: string;
  certificate_type: string;
  course_id: string | null;
  course_unit_id: string | null;
  certificate_number: string;
  student_name: string;
  title: string;
  issue_date: string;
  status: string;
  created_at: string;
}

export interface ApiCertificateVerification {
  valid: boolean;
  certificate_number: string;
  student_name: string | null;
  title: string | null;
  certificate_type: string | null;
  issue_date: string | null;
  status: string | null;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      detail: "An unexpected error occurred",
    }));
    throw new Error(error.detail);
  }

  return res.json();
}

export const api = {
  // File uploads
  uploadImage: async (file: File): Promise<{ url: string; filename: string }> => {
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/api/uploads`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail);
    }

    return res.json();
  },

  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role = "student") =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    }),

  getMe: () => request<ApiUser>("/api/auth/me"),

  // User management
  getUsers: () => request<ApiUser[]>("/api/users"),

  createUser: (name: string, email: string, password: string, role: string) =>
    request<ApiUser>("/api/users", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    }),

  deleteUser: (userId: string) =>
    request<void>("/api/users/" + userId, { method: "DELETE" }),

  // School management
  getSchools: () => request<ApiSchool[]>("/api/schools"),

  createSchool: (data: Omit<ApiSchool, "id" | "created_at">) =>
    request<ApiSchool>("/api/schools", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateSchool: (id: string, data: Partial<Omit<ApiSchool, "id" | "created_at">>) =>
    request<ApiSchool>("/api/schools/" + id, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteSchool: (id: string) =>
    request<void>("/api/schools/" + id, { method: "DELETE" }),

  // Course management
  getCourses: () => request<ApiCourse[]>("/api/courses"),

  createCourse: (data: Omit<ApiCourse, "id" | "created_at"> & { unit_ids: string[] }) =>
    request<ApiCourse>("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCourse: (id: string, data: Partial<Omit<ApiCourse, "id" | "created_at">> & { unit_ids?: string[] }) =>
    request<ApiCourse>("/api/courses/" + id, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCourse: (id: string) =>
    request<void>("/api/courses/" + id, { method: "DELETE" }),

  getCourseUnitIds: (courseId: string) =>
    request<string[]>("/api/courses/" + courseId + "/units"),

  // Course Unit management
  getCourseUnits: () => request<ApiCourseUnit[]>("/api/course-units"),

  createCourseUnit: (data: Omit<ApiCourseUnit, "id" | "created_at">) =>
    request<ApiCourseUnit>("/api/course-units", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCourseUnit: (id: string, data: Partial<Omit<ApiCourseUnit, "id" | "created_at">>) =>
    request<ApiCourseUnit>("/api/course-units/" + id, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  approveCourseUnit: (id: string) =>
    request<ApiCourseUnit>("/api/course-units/" + id + "/approve", {
      method: "PUT",
    }),

  rejectCourseUnit: (id: string) =>
    request<ApiCourseUnit>("/api/course-units/" + id + "/reject", {
      method: "PUT",
    }),

  deleteCourseUnit: (id: string) =>
    request<void>("/api/course-units/" + id, { method: "DELETE" }),

  // Intake management
  getIntakes: () => request<ApiIntake[]>("/api/intakes"),

  createIntake: (data: Omit<ApiIntake, "id" | "enrolled_count" | "created_at">) =>
    request<ApiIntake>("/api/intakes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateIntake: (id: string, data: Partial<Omit<ApiIntake, "id" | "enrolled_count" | "created_at">>) =>
    request<ApiIntake>("/api/intakes/" + id, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteIntake: (id: string) =>
    request<void>("/api/intakes/" + id, { method: "DELETE" }),

  // Public endpoints (no auth)
  getPublicCourses: async (): Promise<ApiCourse[]> => {
    const res = await fetch(`${API_BASE_URL}/api/courses/public`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to load courses");
    return res.json();
  },

  getPublicIntakes: async (): Promise<ApiIntake[]> => {
    const res = await fetch(`${API_BASE_URL}/api/intakes/public`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to load intakes");
    return res.json();
  },

  // Intake Unit Assignments (lecturer per unit per intake)
  getIntakeAssignments: (intakeId?: string) =>
    request<ApiIntakeAssignment[]>(
      intakeId ? `/api/intake-assignments?intake_id=${intakeId}` : "/api/intake-assignments",
    ),

  createIntakeAssignment: (data: { intake_id: string; course_unit_id: string; lecturer_id: string }) =>
    request<ApiIntakeAssignment>("/api/intake-assignments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteIntakeAssignment: (id: string) =>
    request<void>("/api/intake-assignments/" + id, { method: "DELETE" }),

  // System Settings
  getSettings: () =>
    request<{ settings: Record<string, string> }>("/api/settings"),

  updateSettings: (settings: Record<string, string>) =>
    request<{ settings: Record<string, string> }>("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ settings }),
    }),

  // Study Materials
  getMaterials: (unitId?: string) =>
    request<ApiMaterial[]>(unitId ? "/api/materials?course_unit_id=" + unitId : "/api/materials"),

  getAllMyMaterials: () =>
    request<ApiMaterial[]>("/api/materials"),

  createMaterial: (data: Omit<ApiMaterial, "id" | "uploaded_by" | "created_at">) =>
    request<ApiMaterial>("/api/materials", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteMaterial: (id: string) =>
    request<void>("/api/materials/" + id, { method: "DELETE" }),

  // Assessments
  getAssessments: (unitId: string) =>
    request<ApiAssessment[]>("/api/assessments?course_unit_id=" + unitId),

  createAssessment: (data: Omit<ApiAssessment, "id" | "created_by" | "created_at">) =>
    request<ApiAssessment>("/api/assessments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteAssessment: (id: string) =>
    request<void>("/api/assessments/" + id, { method: "DELETE" }),

  // Assessment Questions
  getAssessmentQuestions: (assessmentId: string) =>
    request<Array<{
      id: string;
      assessment_id: string;
      question_text: string;
      question_type: string;
      options: string[];
      correct_answer?: string;
      marks: number;
      order: number;
      created_at?: string;
    }>>(`/api/assessment-questions?assessment_id=${assessmentId}`),

  createAssessmentQuestion: (data: {
    assessment_id: string;
    question_text: string;
    question_type: string;
    options: string[];
    correct_answer: string;
    marks: number;
    order: number;
  }) =>
    request<unknown>("/api/assessment-questions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateAssessmentQuestion: (id: string, data: {
    question_text?: string;
    options?: string[];
    correct_answer?: string;
    marks?: number;
    order?: number;
  }) =>
    request<unknown>(`/api/assessment-questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteAssessmentQuestion: (id: string) =>
    request<void>(`/api/assessment-questions/${id}`, { method: "DELETE" }),

  // Assessment Submissions
  getAssessmentSubmissions: (assessmentId: string) =>
    request<Array<{
      id: string;
      assessment_id: string;
      student_id: string;
      answers: Array<{ question_id: string; answer: string }>;
      score: number;
      total_marks: number;
      is_graded: boolean;
      graded_by: string | null;
      feedback: string;
      submitted_at: string;
      graded_at: string | null;
    }>>(`/api/assessment-questions/submissions?assessment_id=${assessmentId}`),

  submitAssessment: (data: {
    assessment_id: string;
    answers: Array<{ question_id: string; answer: string }>;
  }) =>
    request<{
      id: string;
      score: number;
      total_marks: number;
      is_graded: boolean;
      feedback: string;
    }>("/api/assessment-questions/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  gradeSubmission: (submissionId: string, data: { score: number; feedback: string }) =>
    request<unknown>(`/api/assessment-questions/submissions/${submissionId}/grade`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Virtual Classes
  getVirtualClasses: (unitId: string) =>
    request<ApiVirtualClass[]>("/api/virtual-classes?course_unit_id=" + unitId),

  createVirtualClass: (data: Omit<ApiVirtualClass, "id" | "is_live" | "lecturer_id" | "created_at">) =>
    request<ApiVirtualClass>("/api/virtual-classes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteVirtualClass: (id: string) =>
    request<void>("/api/virtual-classes/" + id, { method: "DELETE" }),

  // Subjects
  getSubjects: () => request<ApiSubject[]>("/api/subjects"),

  createSubject: (data: { name: string; description: string }) =>
    request<ApiSubject>("/api/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateSubject: (id: string, data: { name?: string; description?: string }) =>
    request<ApiSubject>("/api/subjects/" + id, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteSubject: (id: string) =>
    request<void>("/api/subjects/" + id, { method: "DELETE" }),

  // Tutoring
  getPublicTutors: async (): Promise<ApiTutorPublic[]> => {
    const res = await fetch(`${API_BASE_URL}/api/tutoring/public`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const error: ApiError = await res.json().catch(() => ({
        detail: "An unexpected error occurred",
      }));
      throw new Error(error.detail);
    }
    return res.json();
  },

  getMyTutorProfile: () =>
    request<ApiTutorProfile>("/api/tutoring/my-profile"),

  updateMyTutorProfile: (data: {
    subjects: string[];
    hourly_rate: number;
    bio: string;
    is_available: boolean;
  }) =>
    request<ApiTutorProfile>("/api/tutoring/my-profile", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Admin tutor management
  getAdminTutors: () =>
    request<ApiTutorAdmin[]>("/api/tutoring/admin/all"),

  approveTutor: (profileId: string) =>
    request<{ message: string }>(`/api/tutoring/admin/${profileId}/approve`, {
      method: "PUT",
    }),

  rejectTutor: (profileId: string) =>
    request<{ message: string }>(`/api/tutoring/admin/${profileId}/reject`, {
      method: "PUT",
    }),

  // Enrollments
  getEnrollments: () => request<ApiEnrollment[]>("/api/enrollments"),

  createEnrollment: (intakeId: string, courseId: string) =>
    request<ApiEnrollment>("/api/enrollments", {
      method: "POST",
      body: JSON.stringify({ intake_id: intakeId, course_id: courseId }),
    }),

  completeEnrollmentPayment: (id: string) =>
    request<ApiEnrollment>("/api/enrollments/" + id + "/complete-payment", {
      method: "PUT",
    }),

  // Payments (Interswitch Mobile Money)
  initiatePayment: (enrollmentId: string, phoneNumber: string) =>
    request<{
      id: string;
      status: string;
      amount: number;
      carrier: string;
      response_code: string | null;
      response_message: string | null;
      description: string;
    }>("/api/payments/initiate", {
      method: "POST",
      body: JSON.stringify({ enrollment_id: enrollmentId, phone_number: phoneNumber }),
    }),

  getPayments: () =>
    request<Array<{
      id: string;
      student_id: string;
      enrollment_id: string | null;
      amount: number;
      currency: string;
      phone_number: string;
      carrier: string;
      payment_type: string;
      status: string;
      request_reference: string | null;
      response_message: string | null;
      description: string;
      created_at: string;
      completed_at: string | null;
    }>>("/api/payments"),

  deleteEnrollment: (id: string) =>
    request<void>("/api/enrollments/" + id, { method: "DELETE" }),

  getMyUnitEnrollments: (courseId?: string) =>
    request<Array<{
      id: string;
      student_id: string;
      enrollment_id: string;
      course_unit_id: string;
      course_id: string;
      intake_id: string;
      status: string;
      enrolled_date: string;
      created_at: string;
    }>>(courseId ? `/api/enrollments/my-units?course_id=${courseId}` : "/api/enrollments/my-units"),

  // Tutoring Bookings
  getTutoringBookings: () =>
    request<ApiTutoringBooking[]>("/api/tutoring/bookings"),

  createTutoringBooking: (data: {
    tutor_profile_id: string;
    subject: string;
    date: string;
    time_slot: string;
    duration: number;
  }) =>
    request<ApiTutoringBooking>("/api/tutoring/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Payments (legacy methods kept for compatibility)
  completePayment: (paymentId: string) =>
    request<unknown>(`/api/payments/${paymentId}/complete`, {
      method: "PUT",
    }),

  getSystemWallet: () =>
    request<{ balance: number; currency: string; total_received: number; total_withdrawn: number }>("/api/payments/system-wallet"),

  getLecturerWallet: () =>
    request<{ balance: number; currency: string; total_earned: number }>("/api/payments/lecturer-wallet"),

  getAllLecturerWallets: () =>
    request<Array<{ id: string; lecturer_id: string; balance: number; currency: string; total_earned: number }>>("/api/payments/all-lecturer-wallets"),

  // Certificates
  getCertificates: (params?: { student_id?: string; course_id?: string; certificate_type?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.student_id) searchParams.set("student_id", params.student_id);
    if (params?.course_id) searchParams.set("course_id", params.course_id);
    if (params?.certificate_type) searchParams.set("certificate_type", params.certificate_type);
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return request<ApiCertificate[]>(`/api/certificates${qs ? "?" + qs : ""}`);
  },

  issueCertificate: (data: {
    student_id: string;
    certificate_type: string;
    course_id?: string;
    course_unit_id?: string;
    student_name: string;
    title: string;
  }) =>
    request<ApiCertificate>("/api/certificates/issue", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyCertificate: async (certificateNumber: string): Promise<ApiCertificateVerification> => {
    const res = await fetch(`${API_BASE_URL}/api/certificates/verify/${encodeURIComponent(certificateNumber)}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Verification failed" }));
      throw new Error(error.detail);
    }
    return res.json();
  },

  getCertificate: (id: string) =>
    request<ApiCertificate>(`/api/certificates/${id}`),
};
