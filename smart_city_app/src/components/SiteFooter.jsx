import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, Globe, MessageCircle, Mail, PhoneCall, ShieldCheck,
  ArrowRight, Heart, Activity, CheckCircle2, Share2, MessageSquare
} from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 sm:mt-28 border-t border-border/80 bg-card/70 backdrop-blur-2xl relative overflow-hidden text-foreground">
      {/* Background Decorative Orbs */}
      <div className="absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-40 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6">
        
        {/* Mobile-First Grid: Brand Column + 2-Column Links Grid on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand & Mission Column */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-hero text-white shadow-glow transition-transform group-hover:scale-105">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-display text-xl font-bold text-foreground block leading-tight">Nagarik</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Smart City Grievance Portal
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              A modern civic-tech platform for smart cities. Report potholes, broken streetlights, or sanitation issues in under 30 seconds with automated AI dispatch and SLA tracking.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-muted-foreground font-semibold">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse inline-block" />
                <span>Spatial Grid Active · 99.9% Uptime</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {[
                { icon: MessageCircle, href: "#", label: "Chat Support" },
                { icon: Globe, href: "https://navimumbai.gov.in", label: "Government Portal" },
                { icon: Mail, href: "mailto:support@smartcity.gov.in", label: "Email" },
                { icon: Share2, href: "#", label: "Share" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid: 2 Columns on Mobile, 3 Columns on Tablet/Desktop */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/60">
            
            {/* Column 1: Quick Actions */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.18em] text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-xs sm:text-sm font-medium">
                <li><Link to="/report" className="text-muted-foreground hover:text-primary transition-colors">Report Issue</Link></li>
                <li><Link to="/track" className="text-muted-foreground hover:text-primary transition-colors">Track Status</Link></li>
                <li><Link to="/upvote" className="text-muted-foreground hover:text-primary transition-colors">Upvote Feed</Link></li>
                <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Portal</Link></li>
              </ul>
            </div>

            {/* Column 2: Departments */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.18em] text-foreground">Departments</h4>
              <ul className="space-y-2 text-xs sm:text-sm font-medium">
                <li className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Roads & Infra</li>
                <li className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Sanitation & Waste</li>
                <li className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Electricity & Lights</li>
                <li className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Water & Drains</li>
              </ul>
            </div>

            {/* Column 3: Portals & Access */}
            <div className="col-span-2 sm:col-span-1 space-y-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.18em] text-foreground">Portals</h4>
              <ul className="space-y-2 text-xs sm:text-sm font-medium">
                <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Citizen Dashboard</Link></li>
                <li><Link to="/worker" className="text-muted-foreground hover:text-primary transition-colors">Field Worker App</Link></li>
                <li><Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors">Municipal Admin</Link></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">Sign In / Register</Link></li>
              </ul>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-border/70 bg-background/90 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2.5 px-4 text-[11px] sm:text-xs text-muted-foreground text-center sm:flex-row sm:text-left sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-1.5 font-medium">
            <span>© {new Date().getFullYear()} Nagarik</span>
            <span>·</span>
            <span>AIKTC Dept. of Computer Engineering</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 font-medium">
            <span>Built for the citizens of Navi Mumbai</span>
            <Heart className="h-3.5 w-3.5 text-destructive fill-destructive inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
