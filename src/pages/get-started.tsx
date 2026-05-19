import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, ArrowRight, Check } from "lucide-react";
import studentsGroup from "@/assets/students-group.jpg";

export const Route = createFileRoute("/get-started")({
  component: GetStarted,
});

const steps = [
  { n: 1, t: "Your details", d: "Tell us about yourself to create your account." },
  { n: 2, t: "Confirm", d: "Review and submit your registration." },
];

function GetStarted() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  return (
    <section className="relative">
      <div className="relative bg-hero-gradient">
        <div className="container-tight py-16 md:py-20 text-cream">
          <span className="text-xs uppercase tracking-[0.25em] text-gold">Student Registration</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold max-w-2xl">
            Start your learning journey today.
          </h1>
          <p className="mt-4 max-w-xl text-cream/80">
            Create your student account and get instant access to courses, live classes, and certificates.
          </p>
        </div>
      </div>

      <div className="container-tight py-12 grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
          {/* Stepper */}
          <div className="grid grid-cols-2 border-b border-border">
            {steps.map((s) => (
              <button
                key={s.n}
                onClick={() => { if (s.n < step || (s.n === 2 && form.name && form.email && form.password)) setStep(s.n); }}
                className={`p-4 text-left transition ${step === s.n ? "bg-primary/5" : "hover:bg-muted/50"}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                    step > s.n ? "bg-primary text-primary-foreground" : step === s.n ? "bg-gold text-[oklch(0.2_0.03_40)]" : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s.n ? <Check className="h-4 w-4" /> : s.n}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{s.t}</div>
                    <div className="text-xs text-muted-foreground">{s.d}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-8 md:p-10">
            {step === 1 && (
              <form
                onSubmit={(e) => { e.preventDefault(); setStep(2); }}
                className="space-y-5"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold">Create your student account</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fill in your details below. Teachers and administrators are added by the institution — only students register here.
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <div>
                    <div className="text-sm font-semibold">Student Account</div>
                    <div className="text-xs text-muted-foreground">Enroll in courses, attend live classes, take exams and earn certificates.</div>
                  </div>
                </div>
                <label className="block">
                  <span className="text-sm font-medium">Full name</span>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Email</span>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Password</span>
                  <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </label>
                <div className="flex justify-end">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="text-center py-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-gold-gradient grid place-items-center">
                  <Check className="h-8 w-8 text-[oklch(0.2_0.03_40)]" />
                </div>
                <h2 className="mt-5 font-display text-3xl font-bold">You're all set, {form.name || "scholar"}.</h2>
                <p className="mt-2 text-muted-foreground">Your student dashboard is ready.</p>
                <Link
                  to="/dashboard/student"
                  className="mt-7 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-soft"
                >
                  Go to dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setStep(1)}
                  className="mt-3 block mx-auto text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Edit details
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl overflow-hidden shadow-soft">
            <img src={studentsGroup} alt="Students" className="h-48 w-full object-cover" loading="lazy" />
          </div>
          <div className="rounded-2xl border border-border p-6 bg-card">
            <h3 className="font-display text-lg font-bold">What you get on day one</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {["Access to 320+ courses", "Live classes with real lecturers", "Verified certificates", "Mobile-friendly anywhere", "Community of 24,000+ learners"].map((b) => (
                <li key={b} className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>{b}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border p-5 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Teachers & Administrators:</strong> Your accounts are created by the institution. Please contact your department or the admin office for access.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </aside>
      </div>
    </section>
  );
}
