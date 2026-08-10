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
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 md:pt-32">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
                AI-powered · SLA-tracked · Built for Navi Mumbai
              </div>
              <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-7xl text-foreground">
                Your city,
                <br />
                <span className="italic text-primary">answerable.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Report a pothole, an overflowing bin or a dead streetlight in under a minute.
                Nagarik routes it to the right department, tracks the SLA, and keeps you posted
                until it's fixed.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={() => navigate('/report')} size="lg" className="rounded-full">
                  Report an issue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button onClick={() => navigate('/track')} size="lg" variant="outline" className="rounded-full">
                  Track a complaint
                </Button>
              </div>
              <div className="mt-10 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4">
                {STATS.map((s) => (
                  <div key={s.v}>
                    <div className="font-display text-2xl font-semibold text-foreground">{s.k}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Phone / preview mock */}
            <div className="relative mx-auto w-full max-w-md">
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
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground mb-3">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Instant AI Auto-Routing & Live SLA Monitoring</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground">Almost anything that breaks the city.</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Select a category to report a civic grievance. Our vision AI auto-classifies your upload and routes directly to field teams.
            </p>
          </div>
          <Button onClick={() => navigate('/report')} variant="outline" className="rounded-full gap-2 shrink-0">
            Report an issue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="mt-8 flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveTab(g)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                activeTab === g
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "border border-border bg-card/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {g === "All" ? "All Categories" : g}
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredCategories.map((c) => (
            <div
              key={c.name}
              onClick={() => navigate('/report')}
              className={`group relative overflow-hidden rounded-3xl border border-border/80 bg-card/80 p-6 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-elev ${c.glow} flex flex-col justify-between`}
            >
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${c.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
              
              <div>
                <div className="flex items-center justify-between">
                  <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-card/90 border ${c.ring} text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {c.emoji}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full border border-border bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {c.sla}
                    </span>
                  </div>
                </div>

                <h3 className="mt-5 font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {c.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {c.desc}
                </p>
              </div>

              <div>
                <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
                  <span>{c.stat}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-medium text-primary">
                  <span>File complaint</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - CONNECTED CAPSULE ROADMAP FLOW (NO SQUARE BOXES) */}
      <section className="bg-surface py-28 border-y border-border/80 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs text-primary font-semibold shadow-sm mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>3-Step Resolution Pipeline</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
              Three taps between a broken thing<br className="hidden sm:inline" /> and someone accountable.
            </h2>
          </div>

          {/* Organic Flow Ribbon */}
          <div className="grid gap-6 md:grid-cols-3 relative">
            
            {/* Step 01: Curved Asymmetrical Pill */}
            <div className="group relative overflow-hidden rounded-[3rem] rounded-tr-none border border-border/90 bg-card p-8 shadow-2xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 flex flex-col justify-between">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-80" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-hero text-white font-display text-xl font-bold shadow-glow group-hover:scale-105 transition-transform">
                    01
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Camera className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="mt-8 font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Snap it
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Open camera & capture the issue. Our AI vision detects category & severity instantly.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold text-primary">
                  AI Auto-Classify
                </span>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Step 02: Reverse Asymmetrical Pill */}
            <div className="group relative overflow-hidden rounded-[3rem] rounded-bl-none border border-border/90 bg-card p-8 shadow-2xl transition-all duration-300 hover:border-accent/50 hover:-translate-y-2 flex flex-col justify-between">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent opacity-80" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-hero text-white font-display text-xl font-bold shadow-glow group-hover:scale-105 transition-transform">
                    02
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent border border-accent/20">
                    <MapPin className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="mt-8 font-display text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                  Pin it
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Device GPS automatically locks coordinates onto our GIS city spatial grid.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="rounded-full bg-accent/15 px-3 py-1 text-[11px] font-bold text-accent">
                  GIS Spatial Lock
                </span>
                <ArrowRight className="h-4 w-4 text-accent group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Step 03: Full Pill Capsule */}
            <div className="group relative overflow-hidden rounded-[3rem] rounded-tl-none border border-border/90 bg-card p-8 shadow-2xl transition-all duration-300 hover:border-emerald-500/50 hover:-translate-y-2 flex flex-col justify-between">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent opacity-80" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-hero text-white font-display text-xl font-bold shadow-glow group-hover:scale-105 transition-transform">
                    03
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Bell className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="mt-8 font-display text-2xl font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                  Track & Resolve
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Receive live SMS & push status updates from Pending to Worker Resolved.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-500">
                  SLA Guaranteed
                </span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* UNDER THE HOOD - ASYMMETRICAL CAPSULE & PILL CLUSTER (NO SQUARE BOXES) */}
      <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[3rem] bg-hero p-10 text-white sm:p-16">
          <div className="absolute inset-0 grid-lines opacity-20" />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <h3 className="font-display text-4xl leading-tight sm:text-5xl">
                Your street. Your voice.<br /> Your city, listening.
              </h3>
              <p className="mt-4 max-w-lg text-white/80">
                Join thousands of citizens already reshaping Navi Mumbai — one complaint at a time.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button onClick={() => navigate('/report')} size="lg" variant="secondary" className="rounded-full">
                Get started
              </Button>
              <Button onClick={() => navigate('/about')} size="lg" variant="outline" className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20">
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
