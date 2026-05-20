import type { CourseUnit } from "@/lib/types";

export const mockCourseUnits: CourseUnit[] = [
  {
    id: "unit-001",
    title: "Data Structures and Algorithms",
    description:
      "Covers arrays, linked lists, trees, graphs, sorting, and searching algorithms.",
    courseId: "course-001",
    lecturerId: "user-004",
    creditHours: 4,
    status: "active",
  },
  {
    id: "unit-002",
    title: "Software Engineering Principles",
    description:
      "Agile methodologies, software design patterns, and project management.",
    courseId: "course-001",
    lecturerId: "user-005",
    creditHours: 3,
    status: "active",
  },
  {
    id: "unit-003",
    title: "Database Management Systems",
    description:
      "Relational databases, SQL, normalization, and transaction management.",
    courseId: "course-001",
    lecturerId: "user-004",
    creditHours: 3,
    status: "active",
  },
  {
    id: "unit-004",
    title: "Principles of Marketing",
    description:
      "Marketing strategies, consumer behavior, and digital marketing fundamentals.",
    courseId: "course-002",
    lecturerId: "user-006",
    creditHours: 3,
    status: "active",
  },
  {
    id: "unit-005",
    title: "Financial Accounting",
    description:
      "Double-entry bookkeeping, financial statements, and accounting standards.",
    courseId: "course-002",
    lecturerId: "user-007",
    creditHours: 4,
    status: "active",
  },
  {
    id: "unit-006",
    title: "Structural Analysis",
    description:
      "Analysis of beams, trusses, and frames under various loading conditions.",
    courseId: "course-003",
    lecturerId: "user-005",
    creditHours: 4,
    status: "active",
  },
  {
    id: "unit-007",
    title: "Geotechnical Engineering",
    description:
      "Soil mechanics, foundation design, and earth retaining structures.",
    courseId: "course-003",
    lecturerId: "user-006",
    creditHours: 3,
    status: "pending_approval",
  },
  {
    id: "unit-008",
    title: "Web Development Fundamentals",
    description:
      "HTML, CSS, JavaScript, and responsive web design principles.",
    courseId: "course-004",
    lecturerId: "user-004",
    creditHours: 3,
    status: "active",
  },
  {
    id: "unit-009",
    title: "Curriculum Development",
    description:
      "Designing, implementing, and evaluating educational curricula.",
    courseId: "course-005",
    lecturerId: "user-007",
    creditHours: 3,
    status: "active",
  },
  {
    id: "unit-010",
    title: "Educational Research Methods",
    description:
      "Quantitative and qualitative research methodologies in education.",
    courseId: "course-005",
    lecturerId: "user-006",
    creditHours: 3,
    status: "pending_approval",
  },
  {
    id: "unit-011",
    title: "Constitutional Law",
    description:
      "Study of the Ugandan constitution, fundamental rights, and governance structures.",
    courseId: "course-006",
    lecturerId: "user-007",
    creditHours: 4,
    status: "active",
  },
  {
    id: "unit-012",
    title: "Introduction to Machine Learning",
    description:
      "Supervised and unsupervised learning, neural networks, and model evaluation.",
    courseId: "course-007",
    lecturerId: "user-005",
    creditHours: 3,
    status: "rejected",
  },
];
