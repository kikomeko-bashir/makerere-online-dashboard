import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet, Link, Navigate } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import type { UserRole } from "@/lib/types";

// Public pages
const Home = React.lazy(() => import("@/pages/index"));
const About = React.lazy(() => import("@/pages/about"));
const Contact = React.lazy(() => import("@/pages/contact"));
const Features = React.lazy(() => import("@/pages/features"));
const Courses = React.lazy(() => import("@/pages/courses"));
const CourseDetail = React.lazy(() => import("@/pages/courses.$courseId"));
const Login = React.lazy(() => import("@/pages/login"));
const GetStarted = React.lazy(() => import("@/pages/get-started"));
const CertificateVerification = React.lazy(
  () => import("@/pages/certificate-verification"),
);

// Dashboard pages
const DashboardOverview = React.lazy(() => import("@/pages/dashboard/index"));
const DashboardSchools = React.lazy(() => import("@/pages/dashboard/admin/schools"));
const DashboardCourses = React.lazy(() => import("@/pages/dashboard/admin/courses"));
const DashboardCourseDetail = React.lazy(
  () => import("@/pages/dashboard/admin/courses.$courseId"),
);
const DashboardCourseUnits = React.lazy(
  () => import("@/pages/dashboard/admin/course-units"),
);
const DashboardIntakes = React.lazy(() => import("@/pages/dashboard/admin/intakes"));
const DashboardIntakeDetail = React.lazy(
  () => import("@/pages/dashboard/admin/intakes.$intakeId"),
);
const DashboardEnrollment = React.lazy(
  () => import("@/pages/dashboard/admin/enrollment"),
);
const DashboardMaterials = React.lazy(
  () => import("@/pages/dashboard/lecturer/materials"),
);
const DashboardVirtualLearning = React.lazy(
  () => import("@/pages/dashboard/lecturer/virtual-learning"),
);
const DashboardExaminations = React.lazy(
  () => import("@/pages/dashboard/lecturer/examinations"),
);
const DashboardExamDetail = React.lazy(
  () => import("@/pages/dashboard/lecturer/examinations.$examId"),
);
const DashboardCertificates = React.lazy(
  () => import("@/pages/dashboard/admin/certificates"),
);
const DashboardPayments = React.lazy(
  () => import("@/pages/dashboard/admin/payments"),
);
const DashboardTutoring = React.lazy(
  () => import("@/pages/dashboard/lecturer/tutoring"),
);
const DashboardNotifications = React.lazy(
  () => import("@/pages/dashboard/lecturer/notifications"),
);
const DashboardReporting = React.lazy(
  () => import("@/pages/dashboard/admin/reporting"),
);
const DashboardSettings = React.lazy(
  () => import("@/pages/dashboard/admin/settings"),
);
const DashboardAdmins = React.lazy(() => import("@/pages/dashboard/admin/admins"));
const DashboardStudent = React.lazy(() => import("@/pages/dashboard/legacy/student"));
const DashboardTeacher = React.lazy(() => import("@/pages/dashboard/legacy/teacher"));
const DashboardAdmin = React.lazy(() => import("@/pages/dashboard/legacy/admin"));

function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function RoleGuard({ allowedRoles, children }: { allowedRoles: UserRole[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-6xl font-bold text-destructive">403</h1>
          <h2 className="mt-4 text-xl font-semibold">Access Denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <div className="mt-6">
            <Link to="/dashboard" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardNotFound() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-6xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This dashboard page doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="features" element={<Features />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="get-started" element={<GetStarted />} />
          <Route
            path="certificate-verification"
            element={<CertificateVerification />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="schools" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><DashboardSchools /></RoleGuard>} />
          <Route path="courses" element={<DashboardCourses />} />
          <Route path="courses/:courseId" element={<DashboardCourseDetail />} />
          <Route path="course-units" element={<RoleGuard allowedRoles={["super_admin", "admin", "lecturer"]}><DashboardCourseUnits /></RoleGuard>} />
          <Route path="intakes" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><DashboardIntakes /></RoleGuard>} />
          <Route path="intakes/:intakeId" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><DashboardIntakeDetail /></RoleGuard>} />
          <Route path="enrollment" element={<DashboardEnrollment />} />
          <Route path="materials" element={<DashboardMaterials />} />
          <Route path="virtual-learning" element={<DashboardVirtualLearning />} />
          <Route path="examinations" element={<DashboardExaminations />} />
          <Route
            path="examinations/:examId"
            element={<DashboardExamDetail />}
          />
          <Route path="certificates" element={<DashboardCertificates />} />
          <Route path="payments" element={<DashboardPayments />} />
          <Route path="tutoring" element={<RoleGuard allowedRoles={["lecturer", "student"]}><DashboardTutoring /></RoleGuard>} />
          <Route path="notifications" element={<DashboardNotifications />} />
          <Route path="reporting" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><DashboardReporting /></RoleGuard>} />
          <Route path="settings" element={<RoleGuard allowedRoles={["super_admin"]}><DashboardSettings /></RoleGuard>} />
          <Route path="admins" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><DashboardAdmins /></RoleGuard>} />
          <Route path="student" element={<RoleGuard allowedRoles={["student"]}><DashboardStudent /></RoleGuard>} />
          <Route path="teacher" element={<RoleGuard allowedRoles={["lecturer"]}><DashboardTeacher /></RoleGuard>} />
          <Route path="admin" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><DashboardAdmin /></RoleGuard>} />
          <Route path="*" element={<DashboardNotFound />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
