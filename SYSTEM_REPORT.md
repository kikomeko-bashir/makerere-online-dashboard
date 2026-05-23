# Makerere Online University Management System
## Comprehensive Functionality Report

**Document Version:** 1.0
**Date:** May 22, 2026
**Platform URL:** https://makerereonlineschool.com
**API URL:** https://api.makerereonlineschool.com

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Public-Facing Pages](#2-public-facing-pages)
3. [Super Admin Portal](#3-super-admin-portal)
4. [Admin Portal](#4-admin-portal)
5. [Lecturer Portal](#5-lecturer-portal)
6. [Student Portal](#6-student-portal)
7. [Cross-Cutting Features](#7-cross-cutting-features)
8. [Technical Architecture](#8-technical-architecture)

---

## 1. System Overview

### 1.1 Purpose

The Makerere Online University Management System is a comprehensive digital platform
designed to support the full lifecycle of online university education. It combines
Learning Management System (LMS) capabilities with university administration functions,
enabling institutions to manage academic programs, deliver online education, process
payments, conduct examinations, and issue verifiable certificates — all from a single
integrated platform.

### 1.2 User Roles

The system supports four distinct user roles, each with carefully scoped access:

| Role | Description | Primary Responsibilities |
|------|-------------|------------------------|
| **Super Admin** | Platform owner with unrestricted access | Manages administrators, configures system APIs, views platform-wide analytics, controls system settings |
| **Admin** | Academic administrator | Creates schools, courses, intakes, manages lecturers, approves course units, oversees enrollment and payments |
| **Lecturer** | Teaching staff | Creates course units (pending approval), uploads study materials, schedules live classes, creates and grades examinations, offers tutoring services |
| **Student** | Learner | Self-registers, enrolls in courses, pays fees, accesses materials, attends live classes, takes exams, downloads certificates, books tutoring |

### 1.3 Navigation Structure

Upon logging in, each user is presented with a persistent sidebar navigation on the
left side of the screen. The sidebar displays only the navigation items relevant to
the user's role, organized into labeled sections (Overview, Academic, Finance,
Communication, Administration). The sidebar collapses to icon-only mode on desktop
and transforms into a slide-out sheet on mobile devices.

---

## 2. Public-Facing Pages

These pages are accessible to anyone without authentication. They serve as the
marketing and informational front of the platform.

### 2.1 Home Page (`/`)

**Purpose:** The primary landing page that introduces the platform to prospective
students, lecturers, and administrators.

**Functionality:**
- **Hero Section:** Full-width banner with campus imagery, headline ("A university in
  your pocket"), enrollment CTA buttons, and key statistics (24k+ students, 320+
  courses, 95% pass rate)
- **Trust Strip:** Displays accreditation badges (NCHE Uganda, African Virtual
  University, ISO 9001, EdTech Africa Award)
- **Three Journeys Section:** Card-based showcase for Students, Teachers, and
  Administrators — each with an image, description, and feature bullet points
- **Live Classes Feature:** Split-layout section demonstrating the Zoom/Jitsi
  integration with a floating "live class" indicator card
- **Library Feature:** Showcases the PDF library, lecture notes, and past papers
  with a feature checklist
- **Feature Grid:** 8-card grid highlighting core capabilities (video lectures,
  timed exams, certificates, attendance, doubt clearing, multi-role access,
  languages, payments)
- **Testimonials:** Three student testimonial cards with photos and quotes
- **Call-to-Action:** Final enrollment prompt with "Create account" and "Browse
  courses" buttons

### 2.2 About Page (`/about`)

**Purpose:** Provides institutional information about Makerere Online School.

**Functionality:**
- University history and mission statement
- Team information
- Partnership details

### 2.3 Courses Page (`/courses`)

**Purpose:** Public course catalog for browsing available programs.

**Functionality:**
- Grid/list of all active courses
- Course cards showing title, school, duration, fee, and brief description
- Click-through to individual course detail pages

### 2.4 Course Detail (`/courses/:courseId`)

**Purpose:** Detailed view of a specific course for prospective students.

**Functionality:**
- Full course description
- Duration, fee structure, pass mark requirements
- List of course units included
- Enrollment call-to-action

### 2.5 Features Page (`/features`)

**Purpose:** Comprehensive feature showcase to demonstrate platform capabilities.

**Functionality:**
- 16-feature grid with icons and descriptions (live classes, timed exams,
  certificates, attendance, doubt clearing, video lectures, multi-course
  enrollment, payments, push notifications, homework system, progress charts,
  languages, mobile apps, security, global access)
- Course architecture diagram showing the hierarchical structure
  (Category → Subcategory → Batch → Subjects → Chapters)
- Payment model explanation

### 2.6 Contact Page (`/contact`)

**Purpose:** Provides contact information and a communication form.

**Functionality:**
- Contact form (name, email, message)
- University address and phone numbers
- Map or directions

### 2.7 Verify Certificate (`/certificate-verification`)

**Purpose:** Allows anyone (employers, institutions, the public) to verify the
authenticity of a certificate issued by the platform.

**Functionality:**
- Single search input field for entering a certificate serial number
- "Verify" button to initiate the lookup
- **On valid serial number:** Displays certificate details including student name,
  course title, issue date, and verification status (Valid or Revoked)
- **On invalid serial number:** Displays a clear message indicating the certificate
  was not found in the system
- **Loading state:** Shows a spinner on the verify button while lookup is in progress
- Uses university branding but renders without the sidebar layout
- Accessible without any authentication

### 2.8 Login Page (`/login`)

**Purpose:** Authentication entry point for all user roles.

**Functionality:**
- Split-layout design: campus image with overlay on the left, form on the right
- Email and password input fields
- "Remember me" checkbox
- "Forgot password?" link
- Sign-in button (role auto-detected from account)
- Link to student registration page

### 2.9 Get Started Page (`/get-started`)

**Purpose:** Student self-registration page.

**Functionality:**
- Registration form for new students
- Fields: name, email, password, confirmation
- Terms acceptance
- Redirects to dashboard upon successful registration

---

## 3. Super Admin Portal

The Super Admin has the highest level of access in the system. In addition to all
Admin capabilities, the Super Admin can manage other administrators and configure
system-level settings.

### 3.1 Dashboard Overview (`/dashboard`)

**Purpose:** Provides a high-level snapshot of platform health and key metrics.

**Functionality:**
- **KPI Cards (4):**
  - Total Students: Current count of registered students with weekly growth indicator
  - Active Lecturers: Number of lecturers currently teaching with growth indicator
  - Live Courses: Total active courses with count of courses in review
  - Revenue (UGX): Total platform revenue with month-over-month percentage change
- All KPI cards use the consistent design pattern: icon, large numeric value,
  descriptive label, and optional delta/trend indicator

### 3.2 Admin Management (`/dashboard/admins`)

**Purpose:** Allows the Super Admin to create, edit, and remove administrator accounts.

**Functionality:**
- **Data Table:** Searchable, paginated list of all admin and super_admin users
  - Columns: Name, Email, Role (badge: "Super Admin" or "Admin"), Created At (formatted date)
  - Search by name or email
  - Pagination with 10 rows per page
- **Create Admin:** "Add Admin" button opens a form dialog with fields:
  - Name (required)
  - Email (required, must be valid email format)
  - Role (select: Admin or Super Admin)
  - Password (required, minimum 6 characters)
  - Zod validation with inline error messages
- **Edit Admin:** Dropdown menu → "Edit" opens pre-filled form (password optional on edit)
- **Delete Admin:** Dropdown menu → "Delete" opens confirmation dialog with the admin's
  name displayed, requiring explicit confirmation before removal
- **Notifications:** Success toast on every create/edit/delete operation

### 3.3 System Settings (`/dashboard/settings`)

**Purpose:** Configure platform-wide settings including API integrations and
notification preferences.

**Functionality:**
- **General Settings Section:**
  - Platform Name: Text input (default: "Makerere Online")
  - Support Email: Email input (default: support@mak.ac.ug)
  - Default Language: Select dropdown (English, Swahili, Luganda, French)
- **API Configuration Section:**
  - Zoom API Key: Password-masked input for the Zoom integration key
  - Jitsi Domain: Password-masked input for the Jitsi Meet server domain
  - Interswitch API Key: Password-masked input for the payment gateway key
  - All API fields are masked (type="password") for security
- **Notifications Section:**
  - Email Notifications: Checkbox toggle (enabled/disabled)
  - SMS Notifications: Checkbox toggle (enabled/disabled)
- **Save Action:** "Save Settings" button in the page header triggers a success
  toast notification confirming the configuration has been updated
- Each section is visually separated in its own card with rounded corners and
  subtle shadow

### 3.4 All Admin Pages

The Super Admin also has access to all pages available to the Admin role
(sections 4.1 through 4.10 below).

---

## 4. Admin Portal

Admins manage the academic structure of the university — schools, courses, intakes,
enrollments, and financial oversight.

### 4.1 School Management (`/dashboard/schools`)

**Purpose:** Create and manage the organizational units (schools/faculties) that
contain courses and course units.

**Functionality:**
- **Data Table:**
  - Columns: School Name, Code (e.g., "SCIT"), Head of School (user lookup),
    Departments Count, Status (Active/Inactive badge)
  - Searchable by name or code
  - Paginated (10 per page)
- **Create School:** "Add School" button opens a dialog form:
  - School Name (required, text input)
  - School Code (required, max 10 alphanumeric characters)
  - Description (optional, textarea)
  - Head of School (required, select dropdown populated from lecturers/admins)
  - Status (select: Active or Inactive, defaults to Active)
  - Zod schema validation with inline error messages below each field
- **Edit School:** Row action dropdown → "Edit" opens the same form pre-filled
  with existing data, allowing modification of all fields
- **Delete School:** Row action dropdown → "Delete" opens an AlertDialog
  confirmation showing the school name, with a destructive (red) "Delete" button
- **Success Feedback:** Toast notification on every successful create, update,
  or delete operation

### 4.2 Course Management (`/dashboard/courses`)

**Purpose:** Define and manage academic programs (courses) offered by the university.

**Functionality:**
- **Data Table:**
  - Columns: Title, School (looked up from school ID), Duration (e.g., "12 months"),
    Fee (UGX formatted with commas), Pass Mark (percentage), Units Count, Status badge
  - Searchable by title
  - Paginated
- **Create Course:** "Create Course" button opens a comprehensive form:
  - Title (required, text input)
  - Description (optional, textarea)
  - School (required, select from active schools)
  - Duration (required, number input) + Duration Unit (select: Months or Years)
  - Fee Amount (required, number input in UGX, minimum 0)
  - Pass Mark (required, 0-100%, validated with error message if out of range)
  - Course Units (multi-select via checkbox list, scrollable container showing
    all available course units with checkboxes)
  - Status (select: Active or Inactive)
- **Edit Course:** Row action → "Edit" opens pre-filled form
- **Delete Course:** Row action → "Delete" with confirmation dialog
- **View Detail:** Row action → "View" navigates to the course detail page

### 4.3 Course Detail Page (`/dashboard/courses/:courseId`)

**Purpose:** View complete information about a specific course and its assigned units.

**Functionality:**
- **Back Navigation:** "Back" button returns to the course list
- **Page Header:** Course title and description with status badge
- **Information Cards (4):**
  - School name
  - Duration (e.g., "12 months")
  - Fee (UGX formatted)
  - Pass Mark (percentage)
- **Assigned Course Units Section:**
  - Count of assigned units in the heading
  - List of units, each showing: title, lecturer name, credit hours, status badge
  - Empty state message if no units assigned
- **Not Found State:** If courseId doesn't match any course, displays a "Course Not
  Found" message with a link back to the courses list

### 4.4 Course Unit Management (`/dashboard/course-units`)

**Purpose:** Manage individual course units (subjects/modules) and handle the
approval workflow for lecturer-submitted units.

**Functionality:**
- **Data Table:**
  - Columns: Title, Course (looked up), Lecturer (looked up), Credit Hours,
    Status (colored badges: Active=green, Pending Approval=yellow, Rejected=red)
  - Searchable by title
- **Create Course Unit (Admin):** Form dialog with fields:
  - Title (required)
  - Description (optional, textarea)
  - Course (required, select)
  - Credit Hours (required, number, minimum 1)
  - Lecturer (required, select from lecturers — visible to Admin only)
  - Admin-created units receive "Active" status immediately
- **Approval Workflow:**
  - Units created by lecturers appear with "Pending Approval" status
  - Admin sees "Approve" (green) and "Reject" (red) action buttons inline
  - Clicking "Approve" changes status to "Active" with success toast
  - Clicking "Reject" changes status to "Rejected" with success toast
- **Edit/Delete:** Standard row actions via dropdown menu

### 4.5 Intake Management (`/dashboard/intakes`)

**Purpose:** Create enrollment periods (intakes/cohorts) for courses, allowing the
same course to be offered multiple times with different schedules and fees.

**Functionality:**
- **Data Table:**
  - Columns: Intake Name, Course (looked up), Start Date (formatted),
    End Date (formatted), Capacity, Enrolled Count, Status badge
  - Searchable by name
- **Create Intake:** Form dialog with fields:
  - Intake Name (required, e.g., "January 2026 Intake")
  - Course (required, select)
  - Start Date (required, date picker)
  - End Date (required, date picker, validated to be after start date)
  - Maximum Capacity (required, number, minimum 1)
  - Fee Override (optional, number in UGX — pre-fills from course fee when
    course is selected, but can be changed)
  - Status (select: Active or Inactive)
  - **Date Validation:** If end date is before start date, an inline error
    message appears: "End date must be after start date"
- **View Detail:** Row action navigates to intake detail page
- **Edit/Delete:** Standard row actions

### 4.6 Intake Detail Page (`/dashboard/intakes/:intakeId`)

**Purpose:** View intake information and the list of enrolled students.

**Functionality:**
- **Back Navigation:** Returns to intakes list
- **Page Header:** Intake name with course title as description, status badge
- **Information Cards (4):**
  - Start Date (formatted)
  - End Date (formatted)
  - Enrollment count (enrolled / capacity)
  - Fee (with "(override)" label if fee override is set)
- **Enrolled Students Table:**
  - Columns: Student Name (looked up), Enrollment Date, Status badge,
    Payment Status badge
  - Searchable by student
  - Empty state: "No students enrolled in this intake yet."

### 4.7 Enrollment Management (`/dashboard/enrollment`)

**Purpose:** View and manage all student enrollments across the platform.

**Functionality:**
- **Status Filter:** Select dropdown above the table to filter by enrollment
  status (All, Active, Payment Pending, Completed, Dropped)
- **Data Table:**
  - Columns: Student (name lookup), Course/Unit (title lookup), Enrollment Date
    (formatted), Status (colored badge), Payment Status (colored badge)
  - Searchable
  - Status badges use distinct colors: Active=primary, Payment Pending=yellow,
    Completed=green, Dropped=red

### 4.8 Certification Management (`/dashboard/certificates`)

**Purpose:** View all issued certificates, preview them, and manage downloads.

**Functionality:**
- **Filters:**
  - Course filter (select dropdown with all courses)
  - Student name search (text input with search icon)
- **Data Table:**
  - Columns: Serial Number, Student Name (lookup), Course (lookup),
    Issue Date (formatted), Status (Valid=green badge, Revoked=red badge)
  - Row actions: Eye icon (preview), Download icon (PDF)
- **Certificate Preview:** Clicking the eye icon displays a styled certificate
  template below the table:
  - University logo and name at the top
  - "Certificate of Completion" heading
  - Student name (large, bold)
  - Course title
  - Completion date
  - Serial number and issue date at the bottom
  - Status badge (Valid/Revoked)
  - "Download PDF" button (triggers toast: "PDF download started")
  - "Close" button to dismiss the preview
- **Download Action:** Triggers a success toast notification simulating PDF generation

### 4.9 Payments Dashboard (`/dashboard/payments`)

**Purpose:** Financial overview with aggregate metrics, revenue trends, and
transaction history.

**Functionality:**
- **KPI Cards (3):**
  - Total Revenue: Sum of all completed payments (UGX formatted)
  - Pending Payments: Count of transactions with "pending" status
  - Failed Transactions: Count of transactions with "failed" status
- **Revenue Chart:**
  - Line chart (Recharts) showing monthly revenue over time
  - X-axis: months, Y-axis: revenue in millions (UGX)
  - Tooltip shows exact UGX amount on hover
  - Primary color line with dot markers
- **Transaction History Table:**
  - Columns: Transaction ID, Description, Amount (UGX), Date (formatted),
    Method (badge: Mobile Money/Bank Transfer/Card), Status (colored badge)
  - Searchable by transaction ID or description
  - Paginated

### 4.10 Reporting & Analytics (`/dashboard/reporting`)

**Purpose:** Comprehensive analytics dashboard for data-driven decision making.

**Functionality:**
- **KPI Cards (4):**
  - Total Enrollments (with count)
  - Total Revenue (UGX, abbreviated for large numbers: e.g., "UGX 2.4B")
  - Average Pass Rate (percentage)
  - Active Lecturers (count)
- **Enrollment Trends Chart:**
  - Line chart showing monthly enrollment counts over the past 12 months
  - X-axis: month abbreviations, Y-axis: enrollment count
  - Smooth monotone curve with primary color
- **Revenue by School Chart:**
  - Horizontal bar chart showing revenue breakdown by school
  - Each bar represents a school with its total revenue
  - Tooltip shows exact UGX amount
  - School names on Y-axis (truncated if too long)
- **Top Performing Courses Table:**
  - Columns: Course Title, School, Enrollment Count, Pass Rate (percentage)
  - Searchable by course title or school
- **Lecturer Performance Table:**
  - Columns: Lecturer Name, Courses (count), Students (count),
    Average Rating (out of 5.0), Pass Rate (percentage)
  - Searchable by lecturer name

---

## 5. Lecturer Portal

Lecturers are responsible for content creation, teaching delivery, assessment, and
personalized tutoring. Their portal focuses on the tools needed to teach effectively.

### 5.1 Dashboard Overview (`/dashboard`)

**Purpose:** Quick summary of the lecturer's teaching activity.

**KPI Cards (4):**
- My Courses: Number of courses the lecturer is assigned to
- Total Students: Combined student count across all courses
- Upcoming Classes: Number of scheduled live sessions today/upcoming
- Pending Submissions: Count of student submissions awaiting grading

### 5.2 Course Unit Management (`/dashboard/course-units`)

**Purpose:** Lecturers create and manage their own course units. Unlike admins,
lecturer-created units require approval before becoming available to students.

**Functionality:**
- **Data Table:** Shows only the lecturer's own course units (filtered by lecturer ID)
- **Page Title:** Changes to "My Course Units" for lecturers
- **Create Course Unit:** Form dialog with fields:
  - Title, Description, Course (select), Credit Hours
  - Lecturer field is auto-filled with the current user's name (disabled input)
  - New units automatically receive "Pending Approval" status
  - Success message: "Course unit submitted for approval"
- **Approval Status:** Lecturers can see the status of their submissions but
  cannot approve/reject (those buttons are hidden for the lecturer role)
- **Edit/Delete:** Lecturers can edit or delete their own units

### 5.3 Study Materials (`/dashboard/materials`)

**Purpose:** Upload, organize, and manage learning resources for students.

**Functionality:**
- **Accordion Layout:** Materials are grouped by course unit in expandable sections.
  Each section header shows the course unit name and a badge with the material count.
- **Material List Items:** Each material displays:
  - Type icon (color-coded): PDF=red FileText, Video=blue Video, Presentation=orange,
    Assignment=green FileCheck
  - Title (bold)
  - Metadata row: file size (formatted: KB/MB/GB), upload date, download count
- **Upload Material:** "Upload Material" button opens a form dialog:
  - Title (required)
  - Description (optional, textarea)
  - Course Unit (required, select dropdown)
  - Material Type (required, select: PDF, Video, Presentation, Assignment)
  - File Upload (file input)
  - Validation: title and course unit required, type required
- **Delete Material:** Trash icon on each material opens a confirmation dialog
  before permanent removal
- **Filtering:** Lecturers see only materials they uploaded (filtered by uploadedBy)
- **Empty State:** "No materials uploaded yet." when no materials exist

### 5.4 Virtual Learning (`/dashboard/virtual-learning`)

**Purpose:** Schedule, manage, and conduct live virtual classes via Zoom or Jitsi.

**Functionality:**
- **Upcoming Classes Section:**
  - List of scheduled classes sorted by date (soonest first)
  - Each class card shows: video icon, title, "Live" badge (if currently in progress),
    course unit name, date/time, duration, platform badge (Zoom=blue, Jitsi=green),
    attendee count, "Join" button (opens meeting link in new tab)
  - Empty state: "No upcoming classes scheduled."
- **Schedule Class:** "Schedule Class" button opens form dialog:
  - Title (required)
  - Course Unit (required, select)
  - Date (required, date input)
  - Start Time (required, time input)
  - Duration (number, minutes, minimum 15)
  - Platform (required, select: Zoom or Jitsi)
  - Meeting Link (required, URL input)
  - Validation on all required fields
- **Past Classes Section:**
  - List of completed classes sorted by date (most recent first)
  - Each card shows class info plus an expandable attendance records section:
    - Student name, join time (HH:mm), leave time (HH:mm)
  - Muted styling to distinguish from upcoming classes
- **Filtering:** Lecturers see only their own classes (filtered by lecturerId)

### 5.5 Examinations (`/dashboard/examinations`)

**Purpose:** Create and manage assessments (quizzes, assignments, final exams) and
review student submissions.

**Functionality:**
- **Data Table:**
  - Columns: Title, Course Unit (lookup), Type (colored badge: Quiz=blue,
    Assignment=purple, Final Exam=orange), Due Date (formatted), Pass Mark (%),
    Time Limit (minutes or "Untimed"), Status badge
  - Searchable by title
  - Lecturers see only exams for their assigned course units
- **Create Exam:** "Create Exam" button opens form dialog:
  - Title (required)
  - Course Unit (required, select)
  - Type (required, select: Quiz, Assignment, Final Exam)
  - Instructions (textarea for student-facing instructions)
  - Pass Mark (0-100, number input)
  - Time Limit (optional, minutes — leave empty for untimed)
  - Maximum Attempts (number, minimum 1)
  - Start Date (required, date input)
  - End Date (required, date input)
  - Validation on required fields
- **View Details:** Row action navigates to exam detail page

### 5.6 Exam Detail Page (`/dashboard/examinations/:examId`)

**Purpose:** View exam configuration and review student submissions with statistics.

**Functionality (Lecturer/Admin View):**
- **Back Navigation:** Returns to examinations list
- **Page Header:** Exam title with course unit name as description
- **Aggregate Statistics (4 KPI Cards):**
  - Average Score (percentage)
  - Pass Rate (percentage)
  - Highest Score (percentage)
  - Lowest Score (percentage)
- **Exam Settings Card:** Grid displaying all exam configuration:
  - Type, Pass Mark, Time Limit, Max Attempts, Start Date, End Date, Instructions
- **Submissions Table:**
  - Heading shows total submission count
  - Columns: Student Name, Submission Date (formatted with time), Score (%),
    Status (Passed=green, Failed=red, Pending=gray badge)
  - Searchable by student name
  - Empty state: "No submissions yet."

### 5.7 Tutoring (`/dashboard/tutoring`)

**Purpose:** Manage personalized tutoring sessions and configure availability.

**Functionality (Lecturer View):**
- **Sessions Table:**
  - Columns: Student Name (lookup), Subject, Date/Time (formatted), Duration (hours),
    Status (Upcoming=blue, Completed=green, Cancelled=gray badge)
  - Searchable by subject
  - Shows only the lecturer's own sessions
- **Tutoring Settings Section (card):**
  - **Available Subjects:** Grid of checkboxes for subjects the lecturer can tutor
    (Data Structures, Database Systems, Web Development, Software Engineering,
    Machine Learning, Marketing, Research Methods, etc.)
  - **Hourly Rate:** Number input in UGX (e.g., 50,000)
  - **Weekly Availability:** Grid of day cards (Monday through Sunday), each showing
    the available time slots or "Not available"

### 5.8 Notifications (`/dashboard/notifications`)

**Purpose:** Stay informed about platform events relevant to the lecturer.

**Functionality:**
- **Notification List:** Sorted by date (most recent first), each item shows:
  - Unread indicator: blue dot + bold title + left border accent for unread items
  - Title and message preview (truncated with ellipsis)
  - Category badge (Enrollment=blue, Payment=green, Class=purple, Exam=orange)
  - Timestamp (formatted: "May 22, 2026 14:30")
- **Filters:**
  - Category filter (select: All, Enrollment, Payment, Class, Exam)
  - Read/Unread filter (select: All, Read, Unread)
- **Mark as Read:** Click any notification to mark it as read (removes bold/dot/border)
- **Mark All as Read:** Button in page header (visible only when unread count > 0)
  marks all notifications as read with success toast
- **Empty State:** "No notifications found." when filters return no results

---

## 6. Student Portal

Students interact with the platform primarily as consumers of educational content.
Their portal focuses on enrollment, learning, assessment, and payment.

### 6.1 Dashboard Overview (`/dashboard`)

**Purpose:** Personal academic summary at a glance.

**KPI Cards (4):**
- Enrolled Courses: Number of active course enrollments
- Upcoming Classes: Live sessions scheduled for today/upcoming
- Pending Payments: Count of outstanding payment obligations
- Average Grade: Overall academic performance percentage with trend indicator

### 6.2 Enrollment (`/dashboard/enrollment`)

**Purpose:** Browse available courses, enroll, and manage enrollment history.

**Functionality:**
- **Filters Section:**
  - School filter (select dropdown with all active schools)
  - Duration filter (select: All, Short ≤12 months, Medium 1-3 years, Long 3+ years)
  - Fee Range filter (select: All, Under UGX 3M, UGX 3M-5M, Over UGX 5M)
- **Available Courses Grid:**
  - Card layout (responsive: 1 column mobile, 2 tablet, 3 desktop)
  - Each card shows: Course title, School name, Duration (with clock icon),
    Fee in UGX (with credit card icon), Unit count (with book icon), "Enroll" button
  - Only shows active courses the student is not already enrolled in
- **Enrollment Confirmation Dialog:**
  - Triggered by clicking "Enroll" on a course card
  - Shows course title, fee amount, and explanation that payment is required
  - "Confirm Enrollment" button creates an enrollment with "Payment Pending" status
  - Success toast: "Enrollment initiated! Please complete payment."
- **My Enrollments Section:**
  - Data table of the student's enrollment history
  - Columns: Course/Unit (title lookup), Enrollment Date (formatted), Status (badge),
    Payment Status (badge)
  - **"Complete Payment" Action:** Visible for enrollments with "Payment Pending" status.
    Clicking it simulates payment completion (changes status to Active, payment to Completed)
  - Searchable, paginated

### 6.3 Study Materials (`/dashboard/materials`)

**Purpose:** Access learning resources for enrolled courses only.

**Functionality:**
- **Access Control:** Students see only materials belonging to course units within
  their enrolled courses. The system resolves this by:
  1. Finding the student's active enrollments
  2. Getting the course IDs from those enrollments
  3. Getting all unit IDs from those courses
  4. Filtering materials to only those matching enrolled unit IDs
- **Accordion Layout:** Same as lecturer view but read-only
- **Material Items:** Each shows type icon, title, file size, upload date, download count
- **Download Button:** Instead of the delete button (lecturer view), students see a
  download icon button that triggers a toast: "Downloading [title]..."
- **Upload Hidden:** The "Upload Material" button is not shown to students
- **Empty State:** "No materials uploaded yet." if no materials match enrolled courses

### 6.4 Virtual Learning (`/dashboard/virtual-learning`)

**Purpose:** View and join live classes for enrolled courses.

**Functionality:**
- **Access Control:** Students see only classes for course units within their
  enrolled courses (same filtering logic as materials)
- **Schedule Button Hidden:** "Schedule Class" button is not shown to students
- **Upcoming Classes:** Same card layout as lecturer view:
  - Title, "Live" badge (if active), course unit, date/time, duration,
    platform badge, attendee count, "Join" button
- **Past Classes:** Same as lecturer view with attendance records
- **Page Description:** Changes to "Join live classes for your enrolled courses."

### 6.5 Examinations (`/dashboard/examinations`)

**Purpose:** View available exams and take assessments.

**Functionality:**
- **Access Control:** Students see only active exams for their enrolled course units
- **Create Button Hidden:** "Create Exam" button is not shown to students
- **Data Table:** Same columns as lecturer view but filtered to enrolled units only
- **Page Description:** Changes to "View and take your exams and assessments."
- **View Details:** Row action navigates to the student exam view

### 6.6 Exam Detail — Student View (`/dashboard/examinations/:examId`)

**Purpose:** View exam instructions and start the assessment.

**Functionality:**
- **Back Navigation:** Returns to examinations list
- **Page Header:** Exam title with course unit name
- **Exam Details Card:** Grid showing:
  - Type (Quiz/Assignment/Final Exam)
  - Pass Mark (percentage)
  - Time Limit (minutes or "Untimed")
  - Max Attempts
  - Attempts Used (current count / max)
  - Due Date (formatted)
- **Instructions Card:** Full exam instructions text
- **Start Exam Section (centered card):**
  - If attempts remaining: Shows time limit info + "Start Exam" button (large, primary)
  - If max attempts exhausted: Shows red error message "Maximum attempts exhausted
    (X/X)" + disabled "Start Exam" button
  - Clicking "Start Exam" triggers a success toast: "Exam started! You have X minutes
    to complete this exam."
- **Previous Submissions Section:** (shown if student has prior attempts)
  - Table with columns: Attempt number, Submission Date, Score (%), Status badge
  - Helps students track their progress across attempts

### 6.7 Certificates (`/dashboard/certificates`)

**Purpose:** View and download earned certificates.

**Functionality:**
- **Access Control:** Shows only certificates issued to the current student
- **Page Title:** "My Certificates"
- **Empty State:** If no certificates, shows a large award icon with message:
  "No certificates yet. Complete your courses to earn certificates."
- **Data Table (when certificates exist):**
  - Columns: Serial Number, Course Title, Issue Date (formatted),
    Completion Date (formatted), Status badge (Valid/Revoked)
  - Searchable by course title or serial number
  - Row actions: Eye icon (preview), Download icon (PDF)
- **Certificate Preview:** Same styled template as admin view:
  - University logo, "Certificate of Completion" heading, student name,
    course title, completion date, serial number, status badge
  - "Download PDF" button

### 6.8 Payments (`/dashboard/payments`)

**Purpose:** Make payments and track financial history.

**Functionality:**
- **KPI Cards (3):**
  - Total Paid: Sum of completed payments (UGX)
  - Pending Amount: Sum of pending payments (UGX)
  - Total Transactions: Count of all transactions
- **Make Payment:** "Make Payment" button opens form dialog:
  - Amount (UGX, pre-filled with pending amount if any)
  - Payment Method (select: Mobile Money, Bank Transfer, Card)
  - Phone Number (appears only when Mobile Money is selected, required for that method)
  - Validation: amount required and positive, method required, phone required for MM
  - On success: creates a "completed" transaction, shows toast with amount and method
- **Transaction History Table:**
  - Shows only the student's own transactions
  - Columns: Transaction ID, Description, Amount (UGX), Date, Method (badge), Status (badge)
  - **Retry Action:** For failed transactions, a "Retry" button appears that
    changes the status to "completed" with success toast
  - Searchable by transaction ID or description
  - Empty state: "No transactions found."

### 6.9 Tutoring (`/dashboard/tutoring`)

**Purpose:** Find tutors, book sessions, and track tutoring history.

**Functionality:**
- **Available Tutors Grid:**
  - Card layout (responsive: 1/2/3 columns)
  - Each tutor card shows:
    - Name (bold)
    - Star rating (filled star icon + numeric rating out of 5.0)
    - Subject badges (list of subjects the tutor offers)
    - Hourly rate (UGX with clock icon)
    - Availability status (Available=green badge, Unavailable=gray badge)
    - "Book Session" button (disabled if unavailable)
- **Book Session Dialog:** Triggered by clicking "Book Session":
  - Subject (select from the tutor's available subjects)
  - Preferred Date (date picker)
  - Time Slot (select from predefined slots: 09:00, 10:00, 11:00, 14:00, 15:00, 16:00)
  - Duration (select: 1, 2, or 3 hours)
  - **Estimated Cost Card:** Shows calculated cost (hourly rate × duration) with
    breakdown (e.g., "UGX 50,000/hr × 2 hrs")
  - Validation: subject, date, and time slot required
  - On confirm: creates session, shows detailed toast with tutor name, date, time,
    and payment amount
- **Upcoming Sessions Table:** (shown if student has upcoming bookings)
  - Columns: Tutor (name lookup), Subject, Date/Time, Duration, Cost (calculated),
    Status badge
- **Session History Table:**
  - All past sessions with same columns
  - Searchable by subject
  - Empty state: "No past sessions."

### 6.10 Notifications (`/dashboard/notifications`)

**Purpose:** Stay informed about academic events and deadlines.

**Functionality:**
- Same interface as lecturer notifications (section 5.8) but filtered to the
  student's own notifications
- **High-Priority Toast Alerts (on page load):**
  - **Exam Deadlines:** If any active exam for an enrolled course unit has an end date
    within 24 hours, a warning toast appears: "Exam deadline approaching! [Title] is
    due in X hours"
  - **Live Class Reminders:** If any scheduled class for an enrolled course unit starts
    within 15 minutes, an info toast appears: "Live class starting soon! [Title] starts
    in X minutes"
  - Toasts auto-dismiss after 5-10 seconds
  - Only triggered for students (not lecturers/admins)

---

## 7. Cross-Cutting Features

These features span across all user roles and pages.

### 7.1 Sidebar Navigation

- Persistent left sidebar using shadcn Sidebar component
- Collapsible to icon-only mode via toggle button (Ctrl+B keyboard shortcut)
- On mobile (< 768px): renders as a slide-out sheet overlay
- **Header:** Makerere University logo + "Makerere Online" text
- **Content:** Role-filtered navigation items grouped into labeled sections
- **Footer:** User avatar (initials), name, and role badge
- **Notification Badge:** Unread count displayed next to the Notifications menu item
- **Active State:** Current page highlighted with accent background

### 7.2 Dashboard Header

- **Sidebar Toggle:** Hamburger button to collapse/expand the sidebar
- **Breadcrumbs:** Auto-generated from the current URL path
  (e.g., Dashboard > Schools > Edit)
- **Role Switcher:** Dropdown button showing current role, allows switching between
  Super Admin, Admin, Lecturer, and Student for development/testing
- **Notification Bell:** Icon with red badge showing unread count

### 7.3 Responsive Design

- **Desktop (≥ 768px):** Full sidebar + content area side by side
- **Mobile (< 768px):**
  - Sidebar becomes a slide-out sheet (swipe or button to open)
  - Data tables scroll horizontally within ScrollArea
  - Form dialogs render as full-screen sheets instead of centered dialogs
  - Touch targets maintain minimum 44×44px size
- **Keyboard Navigation:** All interactive elements accessible via Tab, Enter/Space
  for activation, Escape for dismissing dialogs

### 7.4 Toast Notifications (Sonner)

Used throughout the application for feedback:
- **Success:** Green toast for successful operations (create, edit, delete, approve)
- **Warning:** Yellow toast for approaching deadlines
- **Info:** Blue toast for informational alerts (class starting soon)
- **Error:** Red toast for failed operations
- Auto-dismiss after 5 seconds (configurable per toast)

### 7.5 Form Validation (Zod)

All forms use Zod schema validation with:
- Inline error messages below each invalid field
- Real-time validation on submit
- Type-safe form data
- Custom validation rules (date ranges, percentage bounds, email format)

### 7.6 Data Table Component

Reusable across all list pages with:
- Column definitions with custom render functions
- Full-text search across configurable fields
- Client-side pagination (10 rows per page)
- Row action menus (dropdown with Edit, Delete, View, custom actions)
- Empty state message when no data matches
- Horizontal scroll on mobile via ScrollArea

### 7.7 Confirmation Dialogs

All destructive actions (delete, reject) require explicit confirmation:
- AlertDialog with title and description
- Destructive variant uses red "Delete"/"Reject" button
- Cancel button to abort the action
- Prevents accidental data loss

---

## 8. Technical Architecture

### 8.1 Frontend Stack

| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| React Router DOM v7 | Client-side routing |
| Tailwind CSS v4 | Styling (custom Makerere theme) |
| shadcn/ui | Component library (40+ components) |
| Recharts | Data visualization (charts) |
| React Hook Form + Zod | Form handling and validation |
| Sonner | Toast notifications |
| Lucide React | Icon library |
| date-fns | Date formatting |
| Vite 7 | Build tool and dev server |

### 8.2 Backend Stack (API)

| Technology | Purpose |
|-----------|---------|
| Python FastAPI | REST API framework |
| SQLAlchemy 2.0 | ORM |
| PostgreSQL 16 | Database |
| JWT (python-jose) | Authentication |
| Pydantic v2 | Request/response validation |
| Alembic | Database migrations |
| Docker | Containerization |

### 8.3 Deployment

| Component | URL | Port |
|-----------|-----|------|
| Frontend (nginx) | https://makerereonlineschool.com | 3535 |
| API (FastAPI) | https://api.makerereonlineschool.com | 3434 |
| Database (PostgreSQL) | Internal | 3435 |

- Hosted on Contabo VPS (95.111.239.122)
- Apache reverse proxy with SSL (Let's Encrypt/Certbot)
- Docker Compose for container orchestration
- DNS managed via Contabo DNS Management

### 8.4 Design System

The platform uses a custom Makerere-inspired design system:
- **Primary Color:** Deep crimson (oklch(0.42 0.18 25))
- **Accent Color:** Gold (oklch(0.78 0.14 80))
- **Background:** Warm cream (oklch(0.985 0.008 80))
- **Typography:** Fraunces (display/headings), Inter (body text)
- **Card Pattern:** rounded-2xl, border, bg-card, shadow-soft
- **Gradients:** Hero gradient (crimson to ink), Gold gradient

---

*End of Report*
