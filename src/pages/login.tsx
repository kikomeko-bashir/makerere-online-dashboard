import { Link } from "react-router-dom";
import heroCampus from "@/assets/hero-campus.jpg";

export default function Login() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={heroCampus} alt="Campus" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-gradient opacity-85" />
        <div className="relative h-full flex items-end p-12">
          <div className="max-w-md text-cream">
            <p className="font-display italic text-gold text-sm">Pro Futuro Aedificamus</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight">Welcome back to your university — wherever you are.</h2>
            <p className="mt-4 text-cream/80">Sign in to continue lectures, check your grades, or start a live class.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to continue. Your role will be detected automatically.</p>

          <form
            onSubmit={(e) => { e.preventDefault(); alert("(Demo) signing in — role auto-detected from account."); }}
            className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
          >
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input required type="email" className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Password</span>
              <input required type="password" className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Remember me</label>
              <a href="#" className="text-primary hover:underline">Forgot password?</a>
            </div>
            <button className="w-full rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-soft">
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New student?{" "}
            <Link to="/get-started" className="text-primary font-semibold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
