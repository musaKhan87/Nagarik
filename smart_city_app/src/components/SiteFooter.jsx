import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, Globe, MessageCircle, Mail, PhoneCall, ShieldCheck,
  ArrowRight, Heart, Activity, CheckCircle2, Share2, MessageSquare
} from "lucide-react";
import { Button } from "./ui/button";

export function SiteFooter() {
  return (
    <footer className="mt-28 border-t border-border/80 bg-card/60 backdrop-blur-2xl relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-40 top-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      {/* Top Emergency & Newsletter Pill Banner */}
      {/* <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-hero p-8 text-white shadow-2xl">
          <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur shadow-glow">
                <PhoneCall className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-display text-xl font-bold text-white">Emergency Municipal Helpline</h4>
                <p className="text-xs text-white/80 mt-0.5">Call 1916 (Toll-Free) for urgent water main bursts, road hazards, or electrical emergencies.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link to="/report">
                <Button size="lg" variant="secondary" className="rounded-full px-6 font-semibold shadow-elev gap-2">
                  <span>File Urgent Complaint</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Footer Links Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-hero text-white shadow-glow transition-transform group-hover:scale-105">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-display text-xl font-bold text-foreground">Nagarik</div>
                <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Smart City Grievance Portal
                </div>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              A modern civic-tech platform built for Indian smart cities. Report potholes, broken streetlights, or overflowing garbage in under 30 seconds.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground font-medium">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse inline-block" />
              <span>City Spatial Grid Active · 99.9% Uptime</span>
            </div>

            <div className="flex gap-2 pt-2">
              {[
                { icon: MessageCircle, href: "#", label: "Chat" },
                { icon: Globe, href: "https://navimumbai.gov.in", label: "Portal" },
                { icon: Mail, href: "mailto:support@smartcity.gov.in", label: "Email" },
                { icon: Share2, href: "#", label: "Share" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border/80 bg-card text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Actions */}
          <div className="sm:col-span-1 md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Quick Actions</h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm font-medium">
              <li><Link to="/report" className="text-muted-foreground hover:text-primary transition-colors">Report Issue</Link></li>
              <li><Link to="/track" className="text-muted-foreground hover:text-primary transition-colors">Track Complaint</Link></li>
              <li><Link to="/upvote" className="text-muted-foreground hover:text-primary transition-colors">Upvote Feed</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Portal</Link></li>
            </ul>
          </div>

          {/* Column 3: Departments */}
          <div className="sm:col-span-1 md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Departments</h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm font-medium">
              <li className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Roads & Infrastructure</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Sanitation & Solid Waste</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Electricity & Streetlights</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Water Supply & Drainage</li>
            </ul>
          </div>

          {/* Column 4: Portals */}
          <div className="sm:col-span-2 md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Portals & Access</h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm font-medium">
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Citizen Portal</Link></li>
              <li><Link to="/worker" className="text-muted-foreground hover:text-primary transition-colors">Field Worker App</Link></li>
              <li><Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors">Municipal Admin</Link></li>
              <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">Sign In / Register</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-border/80 bg-background/80 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-1.5 font-medium">
            <span>© {new Date().getFullYear()} Nagarik</span>
            <span>·</span>
            <span>AIKTC Dept. of Computer Engineering</span>
          </div>

          <div className="flex items-center gap-1 font-medium">
            <span>Built with care for the citizens of Navi Mumbai</span>
            <Heart className="h-3.5 w-3.5 text-destructive fill-destructive inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
