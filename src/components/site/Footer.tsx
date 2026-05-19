import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[oklch(0.16_0.02_30)] text-cream mt-24">
      <div className="container-tight py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm text-cream/70 leading-relaxed">
            Building Africa's future through accessible, world-class online education.
          </p>
          <div className="mt-5 flex gap-3">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 grid place-items-center rounded-full bg-white/5 hover:bg-gold hover:text-[oklch(0.2_0.03_40)] transition">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gold uppercase tracking-wider">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            <li><Link to="/about" className="hover:text-gold">About us</Link></li>
            <li><Link to="/courses" className="hover:text-gold">Courses</Link></li>
            <li><Link to="/features" className="hover:text-gold">Features</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gold uppercase tracking-wider">For You</h4>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            <li><Link to="/login" className="hover:text-gold">Student portal</Link></li>
            <li><Link to="/login" className="hover:text-gold">Teacher portal</Link></li>
            <li><Link to="/login" className="hover:text-gold">Admin dashboard</Link></li>
            <li><Link to="/login" className="hover:text-gold">Apply now</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gold uppercase tracking-wider">Reach us</h4>
          <ul className="mt-4 space-y-3 text-sm text-cream/80">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-gold" /><span>Kampala, Uganda</span></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 text-gold" /><span>hello@makerere-online.ac.ug</span></li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-gold" /><span>+256 700 000 000</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-tight py-5 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-cream/60">
          <p>© {new Date().getFullYear()} Makerere Online School. All rights reserved.</p>
          <p className="font-display italic text-gold">Pro Futuro Aedificamus — We build for the future</p>
        </div>
      </div>
    </footer>
  );
}
