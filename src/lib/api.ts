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
};
