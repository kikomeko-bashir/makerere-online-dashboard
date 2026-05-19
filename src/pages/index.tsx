import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap, Video, FileText, Users, Award, CalendarCheck,
  PlayCircle, ArrowRight, CheckCircle2, Sparkles, Globe, MessageCircle,
} from "lucide-react";
import heroCampus from "@/assets/hero-campus.jpg";
import studentLearning from "@/assets/student-learning.jpg";
import teacherOnline from "@/assets/teacher-online.jpg";
import studentsGroup from "@/assets/students-group.jpg";
import graduation from "@/assets/graduation.jpg";
import lab from "@/assets/lab.jpg";
import books from "@/assets/books.jpg";
import liveClass from "@/assets/live-class.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroCampus} alt="Makerere campus at golden hour" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        </div>
        <div className="relative container-tight py-24 md:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-medium text-cream backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Now enrolling — January 2026 intake
            </span>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold text-cream leading-[1.05]">
              A university in your{" "}
              <span className="italic text-gold">pocket.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-cream/85 max-w-2xl leading-relaxed">
              Makerere Online School brings the rigor of a great university to anyone with a phone or laptop —
              live classes, expert teachers, recorded lectures, exams, and certificates that travel with you.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-gold-gradient px-6 py-3.5 text-sm font-semibold text-[oklch(0.2_0.03_40)] shadow-elegant hover:opacity-95 transition">
                Start learning <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/courses" className="inline-flex items-center gap-2 rounded-md border border-white/25 px-6 py-3.5 text-sm font-semibold text-cream hover:bg-white/10 transition">
                <PlayCircle className="h-4 w-4" /> Explore courses
              </Link>
            </div>
            <dl className="mt-14 grid grid-cols-3 gap-6 max-w-xl">
              {[
                { k: "24k+", v: "Students enrolled" },
                { k: "320+", v: "Courses live" },
                { k: "95%", v: "Pass rate" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-3xl md:text-4xl font-bold text-gold">{s.k}</dt>
                  <dd className="text-xs uppercase tracking-wider text-cream/70 mt-1">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-cream">
        <div className="container-tight py-6 flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>Accredited by NCHE Uganda</span>
          <span className="hidden md:inline">•</span>
          <span>Partner of African Virtual University</span>
          <span className="hidden md:inline">•</span>
          <span>ISO 9001 Certified</span>
          <span className="hidden md:inline">•</span>
          <span>EdTech Africa Award 2025</span>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="container-tight py-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">One platform · Three journeys</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">Built for everyone in the classroom.</h2>
          <p className="mt-4 text-muted-foreground">Whether you're learning, teaching, or running an institution — we have a home for you.</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { img: studentLearning, icon: GraduationCap, title: "Students", text: "Enroll in batches, watch lectures, take exams, join live classes, and track your progress on a beautiful, mobile-first dashboard.", points: ["Video lectures & past papers", "Practice + mock exams", "Push notifications"] },
            { img: teacherOnline, icon: Video, title: "Teachers", text: "Upload content, build question banks, host live classes, mark attendance and answer student doubts — all in one place.", points: ["Live classes (Zoom & Jitsi)", "Exam builder", "Doubt clearing system"] },
            { img: studentsGroup, icon: Users, title: "Administrators", text: "Run the entire institution from one dashboard — courses, users, payments, reports, certificates and branding.", points: ["Multi-institute support", "Payments (Razorpay/PayPal)", "Auto-certificates"] },
          ].map((c) => (
            <div key={c.title} className="group rounded-2xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1">
              <div className="relative h-52 overflow-hidden">
                <img src={c.img} alt={c.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="grid place-items-center h-10 w-10 rounded-lg bg-gold text-[oklch(0.2_0.03_40)]">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-2xl font-bold text-cream">{c.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground">{c.text}</p>
                <ul className="mt-4 space-y-2">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SHOWCASE */}
      <section className="bg-cream py-24">
        <div className="container-tight">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img src={liveClass} alt="Live online class" loading="lazy" className="rounded-2xl shadow-elegant w-full" />
              <div className="absolute -bottom-6 -right-6 hidden md:flex items-center gap-3 rounded-xl bg-card border border-border p-4 shadow-soft max-w-xs">
                <span className="grid place-items-center h-10 w-10 rounded-full bg-primary text-primary-foreground"><Video className="h-5 w-5" /></span>
                <div className="text-sm">
                  <p className="font-semibold">Physics 101 — Live</p>
                  <p className="text-xs text-muted-foreground">Prof. Nakato · 142 watching</p>
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Live, every day</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">Real classes. Real teachers. Right on your screen.</h2>
              <p className="mt-4 text-muted-foreground">
                Join interactive live sessions via Zoom or Jitsi Meet. Ask questions, raise your hand,
                and replay anything you missed — without leaving home.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Video, t: "HD live video" },
                  { icon: MessageCircle, t: "Live chat & polls" },
                  { icon: CalendarCheck, t: "Scheduled or instant" },
                  { icon: PlayCircle, t: "Recorded replays" },
                ].map((f) => (
                  <div key={f.t} className="flex items-center gap-3 rounded-lg bg-card border border-border p-3">
                    <f.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{f.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mt-24">
            <div className="md:order-2 relative">
              <img src={books} alt="Books and notes library" loading="lazy" className="rounded-2xl shadow-elegant w-full" />
            </div>
            <div className="md:order-1">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Library at your fingertips</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">Every book, every note, every past paper.</h2>
              <p className="mt-4 text-muted-foreground">
                Download or read PDFs in-app. Browse a curated library of textbooks, lecture notes,
                and a decade of past examination papers for every subject we offer.
              </p>
              <ul className="mt-8 space-y-3">
                {["Searchable PDF library", "Subject-organized chapters", "Offline downloads on mobile", "New material added weekly"].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm"><CheckCircle2 className="h-5 w-5 text-primary mt-0.5" /> {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="container-tight py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The full stack</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">Everything an online university needs.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">
          {[
            { icon: Video, t: "Video lectures", d: "YouTube, Vimeo or self-hosted." },
            { icon: FileText, t: "Timed exams", d: "Practice & scheduled mocks." },
            { icon: Award, t: "Certificates", d: "Auto-generated on completion." },
            { icon: CalendarCheck, t: "Attendance", d: "Daily calendar tracking." },
            { icon: MessageCircle, t: "Doubt clearing", d: "Ask teachers anytime." },
            { icon: Users, t: "Multi-role access", d: "Admin, teacher, student." },
            { icon: Globe, t: "6 languages", d: "EN, FR, AR, HI, DE, ES." },
            { icon: Sparkles, t: "Payments built-in", d: "Razorpay & PayPal." },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-soft transition">
              <span className="grid place-items-center h-11 w-11 rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS / GALLERY */}
      <section className="bg-cream py-24">
        <div className="container-tight">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Voices from campus</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">Lives changed, one course at a time.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { img: graduation, q: "I graduated while working full-time. The flexibility changed my life.", n: "Sarah K.", r: "BSc Computer Science, 2025" },
              { img: lab, q: "The lab tutorials and live demos made everything click for me.", n: "James O.", r: "Pre-med, Year 2" },
              { img: studentsGroup, q: "Studying with classmates across three countries — that's the future.", n: "Amina H.", r: "MBA, Cohort 12" },
            ].map((t) => (
              <figure key={t.n} className="rounded-2xl overflow-hidden bg-card border border-border shadow-soft">
                <img src={t.img} alt={t.n} loading="lazy" className="h-56 w-full object-cover" />
                <figcaption className="p-6">
                  <p className="font-display italic text-lg leading-snug">"{t.q}"</p>
                  <div className="mt-4 text-sm">
                    <p className="font-semibold">{t.n}</p>
                    <p className="text-muted-foreground">{t.r}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-tight py-24">
        <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-10 md:p-16 shadow-elegant">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${graduation})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-cream">Your future starts with one click.</h2>
              <p className="mt-4 text-cream/85">Create your account in under 60 seconds. Free preview of every course.</p>
            </div>
            <div className="flex md:justify-end gap-3 flex-wrap">
              <Link to="/login" className="rounded-md bg-gold-gradient px-6 py-3.5 text-sm font-semibold text-[oklch(0.2_0.03_40)] shadow-elegant">Create account</Link>
              <Link to="/courses" className="rounded-md border border-white/25 px-6 py-3.5 text-sm font-semibold text-cream hover:bg-white/10">Browse courses</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
