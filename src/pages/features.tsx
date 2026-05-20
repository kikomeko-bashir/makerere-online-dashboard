import {
  Video, FileText, Award, CalendarCheck, MessageCircle, Globe,
  CreditCard, Bell, BookOpen, Layers, Shield, Smartphone, FileCheck, BarChart3, Languages
} from "lucide-react";
import liveClass from "@/assets/live-class.jpg";
import teacherOnline from "@/assets/teacher-online.jpg";

const features = [
  { icon: Video, t: "Live classes", d: "Zoom & Jitsi Meet — one tap to join." },
  { icon: FileText, t: "Timed exams", d: "Practice papers + scheduled mocks." },
  { icon: Award, t: "Certificates", d: "Auto-issued, shareable, verifiable." },
  { icon: CalendarCheck, t: "Attendance", d: "Daily calendar tracking & reports." },
  { icon: MessageCircle, t: "Doubt clearing", d: "Q&A between students and teachers." },
  { icon: BookOpen, t: "Video lectures", d: "YouTube, Vimeo or self-hosted." },
  { icon: Layers, t: "Multi-course enrollment", d: "Stack as many batches as you want." },
  { icon: CreditCard, t: "Payments built-in", d: "#" },
  { icon: Bell, t: "Push notifications", d: "Instant alerts on iOS & Android." },
  { icon: FileCheck, t: "Homework system", d: "Assign, submit, grade, repeat." },
  { icon: BarChart3, t: "Progress charts", d: "See exactly where you stand." },
  { icon: Languages, t: "6 languages", d: "EN, FR, AR, HI, DE, ES." },
  { icon: Smartphone, t: "Mobile apps", d: "Native Android & iOS." },
  { icon: Shield, t: "Secure & private", d: "Encrypted data." },
  { icon: Globe, t: "Works anywhere", d: "Optimized for slow connections." },
];

export default function Features() {
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
