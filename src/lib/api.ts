const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.makerereonlineschool.com";

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
  capacity: number;
  enrolled_count: number;
  fee: number;
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
  getMaterials: (unitId: string) =>
    request<ApiMaterial[]>("/api/materials?course_unit_id=" + unitId),

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

  deleteEnrollment: (id: string) =>
    request<void>("/api/enrollments/" + id, { method: "DELETE" }),

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
};
