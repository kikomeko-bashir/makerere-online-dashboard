import { Target, Eye, Heart } from "lucide-react";
import heroCampus from "@/assets/hero-campus.jpg";
import graduation from "@/assets/graduation.jpg";
import studentsGroup from "@/assets/students-group.jpg";
import lab from "@/assets/lab.jpg";

export default function About() {
  return (
    <>
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={heroCampus} alt="Campus" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-gradient opacity-85" />
        <div className="relative container-tight h-full flex items-end pb-14">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-[0.25em] text-gold">About us</span>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold text-cream">
              A 100-year tradition,<br />reimagined for the cloud.
            </h1>
          </div>
        </div>
      </section>

      <section className="container-tight py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our story</span>
          <h2 className="mt-3 font-display text-4xl font-bold">Education, without the gate.</h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>Makerere Online School was born from a simple frustration: too many brilliant minds locked out of higher education by geography, cost, or circumstance.</p>
            <p>We took the best of a great university — rigorous courses, expert teachers, real exams, real certificates — and rebuilt it for the device in your pocket.</p>
            <p>Today, over 24,000 learners across Uganda, Kenya, Rwanda, Nigeria and beyond call this their school.</p>
          </div>
        </div>
        <img src={studentsGroup} alt="Students" loading="lazy" className="rounded-2xl shadow-elegant" />
      </section>

      <section className="bg-cream py-20">
        <div className="container-tight">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, t: "Mission", d: "To deliver accredited, affordable higher education to every learner on the African continent and beyond." },
              { icon: Eye, t: "Vision", d: "An Africa where a postal code never decides who gets to learn, lead, or build the future." },
              { icon: Heart, t: "Values", d: "Rigor. Empathy. Open access. We measure ourselves by the doors we open." },
            ].map((v) => (
              <div key={v.t} className="rounded-2xl bg-card border border-border p-8 shadow-soft">
                <span className="grid place-items-center h-12 w-12 rounded-xl bg-primary/10 text-primary">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold">{v.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-tight py-20 grid md:grid-cols-2 gap-12 items-center">
        <img src={lab} alt="Lab" loading="lazy" className="rounded-2xl shadow-elegant md:order-2" />
        <div className="md:order-1">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">By the numbers</span>
          <h2 className="mt-3 font-display text-4xl font-bold">Small platform. Big impact.</h2>
          <dl className="mt-8 grid grid-cols-2 gap-6">
            {[
              { k: "24,800+", v: "Active students" },
              { k: "320", v: "Courses live" },
              { k: "640", v: "Expert teachers" },
              { k: "12", v: "Countries reached" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl border border-border p-5 bg-card">
                <dt className="font-display text-3xl md:text-4xl font-bold text-primary">{s.k}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="container-tight">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Leadership</span>
            <h2 className="mt-3 font-display text-4xl font-bold">Guided by educators, built by engineers.</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { n: "Dr. Aisha Nakato", r: "Vice Chancellor" },
              { n: "Prof. David Okello", r: "Dean of Studies" },
              { n: "Sarah Mugisha", r: "Head of Engineering" },
              { n: "Eng. James Kato", r: "Director, Online Programs" },
            ].map((p) => (
              <div key={p.n} className="rounded-2xl bg-card border border-border p-6 text-center shadow-soft">
                <div className="mx-auto h-20 w-20 rounded-full bg-gold-gradient grid place-items-center font-display text-2xl font-bold text-[oklch(0.2_0.03_40)]">
                  {p.n.split(" ").map(s => s[0]).slice(0,2).join("")}
                </div>
                <h3 className="mt-4 font-semibold">{p.n}</h3>
                <p className="text-xs text-muted-foreground">{p.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-tight py-20">
        <div className="rounded-3xl overflow-hidden relative h-[340px]">
          <img src={graduation} alt="Graduation" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.16_0.02_30)]/90 to-transparent" />
          <div className="relative h-full flex items-center p-10 md:p-16">
            <div className="max-w-lg">
              <h2 className="font-display text-4xl font-bold text-cream">Pro Futuro Aedificamus.</h2>
              <p className="mt-3 text-cream/85">"We build for the future." That's not a tagline — it's a promise to every student who trusts us with their tomorrow.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
