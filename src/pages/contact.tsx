import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <>
      <section className="bg-hero-gradient py-20">
        <div className="container-tight">
          <span className="text-xs uppercase tracking-[0.25em] text-gold">Contact</span>
          <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold text-cream max-w-3xl">We'd love to hear from you.</h1>
          <p className="mt-5 text-cream/80 max-w-xl">Questions about a course, partnerships, or technical support — we usually reply within a day.</p>
        </div>
      </section>

      <section className="container-tight py-20 grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2 space-y-5">
          {[
            { icon: MapPin, t: "Campus", v: "Makerere Hill, Kampala, Uganda" },
            { icon: Mail, t: "Email", v: "hello@makerere-online.ac.ug" },
            { icon: Phone, t: "Phone", v: "+256 700 000 000" },
            { icon: Clock, t: "Hours", v: "Mon–Fri · 8:00 — 18:00 EAT" },
          ].map((c) => (
            <div key={c.t} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <span className="grid place-items-center h-11 w-11 rounded-lg bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.t}</p>
                <p className="font-semibold mt-0.5">{c.v}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          className="md:col-span-3 rounded-2xl border border-border bg-card p-8 shadow-soft space-y-5"
          onSubmit={(e) => { e.preventDefault(); alert("Thanks — we'll be in touch shortly."); }}
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-sm font-medium">Full name</span>
              <input required className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input required type="email" className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium">Subject</span>
            <input className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Message</span>
            <textarea required rows={5} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
          </label>
          <button className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-soft">
            Send message
          </button>
        </form>
      </section>
    </>
  );
}
