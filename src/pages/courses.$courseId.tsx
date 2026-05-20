import { Link, useParams } from "react-router-dom";
import { Clock, Users, Star, PlayCircle, FileText, Award, CheckCircle2, Globe, Calendar, ArrowLeft } from "lucide-react";
import lab from "@/assets/lab.jpg";
import books from "@/assets/books.jpg";
import teacherOnline from "@/assets/teacher-online.jpg";
import studentLearning from "@/assets/student-learning.jpg";
import studentsGroup from "@/assets/students-group.jpg";
import liveClass from "@/assets/live-class.jpg";

type Course = {
  slug: string;
  cat: string;
  title: string;
  tagline: string;
  price: string;
  duration: string;
  students: number;
  rating: number;
  img: string;
  teacher: { name: string; role: string };
  chapters: { title: string; lessons: number; duration: string }[];
  outcomes: string[];
};

const COURSES: Record<string, Course> = {
  "physics-101": {
    slug: "physics-101", cat: "Science", title: "Physics 101 — Mechanics & Optics",
    tagline: "Build a rock-solid foundation in classical mechanics, optics and wave physics through experiments and worked examples.",
    price: "Free", duration: "12 weeks", students: 1240, rating: 4.9, img: lab,
    teacher: { name: "Prof. David Okello", role: "Department of Physics" },
    chapters: [
      { title: "Kinematics & Motion", lessons: 8, duration: "3h 20m" },
      { title: "Newton's Laws", lessons: 6, duration: "2h 40m" },
      { title: "Work, Energy & Power", lessons: 7, duration: "3h 10m" },
      { title: "Geometric Optics", lessons: 5, duration: "2h 15m" },
      { title: "Waves & Sound", lessons: 6, duration: "2h 50m" },
    ],
    outcomes: ["Solve real-world mechanics problems", "Design simple optical instruments", "Interpret motion graphs confidently", "Prepare for university physics"],
  },
  "intro-cs": {
    slug: "intro-cs", cat: "Technology", title: "Introduction to Computer Science",
    tagline: "From bits to algorithms — a rigorous, hands-on introduction designed with industry mentors.",
    price: "UGX 250,000", duration: "16 weeks", students: 2380, rating: 4.8, img: studentLearning,
    teacher: { name: "Sarah Mugisha", role: "Head of Engineering" },
    chapters: [
      { title: "How Computers Think", lessons: 5, duration: "2h" },
      { title: "Programming with Python", lessons: 12, duration: "6h 30m" },
      { title: "Data Structures", lessons: 9, duration: "5h" },
      { title: "Algorithms & Complexity", lessons: 8, duration: "4h 45m" },
      { title: "Building Your First App", lessons: 6, duration: "3h 20m" },
    ],
    outcomes: ["Write clean Python programs", "Reason about algorithm efficiency", "Build a portfolio project", "Prepare for software internships"],
  },
  "african-lit": {
    slug: "african-lit", cat: "Arts", title: "African Literature in the 21st Century",
    tagline: "Read the writers shaping a continent — from Adichie to Wainaina, from page to politics.",
    price: "Free", duration: "8 weeks", students: 870, rating: 4.7, img: books,
    teacher: { name: "Dr. Aisha Nakato", role: "Faculty of Arts" },
    chapters: [
      { title: "Voices of the Diaspora", lessons: 4, duration: "1h 50m" },
      { title: "Post-Colonial Narratives", lessons: 5, duration: "2h 20m" },
      { title: "Women Writers Today", lessons: 4, duration: "2h" },
      { title: "Politics & The Pen", lessons: 5, duration: "2h 30m" },
    ],
    outcomes: ["Analyse contemporary African texts", "Write structured literary essays", "Place authors in historical context"],
  },
  "entrepreneurship": {
    slug: "entrepreneurship", cat: "Business", title: "Foundations of Entrepreneurship",
    tagline: "Validate ideas, build MVPs, raise capital — taught by founders, for founders.",
    price: "UGX 320,000", duration: "10 weeks", students: 1560, rating: 4.9, img: teacherOnline,
    teacher: { name: "Eng. James Kato", role: "Innovation Hub" },
    chapters: [
      { title: "Spotting Opportunities", lessons: 5, duration: "2h" },
      { title: "Customer Discovery", lessons: 6, duration: "2h 40m" },
      { title: "Building an MVP", lessons: 7, duration: "3h 15m" },
      { title: "Pitching & Fundraising", lessons: 4, duration: "1h 50m" },
    ],
    outcomes: ["Run a customer discovery sprint", "Build & ship an MVP", "Craft a compelling investor pitch"],
  },
  "public-health": {
    slug: "public-health", cat: "Health", title: "Public Health & Community Care",
    tagline: "Equip yourself to serve communities — epidemiology, policy and field practice combined.",
    price: "UGX 180,000", duration: "14 weeks", students: 980, rating: 4.8, img: studentsGroup,
    teacher: { name: "Dr. Aisha Nakato", role: "School of Public Health" },
    chapters: [
      { title: "Foundations of Epidemiology", lessons: 6, duration: "2h 50m" },
      { title: "Health Systems in Africa", lessons: 5, duration: "2h 10m" },
      { title: "Community Outreach", lessons: 7, duration: "3h" },
      { title: "Data for Policy", lessons: 5, duration: "2h 20m" },
    ],
    outcomes: ["Read epidemiological studies", "Design a community health survey", "Advocate with data"],
  },
  "web-react": {
    slug: "web-react", cat: "Technology", title: "Web Development with React",
    tagline: "Ship modern, accessible web apps with React, TypeScript and Tailwind — the stack employers want.",
    price: "UGX 420,000", duration: "20 weeks", students: 3120, rating: 4.9, img: liveClass,
    teacher: { name: "Sarah Mugisha", role: "Head of Engineering" },
    chapters: [
      { title: "HTML, CSS & the Web", lessons: 6, duration: "3h" },
      { title: "JavaScript & TypeScript", lessons: 10, duration: "5h 30m" },
      { title: "Thinking in React", lessons: 8, duration: "4h 20m" },
      { title: "Data, Forms & Routing", lessons: 7, duration: "4h" },
      { title: "Capstone — Ship a SaaS", lessons: 5, duration: "3h 40m" },
    ],
    outcomes: ["Build and deploy a real web app", "Master React + TypeScript", "Pass front-end interviews"],
  },
};

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const c = courseId ? COURSES[courseId] : undefined;

  if (!c) {
    return (
      <div className="container-tight py-24 text-center">
        <h1 className="font-display text-4xl font-bold">Course not found</h1>
        <Link to="/courses" className="mt-4 inline-block text-primary font-semibold">Back to catalog</Link>
      </div>
    );
  }

  const totalLessons = c.chapters.reduce((s, ch) => s + ch.lessons, 0);

  return (
    <>
      <section className="relative bg-hero-gradient text-cream">
        <div className="container-tight py-14">
          <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-cream/70 hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> All courses
          </Link>
          <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-start">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold">{c.cat}</span>
              <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold leading-tight">{c.title}</h1>
              <p className="mt-4 text-cream/85 max-w-2xl">{c.tagline}</p>
              <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-cream/80">
                <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-gold text-gold" /> {c.rating} rating</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {c.students.toLocaleString()} learners</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {c.duration}</span>
                <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> English</span>
              </div>
              <div className="mt-7 flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-gold-gradient grid place-items-center font-display font-bold text-[oklch(0.2_0.03_40)]">
                  {c.teacher.name.split(" ").slice(-1)[0][0]}
                </span>
                <div>
                  <div className="text-sm font-semibold">{c.teacher.name}</div>
                  <div className="text-xs text-cream/60">{c.teacher.role}</div>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl bg-card text-foreground p-6 shadow-elegant">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img src={c.img} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />
                <button aria-label="Preview" className="absolute inset-0 grid place-items-center bg-black/30 hover:bg-black/20 transition">
                  <PlayCircle className="h-14 w-14 text-white drop-shadow-lg" />
                </button>
              </div>
              <div className="mt-5 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-primary">{c.price}</span>
                {c.price !== "Free" && <span className="text-xs text-muted-foreground">one-time, lifetime access</span>}
              </div>
              <Link to="/get-started" className="mt-5 block rounded-md bg-primary text-primary-foreground text-center py-3 text-sm font-semibold hover:opacity-90 shadow-soft">
                Enroll now
              </Link>
              <Link to="/login" className="mt-2 block rounded-md border border-border text-center py-2.5 text-sm font-medium hover:border-primary/40">
                Try a free lesson
              </Link>
              <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2"><FileText className="h-3.5 w-3.5 mt-0.5" /><span>{totalLessons} lessons, {c.chapters.length} chapters</span></li>
                <li className="flex gap-2"><Calendar className="h-3.5 w-3.5 mt-0.5" /><span>New cohort starts every Monday</span></li>
                <li className="flex gap-2"><Award className="h-3.5 w-3.5 mt-0.5" /><span>Accredited certificate on completion</span></li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="container-tight py-16 grid lg:grid-cols-[1fr_320px] gap-10">
        <div>
          <h2 className="font-display text-3xl font-bold">What you'll learn</h2>
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {c.outcomes.map((o) => (
              <div key={o} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{o}</span>
              </div>
            ))}
          </div>

          <h2 className="mt-14 font-display text-3xl font-bold">Curriculum</h2>
          <p className="mt-1 text-sm text-muted-foreground">{c.chapters.length} chapters · {totalLessons} lessons</p>
          <ol className="mt-6 space-y-3">
            {c.chapters.map((ch, i) => (
              <li key={ch.title} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-display font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="font-semibold">{ch.title}</div>
                    <div className="text-xs text-muted-foreground">{ch.lessons} lessons · {ch.duration}</div>
                  </div>
                </div>
                <PlayCircle className="h-5 w-5 text-muted-foreground" />
              </li>
            ))}
          </ol>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold">Meet your teacher</h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="h-14 w-14 rounded-full bg-gold-gradient grid place-items-center font-display text-lg font-bold text-[oklch(0.2_0.03_40)]">
                {c.teacher.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </span>
              <div>
                <div className="font-semibold">{c.teacher.name}</div>
                <div className="text-xs text-muted-foreground">{c.teacher.role}</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">A working expert with years of teaching experience, here to walk with you through every chapter.</p>
          </div>
          <div className="rounded-2xl bg-hero-gradient text-cream p-6">
            <h3 className="font-display text-lg font-bold">Not sure yet?</h3>
            <p className="mt-2 text-sm text-cream/80">Browse the full catalog or talk to admissions.</p>
            <Link to="/contact" className="mt-4 inline-block text-gold text-sm font-semibold hover:underline">Talk to admissions →</Link>
          </div>
        </aside>
      </section>
    </>
  );
}
