import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { GraduationCap, Users, ShieldCheck, LogOut, Home } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const portals = [
  { to: "/dashboard/student", label: "Student", icon: GraduationCap },
  { to: "/dashboard/teacher", label: "Teacher", icon: Users },
  { to: "/dashboard/admin", label: "Admin", icon: ShieldCheck },
] as const;

function DashboardLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="bg-muted/40 min-h-[calc(100vh-4rem)]">
      <div className="border-b border-border bg-card">
        <div className="container-tight flex items-center justify-between h-14">
          <div className="flex items-center gap-1 overflow-x-auto">
            {portals.map((p) => {
              const active = path.startsWith(p.to);
              return (
                <Link
                  key={p.to}
                  to={p.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <p.icon className="h-4 w-4" /> {p.label}
                </Link>
              );
            })}
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" /> Public site
            </Link>
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Link>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
