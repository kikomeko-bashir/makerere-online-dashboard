import type { School } from "@/lib/types";

export const mockSchools: School[] = [
  {
    id: "school-001",
    name: "School of Computing and Informatics Technology",
    code: "SCIT",
    description:
      "Offers programs in computer science, software engineering, and information technology.",
    headOfSchool: "user-004",
    departmentsCount: 4,
    status: "active",
  },
  {
    id: "school-002",
    name: "School of Business",
    code: "SOB",
    description:
      "Provides business administration, accounting, and finance programs.",
    headOfSchool: "user-005",
    departmentsCount: 5,
    status: "active",
  },
  {
    id: "school-003",
    name: "School of Engineering",
    code: "SOE",
    description:
      "Covers civil, electrical, and mechanical engineering disciplines.",
    headOfSchool: "user-006",
    departmentsCount: 6,
    status: "active",
  },
  {
    id: "school-004",
    name: "School of Education",
    code: "SEDU",
    description:
      "Trains teachers and education professionals for primary and secondary levels.",
    headOfSchool: "user-007",
    departmentsCount: 3,
    status: "active",
  },
  {
    id: "school-005",
    name: "School of Law",
    code: "SOL",
    description:
      "Offers undergraduate and postgraduate law programs with a focus on East African legal systems.",
    headOfSchool: "user-002",
    departmentsCount: 2,
    status: "active",
  },
  {
    id: "school-006",
    name: "School of Health Sciences",
    code: "SHS",
    description:
      "Provides medical, nursing, and public health programs.",
    headOfSchool: "user-003",
    departmentsCount: 4,
    status: "inactive",
  },
];
