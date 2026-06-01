# Makerere Online University Management System
## System Architecture Document

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Dashboard<br/>React + Vite]
        MOBILE[Mobile App<br/>React Native]
    end

    subgraph "Reverse Proxy Layer"
        APACHE[Apache2<br/>SSL Termination + Routing]
    end

    subgraph "Application Layer"
        API[FastAPI Backend<br/>Port 3434]
        NGINX[Nginx<br/>Static Files - Port 3535]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL 16<br/>Port 3435)]
        S3[AWS S3<br/>File Storage]
    end

    subgraph "External Services"
        ZOOM[Zoom API]
        JITSI[Jitsi Meet]
        INTERSWITCH[Interswitch<br/>Mobile Money]
        EMAIL[Email Service<br/>SMTP]
    end

    WEB -->|HTTPS| APACHE
    MOBILE -->|HTTPS| APACHE
    APACHE -->|proxy_pass| API
    APACHE -->|proxy_pass| NGINX
    API -->|SQLAlchemy| DB
    API -->|boto3| S3
    API -->|REST| ZOOM
    API -->|REST| JITSI
    API -->|REST| INTERSWITCH
    API -->|SMTP| EMAIL
```

---

## 2. Deployment Architecture

```mermaid
graph LR
    subgraph "Contabo VPS - 95.111.239.122"
        subgraph "Docker Network"
            DC1[makerere-online-dashboard<br/>nginx:alpine<br/>Port 3535]
            DC2[makerere-online-api<br/>python:3.12-slim<br/>Port 3434]
            DC3[postgres:16-alpine<br/>Port 3435]
        end
        AP[Apache2<br/>Port 80/443]
    end

    DNS[DNS<br/>*.makerereonlineschool.com<br/>→ 95.111.239.122]

    USER((User)) -->|HTTPS| DNS
    DNS --> AP
    AP -->|makerereonlineschool.com| DC1
    AP -->|api.makerereonlineschool.com| DC2
    DC2 --> DC3
```

---

## 3. Module Communication Diagram

```mermaid
graph TD
    subgraph "Frontend Modules"
        AUTH_UI[Auth Module<br/>Login / Register]
        SCHOOL_UI[School Management]
        COURSE_UI[Course Management]
        UNIT_UI[Course Unit Management]
        ENROLL_UI[Enrollment Module]
        MATERIAL_UI[Study Materials]
        VIRTUAL_UI[Virtual Learning]
        EXAM_UI[Examination Module]
        CERT_UI[Certification Module]
        PAY_UI[Payment Module]
        TUTOR_UI[Tutoring Module]
        NOTIF_UI[Notification Module]
        REPORT_UI[Reporting Module]
    end

    subgraph "API Routers"
        AUTH_API[/api/auth]
        USERS_API[/api/users]
        SCHOOLS_API[/api/schools]
        COURSES_API[/api/courses]
        UNITS_API[/api/course-units]
        ENROLL_API[/api/enrollments]
        MATERIAL_API[/api/materials]
        VIRTUAL_API[/api/virtual-classes]
        EXAM_API[/api/examinations]
        CERT_API[/api/certificates]
        PAY_API[/api/payments]
        TUTOR_API[/api/tutoring]
        NOTIF_API[/api/notifications]
    end

    AUTH_UI --> AUTH_API
    SCHOOL_UI --> SCHOOLS_API
    COURSE_UI --> COURSES_API
    UNIT_UI --> UNITS_API
    ENROLL_UI --> ENROLL_API
    MATERIAL_UI --> MATERIAL_API
    VIRTUAL_UI --> VIRTUAL_API
    EXAM_UI --> EXAM_API
    CERT_UI --> CERT_API
    PAY_UI --> PAY_API
    TUTOR_UI --> TUTOR_API
    NOTIF_UI --> NOTIF_API
    REPORT_UI --> ENROLL_API
    REPORT_UI --> PAY_API
```

---

## 4. Data Flow — Authentication

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (React)
    participant A as API (FastAPI)
    participant D as Database (PostgreSQL)

    U->>F: Enter email + password
    F->>A: POST /api/auth/login
    A->>D: Query user by email
    D-->>A: User record
    A->>A: Verify bcrypt password
    A->>A: Generate JWT token
    A-->>F: { access_token, user }
    F->>F: Store token in localStorage
    F->>F: Update AuthContext
    F-->>U: Redirect to /dashboard
    
    Note over F,A: Subsequent requests include<br/>Authorization: Bearer <token>
```

---

## 5. Data Flow — Course Creation

```mermaid
sequenceDiagram
    participant Admin as Admin (Browser)
    participant F as Frontend
    participant A as API
    participant D as Database

    Admin->>F: Fill course form + select units
    F->>F: Validate (Zod): title, school, ≥1 unit
    F->>A: POST /api/courses { title, school_id, unit_ids, ... }
    A->>A: Verify JWT + role (admin/super_admin)
    A->>A: Validate unit_ids not empty
    A->>D: INSERT INTO courses
    D-->>A: Course created (id)
    A->>D: UPDATE course_units SET course_id = ? WHERE id IN (unit_ids)
    D-->>A: Units linked
    A-->>F: CourseResponse { id, title, ... }
    F->>F: Add to courses list
    F-->>Admin: Toast: "Course created successfully"
```

---

## 6. Data Flow — Student Enrollment

```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant A as API
    participant P as Payment Gateway
    participant D as Database

    S->>F: Click "Enroll" on course
    F->>F: Show confirmation dialog
    S->>F: Confirm enrollment
    F->>A: POST /api/enrollments { course_id, student_id }
    A->>D: INSERT enrollment (status: payment_pending)
    A-->>F: Enrollment created
    F->>F: Redirect to payment
    S->>F: Enter phone number + confirm
    F->>A: POST /api/payments { enrollment_id, phone, method }
    A->>P: Initiate Mobile Money payment
    P-->>A: Payment confirmed
    A->>D: UPDATE enrollment SET status = active
    A->>D: INSERT payment (status: completed)
    A-->>F: Payment success
    F-->>S: Toast: "Enrollment complete!"
```

---

## 7. Module Dependency Graph

```mermaid
graph TD
    USERS[Users Module] --> AUTH[Authentication]
    SCHOOLS[Schools Module] --> USERS
    COURSES[Courses Module] --> SCHOOLS
    COURSES --> UNITS[Course Units Module]
    UNITS --> USERS
    INTAKES[Intakes Module] --> COURSES
    ENROLLMENT[Enrollment Module] --> INTAKES
    ENROLLMENT --> USERS
    ENROLLMENT --> PAYMENTS[Payment Module]
    MATERIALS[Study Materials Module] --> UNITS
    MATERIALS --> USERS
    VIRTUAL[Virtual Learning Module] --> UNITS
    VIRTUAL --> USERS
    EXAMS[Examination Module] --> UNITS
    EXAMS --> USERS
    CERTS[Certification Module] --> COURSES
    CERTS --> USERS
    CERTS --> EXAMS
    TUTORING[Tutoring Module] --> USERS
    TUTORING --> PAYMENTS
    NOTIFICATIONS[Notification Module] --> USERS
    NOTIFICATIONS --> ENROLLMENT
    NOTIFICATIONS --> EXAMS
    NOTIFICATIONS --> VIRTUAL
    REPORTING[Reporting Module] --> ENROLLMENT
    REPORTING --> PAYMENTS
    REPORTING --> EXAMS
    REPORTING --> USERS
```

---

## 8. Database Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        string id PK
        string name
        string email UK
        string hashed_password
        string role
        string avatar
        datetime created_at
    }

    SCHOOLS {
        string id PK
        string name
        string code UK
        string description
        string head_of_school FK
        int departments_count
        string status
        datetime created_at
    }

    COURSES {
        string id PK
        string title
        string description
        string school_id FK
        int duration
        string duration_unit
        float fee
        int pass_mark
        string status
        datetime created_at
    }

    COURSE_UNITS {
        string id PK
        string title
        string description
        string course_id FK
        string lecturer_id FK
        int credit_hours
        string status
        datetime created_at
    }

    INTAKES {
        string id PK
        string name
        string course_id FK
        date start_date
        date end_date
        int capacity
        int enrolled_count
        float fee_override
        string status
    }

    ENROLLMENTS {
        string id PK
        string student_id FK
        string course_id FK
        string course_unit_id FK
        string intake_id FK
        date enrollment_date
        string status
        string payment_status
    }

    PAYMENTS {
        string id PK
        string transaction_id UK
        string student_id FK
        string description
        float amount
        datetime date
        string method
        string phone_number
        string status
        string failure_reason
    }

    STUDY_MATERIALS {
        string id PK
        string title
        string description
        string course_unit_id FK
        string type
        string file_url
        int file_size
        date upload_date
        int download_count
        string uploaded_by FK
    }

    VIRTUAL_CLASSES {
        string id PK
        string title
        string course_unit_id FK
        string lecturer_id FK
        date date
        string start_time
        int duration
        string platform
        string meeting_link
        int attendee_count
        boolean is_live
    }

    EXAMINATIONS {
        string id PK
        string title
        string course_unit_id FK
        string type
        string instructions
        int pass_mark
        int time_limit
        int max_attempts
        date start_date
        date end_date
        string status
    }

    CERTIFICATES {
        string id PK
        string serial_number UK
        string student_id FK
        string course_id FK
        date issue_date
        date completion_date
        string status
    }

    TUTORING_SESSIONS {
        string id PK
        string tutor_id FK
        string student_id FK
        string subject
        date date
        string time_slot
        int duration
        float hourly_rate
        string status
    }

    NOTIFICATIONS {
        string id PK
        string user_id FK
        string title
        string message
        string category
        boolean is_read
        datetime created_at
        string link_to
    }

    USERS ||--o{ SCHOOLS : "heads"
    SCHOOLS ||--o{ COURSES : "contains"
    COURSES ||--o{ COURSE_UNITS : "has"
    USERS ||--o{ COURSE_UNITS : "teaches"
    COURSES ||--o{ INTAKES : "offered_in"
    USERS ||--o{ ENROLLMENTS : "enrolls"
    COURSES ||--o{ ENROLLMENTS : "enrolled_in"
    INTAKES ||--o{ ENROLLMENTS : "belongs_to"
    USERS ||--o{ PAYMENTS : "pays"
    COURSE_UNITS ||--o{ STUDY_MATERIALS : "has"
    COURSE_UNITS ||--o{ VIRTUAL_CLASSES : "scheduled_for"
    USERS ||--o{ VIRTUAL_CLASSES : "teaches"
    COURSE_UNITS ||--o{ EXAMINATIONS : "assessed_by"
    USERS ||--o{ CERTIFICATES : "earns"
    COURSES ||--o{ CERTIFICATES : "certifies"
    USERS ||--o{ TUTORING_SESSIONS : "tutors"
    USERS ||--o{ TUTORING_SESSIONS : "books"
    USERS ||--o{ NOTIFICATIONS : "receives"
```

---

## 9. Role-Based Access Control Matrix

```mermaid
graph LR
    subgraph "Super Admin"
        SA1[User Management]
        SA2[System Settings]
        SA3[All Admin Features]
    end

    subgraph "Admin"
        A1[School Management]
        A2[Course Management]
        A3[Course Unit Approval]
        A4[Intake Management]
        A5[Enrollment Oversight]
        A6[Payment Dashboard]
        A7[Reporting]
        A8[User Management<br/>except super_admin]
    end

    subgraph "Lecturer"
        L1[Course Unit Creation<br/>pending approval]
        L2[Study Materials Upload]
        L3[Virtual Class Scheduling]
        L4[Exam Creation + Grading]
        L5[Tutoring Management]
    end

    subgraph "Student"
        S1[Course Enrollment]
        S2[Material Access]
        S3[Join Live Classes]
        S4[Take Exams]
        S5[Download Certificates]
        S6[Make Payments]
        S7[Book Tutoring]
    end
```

---

## 10. Technology Stack Overview

```mermaid
graph TB
    subgraph "Frontend"
        REACT[React 19]
        RRD[React Router DOM v7]
        TAILWIND[Tailwind CSS v4]
        SHADCN[shadcn/ui]
        RECHARTS[Recharts]
        RHF[React Hook Form + Zod]
        SONNER[Sonner Toasts]
    end

    subgraph "Backend"
        FASTAPI[FastAPI]
        SQLA[SQLAlchemy 2.0]
        PYDANTIC[Pydantic v2]
        BCRYPT[bcrypt]
        JOSE[python-jose JWT]
    end

    subgraph "Infrastructure"
        DOCKER[Docker + Compose]
        POSTGRES[PostgreSQL 16]
        NGINXS[Nginx]
        APACHES[Apache2 + Certbot]
        CONTABO[Contabo VPS]
    end

    REACT --> RRD
    REACT --> TAILWIND
    REACT --> SHADCN
    REACT --> RECHARTS
    REACT --> RHF
    REACT --> SONNER

    FASTAPI --> SQLA
    FASTAPI --> PYDANTIC
    FASTAPI --> BCRYPT
    FASTAPI --> JOSE

    DOCKER --> POSTGRES
    DOCKER --> NGINXS
    CONTABO --> APACHES
    CONTABO --> DOCKER
```

---

## 11. Request Lifecycle

```mermaid
sequenceDiagram
    participant B as Browser
    participant AP as Apache (SSL)
    participant NG as Nginx (Frontend)
    participant FA as FastAPI (Backend)
    participant PG as PostgreSQL

    B->>AP: GET https://makerereonlineschool.com/dashboard
    AP->>NG: proxy_pass :3535
    NG-->>B: index.html + JS bundle

    B->>B: React renders, checks localStorage for token
    B->>AP: GET https://api.makerereonlineschool.com/api/schools
    Note over B: Authorization: Bearer <JWT>
    AP->>FA: proxy_pass :3434
    FA->>FA: Decode JWT, verify signature
    FA->>FA: Check user role permissions
    FA->>PG: SELECT * FROM schools
    PG-->>FA: School records
    FA-->>AP: JSON response
    AP-->>B: JSON response
    B->>B: React renders DataTable with schools
```

---

## 12. Module Interaction Summary

| Module | Depends On | Provides To |
|--------|-----------|-------------|
| **Authentication** | Users DB | JWT tokens to all modules |
| **User Management** | Authentication | User records to all modules |
| **School Management** | Users (head of school) | School IDs to Courses |
| **Course Management** | Schools, Course Units | Course IDs to Intakes, Enrollment, Certificates |
| **Course Unit Management** | Courses (optional), Users (lecturer) | Unit IDs to Materials, Classes, Exams |
| **Intake Management** | Courses | Intake IDs to Enrollment |
| **Enrollment** | Users, Courses/Units, Intakes, Payments | Access control for Materials, Classes, Exams |
| **Study Materials** | Course Units, Users | Learning content to Students |
| **Virtual Learning** | Course Units, Users, Zoom/Jitsi | Live sessions, Attendance records |
| **Examination** | Course Units, Users | Scores to Certification, Reporting |
| **Certification** | Courses, Users, Exam results | Verifiable certificates |
| **Payment** | Users, Interswitch | Payment status to Enrollment, Tutoring |
| **Tutoring** | Users, Payments | Session records |
| **Notification** | All modules (events) | Alerts to Users |
| **Reporting** | Enrollment, Payments, Exams, Users | Analytics dashboards |

---

*This document uses Mermaid diagrams. View in any Markdown renderer that supports Mermaid (GitHub, VS Code with extension, etc.)*

---

## 13. Class Diagram

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +String hashed_password
        +UserRole role
        +String avatar
        +DateTime created_at
        +verify_password(plain) bool
    }

    class School {
        +String id
        +String name
        +String code
        +String description
        +String head_of_school
        +int departments_count
        +Status status
        +DateTime created_at
    }

    class Course {
        +String id
        +String title
        +String description
        +String school_id
        +int duration
        +String duration_unit
        +float fee
        +int pass_mark
        +Status status
        +DateTime created_at
        +get_units() List~CourseUnit~
    }

    class CourseUnit {
        +String id
        +String title
        +String description
        +String course_id
        +String lecturer_id
        +int credit_hours
        +ApprovalStatus status
        +DateTime created_at
        +is_independent() bool
    }

    class Intake {
        +String id
        +String name
        +String course_id
        +Date start_date
        +Date end_date
        +int capacity
        +int enrolled_count
        +float fee_override
        +Status status
        +is_open() bool
    }

    class Enrollment {
        +String id
        +String student_id
        +String course_id
        +String course_unit_id
        +String intake_id
        +Date enrollment_date
        +EnrollmentStatus status
        +PaymentStatus payment_status
        +complete_payment()
    }

    class Payment {
        +String id
        +String transaction_id
        +String student_id
        +String description
        +float amount
        +DateTime date
        +PaymentMethod method
        +String phone_number
        +PaymentStatus status
        +String failure_reason
        +retry()
    }

    class StudyMaterial {
        +String id
        +String title
        +String description
        +String course_unit_id
        +MaterialType type
        +String file_url
        +int file_size
        +Date upload_date
        +int download_count
        +String uploaded_by
    }

    class VirtualClass {
        +String id
        +String title
        +String course_unit_id
        +String lecturer_id
        +Date date
        +String start_time
        +int duration
        +Platform platform
        +String meeting_link
        +int attendee_count
        +bool is_live
        +get_join_url() String
    }

    class Examination {
        +String id
        +String title
        +String course_unit_id
        +ExamType type
        +String instructions
        +int pass_mark
        +int time_limit
        +int max_attempts
        +Date start_date
        +Date end_date
        +Status status
        +is_available() bool
    }

    class ExamSubmission {
        +String id
        +String exam_id
        +String student_id
        +DateTime submission_date
        +int score
        +SubmissionStatus status
        +int attempt_number
        +has_passed() bool
    }

    class Certificate {
        +String id
        +String serial_number
        +String student_id
        +String course_id
        +Date issue_date
        +Date completion_date
        +CertificateStatus status
        +generate_pdf() bytes
        +verify() bool
    }

    class TutoringSession {
        +String id
        +String tutor_id
        +String student_id
        +String subject
        +Date date
        +String time_slot
        +int duration
        +float hourly_rate
        +SessionStatus status
        +get_total_cost() float
    }

    class Notification {
        +String id
        +String user_id
        +String title
        +String message
        +NotificationCategory category
        +bool is_read
        +DateTime created_at
        +String link_to
        +mark_as_read()
    }

    %% Enumerations
    class UserRole {
        <<enumeration>>
        super_admin
        admin
        lecturer
        student
    }

    class Status {
        <<enumeration>>
        active
        inactive
    }

    class ApprovalStatus {
        <<enumeration>>
        active
        pending_approval
        rejected
    }

    class EnrollmentStatus {
        <<enumeration>>
        active
        payment_pending
        completed
        dropped
    }

    class PaymentStatus {
        <<enumeration>>
        completed
        pending
        failed
    }

    class ExamType {
        <<enumeration>>
        quiz
        assignment
        final_exam
    }

    class Platform {
        <<enumeration>>
        zoom
        jitsi
    }

    %% Relationships
    User "1" --> "*" School : heads
    School "1" --> "*" Course : contains
    Course "1" --> "*" CourseUnit : has
    User "1" --> "*" CourseUnit : teaches
    Course "1" --> "*" Intake : offered_in
    User "1" --> "*" Enrollment : enrolls_in
    Course "1" --> "*" Enrollment : enrolled_for
    Intake "1" --> "*" Enrollment : belongs_to
    Enrollment "1" --> "0..1" Payment : paid_by
    CourseUnit "1" --> "*" StudyMaterial : contains
    User "1" --> "*" StudyMaterial : uploads
    CourseUnit "1" --> "*" VirtualClass : scheduled_for
    User "1" --> "*" VirtualClass : conducts
    CourseUnit "1" --> "*" Examination : assessed_by
    Examination "1" --> "*" ExamSubmission : has
    User "1" --> "*" ExamSubmission : submits
    User "1" --> "*" Certificate : earns
    Course "1" --> "*" Certificate : certifies
    User "1" --> "*" TutoringSession : tutors
    User "1" --> "*" TutoringSession : books
    TutoringSession "1" --> "0..1" Payment : paid_by
    User "1" --> "*" Notification : receives
```
