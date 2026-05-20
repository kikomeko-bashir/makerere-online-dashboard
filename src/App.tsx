import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

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
const DashboardOverview = React.lazy(() => import("@/pages/dashboard.index"));
const DashboardSchools = React.lazy(() => import("@/pages/dashboard.schools"));
const DashboardCourses = React.lazy(() => import("@/pages/dashboard.courses"));
const DashboardCourseDetail = React.lazy(
  () => import("@/pages/dashboard.courses.$courseId"),
);
const DashboardCourseUnits = React.lazy(
  () => import("@/pages/dashboard.course-units"),
);
const DashboardIntakes = React.lazy(() => import("@/pages/dashboard.intakes"));
const DashboardIntakeDetail = React.lazy(
  () => import("@/pages/dashboard.intakes.$intakeId"),
);
const DashboardEnrollment = React.lazy(
  () => import("@/pages/dashboard.enrollment"),
);
const DashboardMaterials = React.lazy(
  () => import("@/pages/dashboard.materials"),
);
const DashboardVirtualLearning = React.lazy(
  () => import("@/pages/dashboard.virtual-learning"),
);
const DashboardExaminations = React.lazy(
  () => import("@/pages/dashboard.examinations"),
);
const DashboardExamDetail = React.lazy(
  () => import("@/pages/dashboard.examinations.$examId"),
);
const DashboardCertificates = React.lazy(
  () => import("@/pages/dashboard.certificates"),
);
const DashboardPayments = React.lazy(
  () => import("@/pages/dashboard.payments"),
);
const DashboardTutoring = React.lazy(
  () => import("@/pages/dashboard.tutoring"),
);
const DashboardNotifications = React.lazy(
  () => import("@/pages/dashboard.notifications"),
);
const DashboardReporting = React.lazy(
  () => import("@/pages/dashboard.reporting"),
);
const DashboardSettings = React.lazy(
  () => import("@/pages/dashboard.settings"),
);
const DashboardAdmins = React.lazy(() => import("@/pages/dashboard.admins"));
const DashboardStudent = React.lazy(() => import("@/pages/dashboard.student"));
const DashboardTeacher = React.lazy(() => import("@/pages/dashboard.teacher"));
const DashboardAdmin = React.lazy(() => import("@/pages/dashboard.admin"));

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
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
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
          <Route path="schools" element={<DashboardSchools />} />
          <Route path="courses" element={<DashboardCourses />} />
          <Route path="courses/:courseId" element={<DashboardCourseDetail />} />
          <Route path="course-units" element={<DashboardCourseUnits />} />
          <Route path="intakes" element={<DashboardIntakes />} />
          <Route path="intakes/:intakeId" element={<DashboardIntakeDetail />} />
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
          <Route path="tutoring" element={<DashboardTutoring />} />
          <Route path="notifications" element={<DashboardNotifications />} />
          <Route path="reporting" element={<DashboardReporting />} />
          <Route path="settings" element={<DashboardSettings />} />
          <Route path="admins" element={<DashboardAdmins />} />
          <Route path="student" element={<DashboardStudent />} />
          <Route path="teacher" element={<DashboardTeacher />} />
          <Route path="admin" element={<DashboardAdmin />} />
          <Route path="*" element={<DashboardNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
