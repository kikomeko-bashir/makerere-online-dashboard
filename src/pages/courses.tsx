import { Link } from "react-router-dom";
import { Clock, Users, Star } from "lucide-react";
import lab from "@/assets/lab.jpg";
import books from "@/assets/books.jpg";
import teacherOnline from "@/assets/teacher-online.jpg";
import studentLearning from "@/assets/student-learning.jpg";
import studentsGroup from "@/assets/students-group.jpg";
import liveClass from "@/assets/live-class.jpg";

const courses = [
  { img: lab, cat: "Science", title: "Physics 101 — Mechanics & Optics", price: "Free", duration: "12 weeks", students: 1240, rating: 4.9 },
  { img: studentLearning, cat: "Technology", title: "Introduction to Computer Science", price: "UGX 250,000", duration: "16 weeks", students: 2380, rating: 4.8 },
  { img: books, cat: "Arts", title: "African Literature in the 21st Century", price: "Free", duration: "8 weeks", students: 870, rating: 4.7 },
  { img: teacherOnline, cat: "Business", title: "Foundations of Entrepreneurship", price: "UGX 320,000", duration: "10 weeks", students: 1560, rating: 4.9 },
  { img: studentsGroup, cat: "Health", title: "Public Health & Community Care", price: "UGX 180,000", duration: "14 weeks", students: 980, rating: 4.8 },
  { img: liveClass, cat: "Technology", title: "Web Development with React", price: "UGX 420,000", duration: "20 weeks", students: 3120, rating: 4.9 },
];

const categories = ["All", "Science", "Technology", "Business", "Arts", "Health"];

export default function Courses() {
  return (
    <>
      <section className="bg-hero-gradient py-20">
        <div className="container-tight">
          <span className="text-xs uppercase tracking-[0.25em] text-gold">Catalog</span>
          <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold text-cream max-w-3xl">Find a course worthy of your ambition.</h1>
          <p className="mt-5 text-cream/80 max-w-xl">Accredited, taught by experts, and built for the devices you already own.</p>
        </div>
      </section>

      <section className="container-tight py-12">
        <div className="flex flex-wrap gap-2">
          {categories.map((c, i) => (
            <button
              key={c}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                i === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <article key={c.title} className="group rounded-2xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img src={c.img} alt={c.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
                <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider bg-gold text-[oklch(0.2_0.03_40)] px-2.5 py-1 rounded-full font-semibold">{c.cat}</span>
                <span className="absolute top-3 right-3 text-xs bg-background/95 text-foreground px-2.5 py-1 rounded-full font-semibold">{c.price}</span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold leading-snug">{c.title}</h3>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.duration}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c.students.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-foreground"><Star className="h-3.5 w-3.5 fill-gold text-gold" /> {c.rating}</span>
                </div>
                <Link to="/login" className="mt-5 inline-flex w-full justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  Enroll now
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
