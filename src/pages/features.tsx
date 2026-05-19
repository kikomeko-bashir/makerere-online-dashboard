import { createFileRoute } from "@tanstack/react-router";
import {
  Video, FileText, Award, Users, CalendarCheck, MessageCircle, Globe,
  CreditCard, Bell, BookOpen, Layers, Shield, Smartphone, FileCheck, BarChart3, Languages
} from "lucide-react";
import liveClass from "@/assets/live-class.jpg";
import books from "@/assets/books.jpg";
import teacherOnline from "@/assets/teacher-online.jpg";

export const Route = createFileRoute("/features")({
  component: Features,
});

const features = [
  { icon: Video, t: "Live classes", d: "Zoom & Jitsi Meet — one tap to join." },
  { icon: FileText, t: "Timed exams", d: "Practice papers + scheduled mocks." },
  { icon: Award, t: "Certificates", d: "Auto-issued, shareable, verifiable." },
  { icon: Users, t: "Multi-role access", d: "Admin, teacher, student, sub-admin." },
  { icon: CalendarCheck, t: "Attendance", d: "Daily calendar tracking & reports." },
  { icon: MessageCircle, t: "Doubt clearing", d: "Q&A between students and teachers." },
  { icon: BookOpen, t: "Video lectures", d: "YouTube, Vimeo or self-hosted." },
  { icon: Layers, t: "Multi-course enrollment", d: "Stack as many batches as you want." },
  { icon: CreditCard, t: "Payments built-in", d: "Razorpay & PayPal supported." },
  { icon: Bell, t: "Push notifications", d: "Instant alerts on iOS & Android." },
  { icon: FileCheck, t: "Homework system", d: "Assign, submit, grade, repeat." },
  { icon: BarChart3, t: "Progress charts", d: "See exactly where you stand." },
  { icon: Languages, t: "6 languages", d: "EN, FR, AR, HI, DE, ES." },
  { icon: Smartphone, t: "Mobile apps", d: "Native Android & iOS." },
  { icon: Shield, t: "Secure & private", d: "Encrypted data, role-based access." },
  { icon: Globe, t: "Works anywhere", d: "Optimized for slow connections." },
];

function Features() {
  return (
    <>
      <section className="bg-hero-gradient py-20">
        <div className="container-tight">
          <span className="text-xs uppercase tracking-[0.25em] text-gold">Features</span>
          <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold text-cream max-w-3xl">
            Sixteen reasons to make this <span className="italic text-gold">home.</span>
          </h1>
        </div>
      </section>

      <section className="container-tight py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
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

      <section className="bg-cream py-20">
        <div className="container-tight grid md:grid-cols-2 gap-12 items-center">
          <img src={teacherOnline} alt="Teacher" loading="lazy" className="rounded-2xl shadow-elegant" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Course architecture</span>
            <h2 className="mt-3 font-display text-4xl font-bold">Organized the way you actually study.</h2>
            <pre className="mt-6 rounded-xl bg-card border border-border p-5 text-xs leading-relaxed overflow-x-auto">
{`Category (Science)
 └─ Subcategory (Physics)
     └─ Batch (Physics 101 — Jan 2026)
         ├─ Subjects (Mechanics, Optics)
         │   └─ Chapters
         │       ├─ Video lectures
         │       └─ Practice questions
         ├─ Exams (Practice + Mock)
         ├─ Books & Notes (PDF)
         ├─ Homework
         └─ Live Classes`}
            </pre>
          </div>
        </div>
      </section>

      <section className="container-tight py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Roles</span>
          <h2 className="mt-3 font-display text-4xl font-bold">Four roles, perfectly defined.</h2>
          <div className="mt-8 space-y-4">
            {[
              { r: "Super Admin", d: "Owns the platform — manages everything and everyone." },
              { r: "Sub Admin", d: "Runs their own institute within the platform." },
              { r: "Teacher", d: "Manages classes, content, exams for assigned subjects." },
              { r: "Student", d: "Learns, takes exams, attends classes, tracks progress." },
            ].map((row) => (
              <div key={row.r} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                <div className="h-10 w-1 rounded-full bg-gold-gradient" />
                <div>
                  <p className="font-semibold">{row.r}</p>
                  <p className="text-sm text-muted-foreground">{row.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <img src={books} alt="Books" loading="lazy" className="rounded-2xl shadow-elegant" />
      </section>

      <section className="bg-cream py-20">
        <div className="container-tight grid md:grid-cols-2 gap-12 items-center">
          <img src={liveClass} alt="Live class" loading="lazy" className="rounded-2xl shadow-elegant md:order-2" />
          <div className="md:order-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Payments</span>
            <h2 className="mt-3 font-display text-4xl font-bold">Free where it counts, paid where it scales.</h2>
            <p className="mt-4 text-muted-foreground">Some courses are forever free. Premium courses are priced fairly and processed securely through Razorpay or PayPal — with optional student discounts.</p>
          </div>
        </div>
      </section>
    </>
  );
}
