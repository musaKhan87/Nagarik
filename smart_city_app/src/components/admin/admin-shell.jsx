import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MapPin, Users, AlertTriangle, TrendingUp, Settings2,
  Sparkles, Bell, Search, Palette, Sun, Moon, Menu, ShieldCheck, ChevronsUpDown, LogOut,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme, PALETTES } from "@/lib/theme";
import { useAdminRole, ROLE_META } from "@/lib/admin-role";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/admin",            label: "Overview",   icon: LayoutDashboard, perm: "admin.overview" },
  { to: "/admin/complaints", label: "Complaints", icon: AlertTriangle,   perm: "admin.complaints" },
  { to: "/admin/heatmap",    label: "Heatmap",    icon: MapPin,          perm: "admin.heatmap" },
  { to: "/admin/workers",    label: "Workers",    icon: Users,           perm: "admin.workers" },
  { to: "/admin/analytics",  label: "Analytics",  icon: TrendingUp,      perm: "admin.analytics" },
  { to: "/admin/settings",   label: "Settings",   icon: Settings2,       perm: "admin.settings" },
];

function SidebarNav({ onNavigate }) {
  const { role, can } = useAdminRole();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="flex h-full flex-col bg-card">
      <Link to="/" onClick={onNavigate} className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-6">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-hero text-white shadow-glow">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="font-display text-lg text-foreground font-semibold">Nagarik</div>
        <span className="ml-auto rounded-full bg-accent/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent-foreground font-bold">Admin</span>
      </Link>

      <nav className="flex-1 overflow-y-auto p-3">
        {NAV.map((n) => {
          const allowed = can(n.perm);
          if (!allowed) return null;
          const active = n.to === "/admin" ? path === "/admin" : path.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-elev"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-hero font-display text-sm text-white font-bold shrink-0">
            {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "SA"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">{currentUser?.name || "Super Admin"}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {currentUser?.role === 'super_admin' ? 'Super Admin' : currentUser?.role === 'dept_admin' ? 'Municipal Admin' : 'Admin'}
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminTopbar({ onOpenNav }) {
  const { mode, palette, setMode, setPalette } = useTheme();
  const { role } = useAdminRole();
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur sm:px-6">
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden"
        aria-label="Open menu"
        onClick={onOpenNav}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search complaints, wards, workers…" className="pl-9" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setMode(mode === "dark" ? "light" : "dark")} aria-label="Toggle mode">
          {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Sheet open={themeOpen} onOpenChange={setThemeOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Theme</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[380px] sm:max-w-[400px]">
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">Customize theme</SheetTitle>
              <p className="text-sm text-muted-foreground">Change the entire portal look in one click.</p>
            </SheetHeader>

            <div className="mt-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Mode</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {["light", "dark"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-sm transition ${mode === m ? "border-primary bg-primary/10 text-foreground" : "border-border hover:bg-secondary text-foreground"}`}
                  >
                    {m === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span className="capitalize">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Palette</div>
              <div className="mt-3 space-y-3">
                {PALETTES.map((p) => {
                  const active = palette === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPalette(p.id)}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary/5 shadow-elev" : "border-border hover:bg-secondary"}`}
                    >
                      <div className="flex -space-x-2">
                        {p.swatch.map((s, i) => (
                          <div key={i} className="h-8 w-8 rounded-full border-2 border-background" style={{ backgroundColor: s }} />
                        ))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.tagline}</div>
                      </div>
                      {active && <div className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">Active</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-hero text-sm font-medium text-primary-foreground">
          {ROLE_META[role].short}
        </div>
      </div>
    </header>
  );
}

export function AdminShell({ children }) {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-surface lg:block">
          <SidebarNav />
        </aside>

        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetContent side="left" className="w-72 border-r border-border bg-surface p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin navigation</SheetTitle>
            </SheetHeader>
            <SidebarNav onNavigate={() => setNavOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">
          <AdminTopbar onOpenNav={() => setNavOpen(true)} />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function AccessDenied({ perm }) {
  const { role } = useAdminRole();
  return (
    <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-border bg-card p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h2 className="mt-4 font-display text-2xl text-foreground">Access denied</h2>
      <p className="mt-2 text-sm text-muted-foreground">You do not have permission to perform this action.</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Current role: <span className="font-medium text-foreground">{ROLE_META[role].name}</span> · required: <code>{perm}</code>
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/admin">Back to overview</Link>
      </Button>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</div>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
