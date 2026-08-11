import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight, Camera, MapPin, Bell, ShieldCheck, Zap, TrendingUp, Users,
  CheckCircle2, Sparkles, Activity
} from "lucide-react";
import { Button } from "../components/ui/button";

const STATS = [
  { k: "12,480", v: "Issues resolved" },
  { k: "< 5 min", v: "Avg. assignment" },
  { k: "83%", v: "SLA on-time" },
  { k: "4.6 / 5", v: "Citizen rating" },
];

const CATEGORIES = [
  { emoji: "🕳️", name: "Potholes & Roads", group: "Infrastructure", desc: "Damage, cracks, open manholes", sla: "24h SLA", stat: "482 resolved 30d", color: "from-amber-500/20 via-amber-500/5 to-transparent", ring: "border-amber-500/40 text-amber-500", glow: "hover:border-amber-500/50 hover:shadow-amber-500/10" },
  { emoji: "🗑️", name: "Garbage & Waste", group: "Sanitation", desc: "Overflowing bins, uncollected trash", sla: "12h SLA", stat: "612 resolved 30d", color: "from-emerald-500/20 via-emerald-500/5 to-transparent", ring: "border-emerald-500/40 text-emerald-500", glow: "hover:border-emerald-500/50 hover:shadow-emerald-500/10" },
  { emoji: "💡", name: "Streetlights", group: "Utilities", desc: "Dark streets, broken fixtures", sla: "18h SLA", stat: "310 resolved 30d", color: "from-yellow-500/20 via-yellow-500/5 to-transparent", ring: "border-yellow-500/40 text-yellow-500", glow: "hover:border-yellow-500/50 hover:shadow-yellow-500/10" },
  { emoji: "🚰", name: "Water Supply", group: "Utilities", desc: "Leaks, contamination, low pressure", sla: "8h SLA", stat: "240 resolved 30d", color: "from-sky-500/20 via-sky-500/5 to-transparent", ring: "border-sky-500/40 text-sky-500", glow: "hover:border-sky-500/50 hover:shadow-sky-500/10" },
  { emoji: "🚧", name: "Footpaths & Signals", group: "Infrastructure", desc: "Broken pavements, traffic lights", sla: "24h SLA", stat: "194 resolved 30d", color: "from-orange-500/20 via-orange-500/5 to-transparent", ring: "border-orange-500/40 text-orange-500", glow: "hover:border-orange-500/50 hover:shadow-orange-500/10" },
  { emoji: "🌳", name: "Parks & Trees", group: "Environment", desc: "Fallen branches, unkempt parks", sla: "48h SLA", stat: "128 resolved 30d", color: "from-lime-500/20 via-lime-500/5 to-transparent", ring: "border-lime-500/40 text-lime-500", glow: "hover:border-lime-500/50 hover:shadow-lime-500/10" },
  { emoji: "🚦", name: "Traffic & Parking", group: "Safety", desc: "Illegal parking, sign damage", sla: "6h SLA", stat: "340 resolved 30d", color: "from-red-500/20 via-red-500/5 to-transparent", ring: "border-red-500/40 text-red-500", glow: "hover:border-red-500/50 hover:shadow-red-500/10" },
  { emoji: "🏥", name: "Sanitation & Drains", group: "Sanitation", desc: "Open drains, sewage overflow", sla: "12h SLA", stat: "510 resolved 30d", color: "from-teal-500/20 via-teal-500/5 to-transparent", ring: "border-teal-500/40 text-teal-500", glow: "hover:border-teal-500/50 hover:shadow-teal-500/10" },
];

export function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");

  const GROUPS = ["All", "Infrastructure", "Sanitation", "Utilities", "Safety", "Environment"];

  const filteredCategories = CATEGORIES.filter(c => activeTab === "All" ? true : c.group === activeTab);

  return (
    <div className="bg-background text-foreground min-h-screen">
    

      {/* HERO */}
      <section className="relative overflow-hidden">
         {/* Hero Background Image & Gradient Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img 
            src="/hero-bg.png" 
            alt="Smart City Grid" 
            className="h-full w-full object-cover object-center opacity-20 dark:opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        </div>
        <div className="absolute inset-0 grid-lines opacity-40 pointer-events-none" />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:pt-28">
          <div className="flex flex-col lg:grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-12 items-center text-center lg:text-left">
            <div className="flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
                AI-powered · SLA-tracked · Built for Navi Mumbai
              </div>
              <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground">
                Your city,
                <br />
                <span className="italic text-primary">answerable.</span>
              </h1>
              <p className="mt-4 sm:mt-6 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground">
                Report a pothole, an overflowing bin or a dead streetlight in under a minute.
                Nagarik routes it to the right department, tracks the SLA, and keeps you posted
                until it's fixed.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
                <Button onClick={() => navigate('/report')} size="lg" className="rounded-full w-full sm:w-auto py-6 sm:py-3.5 px-8 text-sm font-bold shadow-elev">
                  Report an issue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={() => navigate('/track')} size="lg" variant="outline" className="rounded-full w-full sm:w-auto py-6 sm:py-3.5 px-8 text-sm font-bold">
                  Track a complaint
                </Button>
              </div>
              <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-lg w-full mx-auto lg:mx-0">
                {STATS.map((s) => (
                  <div key={s.v} className="bg-card/50 p-3 sm:p-3.5 rounded-2xl border border-border/60 shadow-sm text-center">
                    <div className="font-display text-xl sm:text-2xl font-extrabold text-foreground">{s.k}</div>
                    <div className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground font-medium">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone / preview mock (Visible on Desktop >= 1024px) */}
            <div className="hidden lg:block relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="animate-float relative rounded-[2rem] border border-border bg-card p-2 shadow-glow">
                <div className="rounded-[1.65rem] bg-hero p-6 text-white">
                  <div className="flex items-center justify-between text-xs opacity-90">
                    <span>Complaint #NGRK-8421</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5">In progress</span>
                  </div>
                  <div className="mt-6 font-display text-2xl">Pothole on Palm Beach Rd.</div>
                  <div className="mt-1 text-sm opacity-80">Sector 15, Vashi · 320m from you</div>
                  <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-white/10 p-3">
                      <div className="text-lg font-semibold">HIGH</div>
                      <div className="opacity-70">Severity</div>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <div className="text-lg font-semibold">2h</div>
                      <div className="opacity-70">Assigned in</div>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <div className="text-lg font-semibold">18</div>
                      <div className="opacity-70">Upvotes</div>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Timeline</div>
                  <ol className="mt-3 space-y-3 text-sm">
                    {[
                      { t: "Reported by citizen", d: "09:12 AM", done: true },
                      { t: "Routed to Roads Dept.", d: "09:14 AM", done: true },
                      { t: "Worker assigned", d: "11:02 AM", done: true },
                      { t: "Resolution pending", d: "ETA 4h", done: false },
                    ].map((e, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${e.done ? "bg-primary" : "bg-border"}`} />
                        <span className={e.done ? "text-foreground" : "text-muted-foreground"}>{e.t}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{e.d}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 rotate-[-6deg] bg-card text-card-foreground rounded-2xl border border-border p-4 shadow-elev">
                <div className="text-xs text-muted-foreground">AI classified</div>
                <div className="mt-1 font-display text-lg text-foreground">🕳️ Pothole · 92%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-20 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground mb-3">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Instant AI Auto-Routing & Live SLA Monitoring</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl text-foreground">Almost anything that breaks the city.</h2>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xl">
              Select a category to report a civic grievance. Our vision AI auto-classifies your upload and routes directly to field teams.
            </p>
          </div>
          <Button onClick={() => navigate('/report')} variant="outline" className="rounded-full gap-2 shrink-0 hidden sm:inline-flex">
            Report an issue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Segmented Category Filter Grid (Mobile Symmetrical 3x2 Grid) */}
        <div className="mt-5 grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1.5 shadow-sm sm:hidden">
          {[
            { id: "All", label: "All" },
            { id: "Infrastructure", label: "Infra" },
            { id: "Sanitation", label: "Sanitation" },
            { id: "Utilities", label: "Utilities" },
            { id: "Safety", label: "Safety" },
            { id: "Environment", label: "Enviro" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`rounded-xl py-2 text-center text-xs font-bold transition-all ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Desktop & Tablet Filter Pills (Visible on Tablet & Desktop) */}
        <div className="mt-6 hidden sm:flex flex-wrap items-center gap-2">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveTab(g)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                activeTab === g
                  ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                  : "border border-border/80 bg-card/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {g === "All" ? "All Categories" : g}
            </button>
          ))}
        </div>

        {/* Categories Grid (2 Columns on Mobile for Compact Layout!) */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filteredCategories.map((c) => (
            <div
              key={c.name}
              onClick={() => navigate('/report')}
              className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card/80 p-4 sm:p-6 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-sm ${c.glow} flex flex-col justify-between`}
            >
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${c.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
              
              <div>
                <div className="flex items-center justify-between">
                  <div className={`grid h-10 w-10 sm:h-14 sm:w-14 place-items-center rounded-xl sm:rounded-2xl bg-card/90 border ${c.ring} text-2xl sm:text-3xl shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                    {c.emoji}
                  </div>
                  <span className="rounded-full border border-border bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {c.sla}
                  </span>
                </div>

                <h3 className="mt-3 sm:mt-5 font-display text-sm sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {c.name}
                </h3>
                <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {c.desc}
                </p>
              </div>

              <div>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-success inline-block shrink-0" />
                  <span className="truncate">{c.stat}</span>
                </div>

                <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-primary">
                  <span>Report</span>
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - CONNECTED CAPSULE ROADMAP FLOW */}
      <section className="bg-surface py-10 sm:py-24 border-y border-border/80 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl mb-8 sm:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs text-primary font-semibold shadow-sm mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>3-Step Resolution Pipeline</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
              Three taps between a broken thing<br className="hidden sm:inline" /> and someone accountable.
            </h2>
          </div>

          {/* Organic Flow Ribbon */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3 relative">
            
            {/* Step 01 */}
            <div className="group relative overflow-hidden rounded-3xl sm:rounded-[3rem] sm:rounded-tr-none border border-border/90 bg-card p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-primary/50 flex flex-col justify-between">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-80" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 sm:h-16 sm:w-16 place-items-center rounded-full bg-hero text-white font-display text-lg sm:text-xl font-bold shadow-glow group-hover:scale-105 transition-transform">
                    01
                  </div>
                  <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>

                <h3 className="mt-5 sm:mt-8 font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Snap it
                </h3>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Open camera & capture the issue. Our AI vision detects category & severity instantly.
                </p>
              </div>

              <div className="mt-6 sm:mt-8 pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-primary">
                  AI Auto-Classify
                </span>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Step 02 */}
            <div className="group relative overflow-hidden rounded-3xl sm:rounded-[3rem] sm:rounded-bl-none border border-border/90 bg-card p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-accent/50 flex flex-col justify-between">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent opacity-80" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 sm:h-16 sm:w-16 place-items-center rounded-full bg-hero text-white font-display text-lg sm:text-xl font-bold shadow-glow group-hover:scale-105 transition-transform">
                    02
                  </div>
                  <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-accent/10 text-accent border border-accent/20">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>

                <h3 className="mt-5 sm:mt-8 font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                  Pin it
                </h3>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Device GPS automatically locks coordinates onto our GIS city spatial grid.
                </p>
              </div>

              <div className="mt-6 sm:mt-8 pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-accent">
                  GIS Spatial Lock
                </span>
                <ArrowRight className="h-4 w-4 text-accent group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Step 03 */}
            <div className="group relative overflow-hidden rounded-3xl sm:rounded-[3rem] sm:rounded-tl-none border border-border/90 bg-card p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-emerald-500/50 flex flex-col justify-between">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent opacity-80" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 sm:h-16 sm:w-16 place-items-center rounded-full bg-hero text-white font-display text-lg sm:text-xl font-bold shadow-glow group-hover:scale-105 transition-transform">
                    03
                  </div>
                  <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>

                <h3 className="mt-5 sm:mt-8 font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                  Track & Resolve
                </h3>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Receive live SMS & push status updates from Pending to Worker Resolved.
                </p>
              </div>

              <div className="mt-6 sm:mt-8 pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-500">
                  SLA Guaranteed
                </span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* UNDER THE HOOD (Visible on Tablet & Desktop) */}
      <section className="hidden sm:block mx-auto max-w-7xl px-4 py-10 sm:py-24 sm:px-6">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3.5 py-1 text-xs text-primary font-semibold shadow-sm mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Civic Tech Infrastructure</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
            A serious tool, wearing a friendly face.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Engineered with computer vision models, GIS spatial telemetry, and automated SLA escalation pipelines.
          </p>
        </div>

        <div className="space-y-6">
          
          <div className="group relative overflow-hidden rounded-[3.5rem] border border-border/90 bg-card p-8 sm:p-10 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-primary/40">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-amber-500/15 via-primary/10 to-transparent opacity-80" />
            <div className="grid gap-6 md:grid-cols-12 items-center">
              <div className="md:col-span-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-500 mb-4">
                  <Zap className="h-3.5 w-3.5" /> Computer Vision Engine
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  AI Severity & Auto-Categorization
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                  Claude Vision parses uploaded photos in milliseconds, automatically assigning severity ranks (Critical, High, Medium, Low) and routing to department queues.
                </p>
              </div>

              <div className="md:col-span-4 rounded-3xl border border-border bg-surface p-5 text-center">
                <div className="text-xs font-mono text-muted-foreground">Detection Accuracy</div>
                <div className="mt-1 font-display text-3xl font-extrabold text-amber-500">98.4%</div>
                <div className="mt-2 w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full w-[98%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            
            <div className="group relative overflow-hidden rounded-[3rem] rounded-br-none border border-border/90 bg-card p-8 shadow-2xl transition-all duration-300 hover:border-emerald-500/40">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent opacity-80" />
              <div className="flex items-center justify-between mb-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-500">
                  Anti-Spam Filter
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Fake Image Guard</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Selfies, memes, and duplicate photos are rejected before reaching municipal worker queues.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-[3rem] rounded-tl-none border border-border/90 bg-card p-8 shadow-2xl transition-all duration-300 hover:border-sky-500/40">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-transparent opacity-80" />
              <div className="flex items-center justify-between mb-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500/15 text-sky-500 border border-sky-500/30">
                  <Users className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-bold text-sky-500">
                  Civic Signal
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Community Upvoting</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Nearby citizens co-sign complaints. Higher upvote density dynamically boosts urgency in worker rosters.
              </p>
            </div>

          </div>

          <div className="group relative overflow-hidden rounded-full border border-border/90 bg-card p-6 px-8 sm:px-12 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-purple-500/15 text-purple-500 border border-purple-500/30">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-foreground">SLA Resolution Engine</h4>
                <p className="text-xs text-muted-foreground">Automated alert escalations directly to municipal department heads before any SLA breach.</p>
              </div>
            </div>

            <div className="rounded-full bg-purple-500/15 px-4 py-1.5 text-xs font-bold text-purple-400 shrink-0">
              83% On-Time SLA Guarantee
            </div>
          </div>

        </div>
      </section>

      {/* CTA SECTION (Compact & Beautifully Styled on Desktop) */}
      <section className="hidden sm:block mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-8 sm:p-10 lg:p-12 text-white shadow-2xl border border-emerald-500/30">
          {/* Subtle Background Glows */}
          <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/25 blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur mb-3 border border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Navi Mumbai Civic Resolution Grid</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
                Your street. Your voice.<br />
                <span className="italic text-amber-300">Your city, listening.</span>
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                Join thousands of citizens reshaping Navi Mumbai. Automated AI dispatch, instant SMS updates, and zero friction.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Button onClick={() => navigate('/report')} size="lg" className="rounded-full px-6 py-5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg gap-2">
                <span>File Report</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button onClick={() => navigate('/about')} size="lg" variant="outline" className="rounded-full border-white/20 bg-white/10 px-6 py-5 text-xs font-bold text-white hover:bg-white/20 backdrop-blur">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
