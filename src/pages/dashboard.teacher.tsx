import { createFileRoute } from "@tanstack/react-router";
import { Users, BookOpen, MessageSquare, Star, Video, Upload, ClipboardCheck, Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/teacher")({
  component: TeacherDash,
});

const stats = [
  { l: "Active students", v: "428", i: Users },
  { l: "Courses taught", v: "5", i: BookOpen },
  { l: "Pending messages", v: "12", i: MessageSquare },
  { l: "Avg. rating", v: "4.9", i: Star },
];

function TeacherDash() {
  return (
    <div className="container-tight py-10 space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Teacher portal</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold">Welcome back, Prof. Okello</h1>
          <p className="mt-1 text-sm text-muted-foreground">You have 2 live sessions today and 18 papers awaiting your review.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:border-primary/40">
            <Upload className="h-4 w-4" /> Upload lecture
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> New course
          </button>
        </div>
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
          <h2 className="font-display text-xl font-bold">My classes</h2>
          <table className="mt-5 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr><th className="py-3">Course</th><th>Batch</th><th>Students</th><th>Progress</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { c: "Physics 101", b: "Spring 2026 A", s: 124, p: 72 },
                { c: "Optics & Waves", b: "Spring 2026", s: 96, p: 45 },
                { c: "Foundations of Mechanics", b: "Fall 2025", s: 208, p: 100 },
              ].map((row) => (
                <tr key={row.c}>
                  <td className="py-3 font-medium">{row.c}</td>
                  <td className="text-muted-foreground">{row.b}</td>
                  <td>{row.s}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${row.p}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{row.p}%</span>
                    </div>
                  </td>
                  <td className="text-right"><button className="text-xs text-primary font-semibold hover:underline">Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Today's lectures</h2>
          </div>
          <ul className="mt-5 space-y-3">
            {[
              { t: "10:00", title: "Newton's Laws — Q&A", students: 124 },
              { t: "14:00", title: "Optics Live Lab", students: 96 },
            ].map((s) => (
              <li key={s.title} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary bg-primary/10 rounded-md px-2 py-1">{s.t}</span>
                  <span className="text-xs text-muted-foreground">{s.students} enrolled</span>
                </div>
                <div className="mt-2 font-medium text-sm">{s.title}</div>
                <button className="mt-3 w-full inline-flex justify-center items-center gap-2 rounded-md bg-primary py-2 text-xs font-semibold text-primary-foreground">
                  <Video className="h-3.5 w-3.5" /> Start session
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Papers to grade</h2>
        </div>
        <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { n: "Sarah Nansubuga", c: "Physics 101 — Mid-term", d: "Submitted 2h ago" },
            { n: "Daniel Mukasa", c: "Optics quiz", d: "Submitted yesterday" },
            { n: "Grace Awino", c: "Mechanics assignment 3", d: "Submitted 3d ago" },
            { n: "Brian Kintu", c: "Physics 101 — Mid-term", d: "Submitted 5h ago" },
            { n: "Mariam Nakato", c: "Optics quiz", d: "Submitted 1d ago" },
            { n: "Joseph Onyango", c: "Mechanics assignment 3", d: "Submitted 4d ago" },
          ].map((p) => (
            <div key={p.n + p.c} className="rounded-xl border border-border p-4">
              <div className="font-medium text-sm">{p.n}</div>
              <div className="text-xs text-muted-foreground">{p.c}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{p.d}</div>
              <button className="mt-3 text-xs text-primary font-semibold hover:underline">Grade now →</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
