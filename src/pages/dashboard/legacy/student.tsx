import { Link } from "react-router-dom";
import { BookOpen, Clock, Trophy, Calendar, PlayCircle, FileCheck2, Video, TrendingUp } from "lucide-react";
import lab from "@/assets/lab.jpg";
import liveClass from "@/assets/live-class.jpg";
import books from "@/assets/books.jpg";

const stats = [
  { l: "Enrolled courses", v: "6", i: BookOpen },
  { l: "Hours this week", v: "12.4", i: Clock },
  { l: "Average grade", v: "82%", i: Trophy },
  { l: "Live classes today", v: "2", i: Video },
];

const courses = [
  { id: "intro-cs", title: "Introduction to Computer Science", progress: 64, next: "Recursion & Trees", img: lab },
  { id: "web-react", title: "Web Development with React", progress: 38, next: "useEffect deep-dive", img: liveClass },
  { id: "african-lit", title: "African Literature in the 21st Century", progress: 91, next: "Final essay", img: books },
];

const schedule = [
  { t: "10:00", title: "CS Live: Data Structures Q&A", teacher: "Sarah Mugisha" },
  { t: "14:00", title: "React Workshop — Forms", teacher: "Eng. James Kato" },
  { t: "Tomorrow", title: "Physics Lab Simulation", teacher: "Prof. David Okello" },
];

export default function StudentDash() {
  return (
    <div className="container-tight py-10 space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Student portal</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold">Karibu, Aisha 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">You're on a 7-day learning streak. Keep going.</p>
        </div>
        <Link to="/courses" className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Browse more courses</Link>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <s.i className="h-5 w-5 text-primary" />
            <div className="mt-3 font-display text-3xl font-bold">{s.v}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Continue learning</h2>
            <Link to="/courses" className="text-xs text-primary font-semibold hover:underline">View all</Link>
          </div>
          <div className="mt-5 space-y-4">
            {courses.map((c) => (
              <div key={c.id} className="flex gap-4 items-center">
                <img src={c.img} alt="" className="h-16 w-24 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <Link to={`/courses/${c.id}`} className="font-semibold truncate hover:text-primary">{c.title}</Link>
                  <div className="text-xs text-muted-foreground mt-0.5">Next: {c.next}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
                <button className="grid place-items-center h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                  <PlayCircle className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Today's schedule</h2>
          </div>
          <ul className="mt-5 space-y-3">
            {schedule.map((s) => (
              <li key={s.title} className="flex gap-3">
                <span className="text-xs font-semibold text-primary bg-primary/10 rounded-md px-2 py-1 h-fit">{s.t}</span>
                <div>
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="text-xs text-muted-foreground">with {s.teacher}</div>
                </div>
              </li>
            ))}
          </ul>
          <button className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-md border border-border py-2.5 text-sm font-medium hover:border-primary/40">
            <Video className="h-4 w-4" /> Join live class
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Upcoming exams</h2>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {[
              { c: "Physics 101", t: "Mid-term", d: "May 24, 09:00" },
              { c: "Intro to CS", t: "Quiz: Recursion", d: "May 22, 13:00" },
              { c: "African Lit", t: "Final essay", d: "May 30, 23:59" },
            ].map((e) => (
              <li key={e.t} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{e.t}</div>
                  <div className="text-xs text-muted-foreground">{e.c}</div>
                </div>
                <span className="text-xs text-muted-foreground">{e.d}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-hero-gradient text-cream p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            <h2 className="font-display text-xl font-bold">Your progress</h2>
          </div>
          <p className="mt-3 text-sm text-cream/80">You've completed 64% of your semester goals — 4 certificates within reach.</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[{ k: "12", v: "Certificates" }, { k: "84", v: "Lessons done" }, { k: "92%", v: "Attendance" }].map((m) => (
              <div key={m.v} className="rounded-xl bg-white/10 p-3">
                <div className="font-display text-2xl font-bold text-gold">{m.k}</div>
                <div className="text-[10px] uppercase tracking-wider text-cream/70 mt-1">{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
