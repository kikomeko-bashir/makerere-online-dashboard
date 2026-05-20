import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  UserCog,
  School,
  BookOpen,
  BookText,
  CalendarRange,
  UserPlus,
  CreditCard,
  BarChart3,
  Settings,
  GraduationCap,
  FileText,
  Video,
  ClipboardCheck,
  Award,
  Bell,
  Users,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export function getNavigationItems(role: UserRole): NavGroup[] {
  switch (role) {
    case "super_admin":
      return getSuperAdminNavigation();
    case "admin":
      return getAdminNavigation();
    case "lecturer":
      return getLecturerNavigation();
    case "student":
      return getStudentNavigation();
  }
}

function getSuperAdminNavigation(): NavGroup[] {
  return [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Administration",
      items: [
        {
          title: "Admin Management",
          href: "/dashboard/admins",
          icon: UserCog,
        },
        {
          title: "School Management",
          href: "/dashboard/schools",
          icon: School,
        },
        {
          title: "Course Management",
          href: "/dashboard/courses",
          icon: BookOpen,
        },
        {
          title: "Intake Management",
          href: "/dashboard/intakes",
          icon: CalendarRange,
        },
        {
          title: "Enrollment",
          href: "/dashboard/enrollment",
          icon: UserPlus,
        },
        {
          title: "System Settings",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
    {
      label: "Finance",
      items: [
        {
          title: "Payments",
          href: "/dashboard/payments",
          icon: CreditCard,
        },
        {
          title: "Reporting & Analytics",
          href: "/dashboard/reporting",
          icon: BarChart3,
        },
      ],
    },
  ];
}

function getAdminNavigation(): NavGroup[] {
  return [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Academic",
      items: [
        {
          title: "School Management",
          href: "/dashboard/schools",
          icon: School,
        },
        {
          title: "Course Management",
          href: "/dashboard/courses",
          icon: BookOpen,
        },
        {
          title: "Course Unit Management",
          href: "/dashboard/course-units",
          icon: BookText,
        },
        {
          title: "Intake Management",
          href: "/dashboard/intakes",
          icon: CalendarRange,
        },
        {
          title: "Enrollment",
          href: "/dashboard/enrollment",
          icon: UserPlus,
        },
        {
          title: "Study Materials",
          href: "/dashboard/materials",
          icon: FileText,
        },
        {
          title: "Virtual Learning",
          href: "/dashboard/virtual-learning",
          icon: Video,
        },
        {
          title: "Examinations",
          href: "/dashboard/examinations",
          icon: ClipboardCheck,
        },
        {
          title: "Certification",
          href: "/dashboard/certificates",
          icon: Award,
        },
      ],
    },
    {
      label: "Finance",
      items: [
        {
          title: "Payments",
          href: "/dashboard/payments",
          icon: CreditCard,
        },
        {
          title: "Reporting",
          href: "/dashboard/reporting",
          icon: BarChart3,
        },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          title: "Notifications",
          href: "/dashboard/notifications",
          icon: Bell,
        },
      ],
    },
  ];
}

function getLecturerNavigation(): NavGroup[] {
  return [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Academic",
      items: [
        {
          title: "My Courses",
          href: "/dashboard/courses",
          icon: BookOpen,
        },
        {
          title: "Course Unit Management",
          href: "/dashboard/course-units",
          icon: BookText,
        },
        {
          title: "Study Materials",
          href: "/dashboard/materials",
          icon: FileText,
        },
        {
          title: "Virtual Learning",
          href: "/dashboard/virtual-learning",
          icon: Video,
        },
        {
          title: "Examinations",
          href: "/dashboard/examinations",
          icon: ClipboardCheck,
        },
        {
          title: "Tutoring",
          href: "/dashboard/tutoring",
          icon: Users,
        },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          title: "Notifications",
          href: "/dashboard/notifications",
          icon: Bell,
        },
      ],
    },
  ];
}

function getStudentNavigation(): NavGroup[] {
  return [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Academic",
      items: [
        {
          title: "My Courses",
          href: "/dashboard/courses",
          icon: BookOpen,
        },
        {
          title: "Enrollment",
          href: "/dashboard/enrollment",
          icon: UserPlus,
        },
        {
          title: "Study Materials",
          href: "/dashboard/materials",
          icon: FileText,
        },
        {
          title: "Virtual Learning",
          href: "/dashboard/virtual-learning",
          icon: Video,
        },
        {
          title: "Examinations",
          href: "/dashboard/examinations",
          icon: ClipboardCheck,
        },
        {
          title: "Certificates",
          href: "/dashboard/certificates",
          icon: GraduationCap,
        },
        {
          title: "Tutoring",
          href: "/dashboard/tutoring",
          icon: Users,
        },
      ],
    },
    {
      label: "Finance",
      items: [
        {
          title: "Payments",
          href: "/dashboard/payments",
          icon: CreditCard,
        },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          title: "Notifications",
          href: "/dashboard/notifications",
          icon: Bell,
        },
      ],
    },
  ];
}
