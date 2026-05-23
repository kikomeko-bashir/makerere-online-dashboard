import { Users, GraduationCap, BookOpen, DollarSign, Activity, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

const kpis = [
  { l: "Total students", v: "24,812", d: "+312 this week", i: GraduationCap },
  { l: "Active teachers", v: "640", d: "+8 this week", i: Users },
  { l: "Live courses", v: "320", d: "12 in review", i: BookOpen },
  { l: "Revenue (UGX)", v: "184.2M", d: "+18% MoM", i: DollarSign },
];

export default function AdminDash() {
  return (
    <div className="container-tight py-10 space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Administrator</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold">Platform overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Snapshot for {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:border-primary/40">Export report</button>
          <button className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Invite user</button>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.l} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <k.i className="h-5 w-5 text-primary" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.d}</span>
            </div>
            <div className="mt-3 font-display text-3xl font-bold">{k.v}</div>
            <div className="text-xs text-muted-foreground mt-1">{k.l}</div>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Enrollment — last 12 weeks</h2>
          </div>
          <div className="mt-6 flex items-end gap-2 h-44">
            {[34, 42, 38, 56, 48, 61, 72, 65, 80, 92, 88, 104].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-linear-to-t from-primary to-[oklch(0.62_0.2_25)]" style={{ height: `${v}%` }} />
                <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">System health</h2>
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { l: "API uptime", v: "99.98%", ok: true },
              { l: "Video streaming", v: "Healthy", ok: true },
              { l: "Payments gateway", v: "Operational", ok: true },
              { l: "Storage", v: "82% used", ok: false },
            ].map((row) => (
              <li key={row.l} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {row.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                  {row.l}
                </span>
                <span className="text-xs text-muted-foreground">{row.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold">Recent enrollments</h2>
          <table className="mt-5 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr><th className="py-3">Student</th><th>Course</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { s: "Aisha Nansubuga", c: "Web Development with React", a: "UGX 420,000", k: "Paid" },
                { s: "Daniel Mukasa", c: "Physics 101", a: "Free", k: "Enrolled" },
                { s: "Grace Awino", c: "Foundations of Entrepreneurship", a: "UGX 320,000", k: "Paid" },
                { s: "Brian Kintu", c: "Public Health & Community Care", a: "UGX 180,000", k: "Pending" },
                { s: "Mariam Nakato", c: "Introduction to Computer Science", a: "UGX 250,000", k: "Paid" },
              ].map((r) => (
                <tr key={r.s}>
                  <td className="py-3 font-medium">{r.s}</td>
                  <td className="text-muted-foreground">{r.c}</td>
                  <td>{r.a}</td>
                  <td>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold ${
                      r.k === "Paid" ? "bg-emerald-100 text-emerald-700" : r.k === "Pending" ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                    }`}>{r.k}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl bg-hero-gradient text-cream p-6">
          <h2 className="font-display text-xl font-bold">Pending approvals</h2>
          <ul className="mt-5 space-y-3">
            {[
              { t: "New teacher application", n: "Dr. Mercy Otieno" },
              { t: "Course submission", n: "Calculus II — Prof. Okello" },
              { t: "Refund request", n: "UGX 250,000 — B. Kintu" },
            ].map((p) => (
              <li key={p.t} className="rounded-xl bg-white/10 p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{p.t}</div>
                  <div className="text-xs text-cream/70">{p.n}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs bg-gold text-[oklch(0.2_0.03_40)] font-semibold px-3 py-1.5 rounded-md">Review</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
