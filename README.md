# Makerere Online University Management System

A comprehensive web-based university management platform built with React, designed to support academic administration, online learning, student enrollment, examinations, certification, virtual learning, tutoring, and financial transactions.

**Live URL:** https://makerereonlineschool.com

## Tech Stack

- React 19 + TypeScript
- React Router DOM v7
- Tailwind CSS v4 (Makerere-inspired theme: crimson, gold, cream)
- shadcn/ui component library
- Recharts (data visualization)
- React Hook Form + Zod (form validation)
- Sonner (toast notifications)
- Vite (build tool)

## Getting Started

```bash
npm install
npm run dev        # Development server on port 8080
npm run build      # Production build
npm run preview    # Preview production build
```

### Docker

```bash
docker compose up --build -d
# Available at http://localhost:3535
```

## User Roles

The system supports 4 user roles, each with a dedicated sidebar navigation and role-specific views:

| Role | Access Level |
|------|-------------|
| Super Admin | Full system access, manages admins, API configs, analytics |
| Admin | Creates schools, courses, intakes, lecturers, approves course units |
| Lecturer | Creates course units, uploads materials, schedules lectures, creates exams, offers tutoring |
| Student | Registers, enrolls, pays, attends classes, takes exams, downloads certificates |

Use the **role switcher** in the dashboard header to switch between roles during development.

---

## Public Pages

### Home (`/`)
Landing page showcasing the platform. Includes hero section, feature grid, testimonials, and call-to-action for enrollment.

### About (`/about`)
Information about Makerere Online School, its mission, and team.

### Courses (`/courses`)
Public course catalog. Browse available courses with descriptions, fees, and duration.

### Features (`/features`)
Detailed feature showcase: live classes, timed exams, certificates, attendance tracking, payments, mobile apps, etc.

### Contact (`/contact`)
Contact form and university contact information.

### Verify Certificate (`/certificate-verification`)
Public certificate verification page. Enter a certificate serial number to confirm its authenticity. Displays student name, course, issue date, and verification status (Valid/Revoked).

### Login (`/login`)
Sign-in page with email/password form. Role is auto-detected from the account.

### Get Started (`/get-started`)
Student registration page.

---

## Dashboard — Super Admin / Admin Pages

### Dashboard Overview (`/dashboard`)
Role-specific KPI cards showing key metrics:
- **Admin:** Total Students, Active Lecturers, Live Courses, Revenue (UGX)
- **Lecturer:** My Courses, Total Students, Upcoming Classes, Pending Submissions
- **Student:** Enrolled Courses, Upcoming Classes, Pending Payments, Average Grade

### School Management (`/dashboard/schools`)
- View all schools in a searchable, paginated table (Name, Code, Head of School, Departments, Status)
- Create new schools via dialog form (Name, Code, Description, Head of School, Status)
- Edit existing schools (pre-filled form)
- Delete schools with confirmation dialog
- Zod validation: name required, code max 10 characters

### Course Management (`/dashboard/courses`)
- Filterable table of all courses (Title, School, Duration, Fee in UGX, Pass Mark, Units Count, Status)
- Create courses with multi-select for assigning course units
- Pass mark validation (0-100%)
- Navigate to course detail page

### Course Detail (`/dashboard/courses/:courseId`)
- Full course information: school, duration, fee, pass mark
- List of assigned course units with lecturer names and status badges

### Course Unit Management (`/dashboard/course-units`)
- Table of course units (Title, Course, Lecturer, Credit Hours, Status)
- Admin-created units get "Active" status immediately
- Approve/Reject buttons for pending units (submitted by lecturers)
- Status badges: Active (green), Pending Approval (yellow), Rejected (red)

### Intake Management (`/dashboard/intakes`)
- Table of intakes (Name, Course, Start/End Date, Capacity, Enrolled Count, Status)
- Create intakes with date validation (end date must be after start date)
- Fee override option (pre-fills from course fee)
- Navigate to intake detail page

### Intake Detail (`/dashboard/intakes/:intakeId`)
- Intake information cards (dates, enrollment count, fee)
- Table of enrolled students with payment status

### Enrollment Management (`/dashboard/enrollment`)
- **Admin view:** Table of all enrollments with status filter (Active, Payment Pending, Completed, Dropped)
- **Student view:** Card grid of available courses, enrollment confirmation dialog, enrollment history with "Complete Payment" action, filters by School/Duration/Fee Range

### Certification Management (`/dashboard/certificates`)
- **Admin view:** Table of all certificates (Serial Number, Student, Course, Issue Date, Status), filter by course/student, certificate preview with university branding, download PDF action
- **Student view:** Only shows certificates issued to the current student with preview and download

### Payments (`/dashboard/payments`)
- **Admin view:** KPI cards (Total Revenue, Pending, Failed), revenue line chart over time (Recharts), full transaction history table
- **Student view:** Personal KPI cards (Total Paid, Pending Amount, Transactions), transaction history, "Make Payment" form (Amount, Phone Number, Payment Method), retry failed payments

### Reporting & Analytics (`/dashboard/reporting`)
- KPI cards: Total Enrollments, Total Revenue, Average Pass Rate, Active Lecturers
- Enrollment trends line chart (monthly, 12 months)
- Revenue breakdown bar chart by school
- Top-performing courses table
- Lecturer performance table (Name, Courses, Students, Rating, Pass Rate)

### Admin Management (`/dashboard/admins`)
- Super Admin only
- Table of admin/super_admin users (Name, Email, Role, Created At)
- Create/edit/delete admin accounts with Zod validation

### System Settings (`/dashboard/settings`)
- Super Admin only
- General: Platform Name, Support Email, Default Language
- API Configuration: Zoom API Key, Jitsi Domain, Interswitch API Key (masked)
- Notifications: Email/SMS toggle switches
- Save button with success toast

---

## Dashboard — Lecturer Pages

### Study Materials (`/dashboard/materials`)
- Materials organized by course unit in expandable accordion
- Upload form: Title, Description, Course Unit, Material Type (PDF/Video/Presentation/Assignment), File Upload
- Each material shows: type icon, file size, upload date, download count
- Delete with confirmation dialog
- Lecturers see only their own uploaded materials

### Virtual Learning (`/dashboard/virtual-learning`)
- Upcoming classes list: title, course unit, date/time, duration, platform badge (Zoom=blue, Jitsi=green), attendee count, "Join" button
- "Live" badge for in-progress classes
- Schedule Class form: Title, Course Unit, Date, Start Time, Duration, Platform, Meeting Link
- Past classes section with attendance records (student name, join/leave times)
- Lecturers see only their own classes

### Examinations (`/dashboard/examinations`)
- Table of exams (Title, Course Unit, Type badge, Due Date, Pass Mark, Time Limit, Status)
- Create Exam form: Title, Course Unit, Type (Quiz/Assignment/Final Exam), Instructions, Pass Mark, Time Limit, Max Attempts, Start/End Date
- Lecturers see only exams for their course units

### Exam Detail (`/dashboard/examinations/:examId`)
- **Lecturer/Admin view:** Aggregate statistics (Average Score, Pass Rate, Highest/Lowest), exam settings, submissions table (Student, Date, Score, Status)
- **Student view:** Exam instructions, time remaining, "Start Exam" button (disabled when max attempts exhausted), previous submissions

### Tutoring (`/dashboard/tutoring`)
- **Lecturer view:** Sessions table (Student, Subject, Date/Time, Duration, Status), tutoring settings (available subjects checkboxes, hourly rate, weekly availability)
- **Student view:** Tutor card grid (Name, Subjects, Rate, Rating, Availability), "Book Session" form (Subject, Date, Time Slot, Duration 1-3hrs, estimated cost), session history

### Notifications (`/dashboard/notifications`)
- Notification list sorted by date (most recent first)
- Each notification: title, message preview, timestamp, read/unread indicator, category badge (Enrollment=blue, Payment=green, Class=purple, Exam=orange)
- Filter by Category and Read/Unread status
- Click to mark as read
- "Mark All as Read" button
- Toast notifications for students on page load (exam deadlines within 24h, live classes within 15min)

---

## Dashboard — Student Pages

Students access the same routes as above but see student-specific views:

### Enrollment (`/dashboard/enrollment`)
- Browse available courses in a card grid (Title, School, Duration, Fee, "Enroll" button)
- Enrollment confirmation dialog with fee breakdown
- Enrollment history table with "Complete Payment" action for pending enrollments
- Filters: School, Duration range, Fee range

### Study Materials (`/dashboard/materials`)
- Shows only materials for enrolled courses
- Organized by course unit in accordion
- Download button for each material

### Virtual Learning (`/dashboard/virtual-learning`)
- Shows only classes for enrolled course units
- "Schedule Class" button hidden
- Upcoming classes with "Join" button, "Live" badge for active sessions

### Examinations (`/dashboard/examinations`)
- Shows only active exams for enrolled course units
- "Create Exam" button hidden
- Exam detail shows instructions, time limit, "Start Exam" button
- Disabled when max attempts exhausted with message

### Certificates (`/dashboard/certificates`)
- Shows only certificates issued to the current student
- Preview with university branding
- Download PDF option

### Payments (`/dashboard/payments`)
- Personal transaction history
- "Make Payment" form (Amount, Phone Number for Mobile Money, Payment Method)
- Success/error states, retry for failed payments

### Tutoring (`/dashboard/tutoring`)
- Available tutors card grid (Name, Subjects, Hourly Rate, Rating, Availability)
- "Book Session" form with estimated cost calculation
- Session history (upcoming + past)

### Notifications (`/dashboard/notifications`)
- Same as lecturer view but filtered to student's notifications
- Toast alerts for upcoming exam deadlines and live class reminders

---

## Sidebar Navigation

The sidebar displays different navigation items based on the user's role:

**Super Admin:** Dashboard, Admin Management, School Management, Course Management, Intake Management, Enrollment, Payments, Reporting & Analytics, System Settings

**Admin:** Dashboard, School Management, Course Management, Course Unit Management, Intake Management, Enrollment, Study Materials, Virtual Learning, Examinations, Certification, Payments, Notifications, Reporting

**Lecturer:** Dashboard, My Courses, Course Unit Management, Study Materials, Virtual Learning, Examinations, Tutoring, Notifications

**Student:** Dashboard, My Courses, Enrollment, Study Materials, Virtual Learning, Examinations, Certificates, Payments, Tutoring, Notifications

The sidebar shows an unread notification count badge on the Notifications menu item.

---

## Project Structure

```
src/
├── App.tsx                          # Central routing (react-router-dom)
├── main.tsx                         # Entry point
├── styles.css                       # Tailwind + custom theme
├── assets/                          # Images
├── components/
│   ├── dashboard/                   # Dashboard-specific components
│   │   ├── app-sidebar.tsx          # Role-based sidebar navigation
│   │   ├── dashboard-header.tsx     # Breadcrumbs, role switcher, notifications
│   │   ├── data-table.tsx           # Generic searchable/paginated table
│   │   ├── entity-form-dialog.tsx   # Form dialog (Dialog on desktop, Sheet on mobile)
│   │   ├── confirm-dialog.tsx       # Destructive action confirmation
│   │   ├── kpi-card.tsx             # KPI metric card
│   │   └── page-header.tsx          # Page title + action buttons
│   ├── site/                        # Public site components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Logo.tsx
│   └── ui/                          # shadcn/ui primitives
├── hooks/
│   └── use-mobile.tsx               # Mobile detection hook
├── lib/
│   ├── auth-context.tsx             # Auth provider + role switcher
│   ├── navigation.ts               # Role-based nav config
│   ├── types.ts                     # TypeScript interfaces
│   ├── utils.ts                     # Utility functions
│   └── mock-data/                   # Mock data (15 files)
└── pages/
    ├── index.tsx, about.tsx, etc.   # Public pages
    ├── certificate-verification.tsx # Public cert verification
    └── dashboard/
        ├── index.tsx                # Dashboard overview
        ├── admin/                   # Admin/Super Admin pages
        ├── lecturer/                # Lecturer pages
        └── legacy/                  # Legacy portal pages
```

---

## Deployment

The app is containerized with Docker and served via nginx on port 3535. Apache reverse proxy handles the domain routing with SSL via Let's Encrypt.

```bash
# Build and deploy
docker compose up --build -d

# Domain: https://makerereonlineschool.com
# API: https://api.makerereonlineschool.com
```
