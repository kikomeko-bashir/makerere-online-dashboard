import { Link } from "@tanstack/react-router";
import crest from "@/assets/makerere-logo.png";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="relative inline-flex h-11 w-11 items-center justify-center">
        <img
          src={crest}
          alt="Makerere University crest"
          className="h-11 w-11 object-contain drop-shadow-sm"
        />
      </span>
      <span className="flex flex-col leading-tight">
        <span className={`font-display text-base font-bold ${light ? "text-cream" : "text-foreground"}`}>
          Makerere
        </span>
        <span className={`text-[10px] uppercase tracking-[0.18em] ${light ? "text-gold" : "text-muted-foreground"}`}>
          Online School
        </span>
      </span>
    </Link>
  );
}
