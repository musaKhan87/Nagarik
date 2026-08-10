import React from "react";
import { Target, Users, HeartHandshake, Building2 } from "lucide-react";

export function About() {
  return (
    <div>
      <section className="relative overflow-hidden bg-warm">
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Our story</div>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
            Built by students, <br /><span className="italic text-primary">for a better city.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Nagarik started as an academic project inside AIKTC's Department of Computer Engineering.
            It's grown into a working prototype we hope every Indian smart city can adopt.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-4xl">The problem, simply.</h2>
            <p className="mt-4 text-muted-foreground">
              A pothole appears. A streetlight dies. Garbage overflows. In most Indian cities,
              a citizen has no reliable way to report it — and no way to know if anyone will
              act. Complaints made by phone or in person disappear into bureaucratic queues.
              Trust erodes. Infrastructure decays.
            </p>
            <p className="mt-4 text-muted-foreground">
              Nagarik is our attempt to fix that feedback loop — with a phone, a photo, and
              a promise of accountability.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8 shadow-elev">
            <blockquote className="font-display text-2xl leading-snug">
              "Every complaint is a citizen extending their hand.
              Nagarik makes sure someone takes it."
            </blockquote>
            <div className="mt-6 text-sm text-muted-foreground">— Project ethos</div>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <h2 className="font-display text-4xl">What we believe.</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              { i: Target, t: "Accountability over noise", d: "SLA deadlines, escalations, proof-of-resolution. Not just a submit button." },
              { i: Users, t: "Citizens are experts", d: "Nobody knows a street like the people who live on it. We amplify their voice." },
              { i: HeartHandshake, t: "Transparent by default", d: "Every complaint's status is public. Every worker's work is visible." },
              { i: Building2, t: "Built for scale", d: "Ward-level today, city-wide tomorrow, multi-city eventually." },
            ].map((v) => (
              <div key={v.t} className="rounded-2xl border border-border bg-card p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
                  <v.i className="h-5 w-5" />
                </div>
                <div className="mt-4 font-display text-xl">{v.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">The team</div>
        <h2 className="mt-2 font-display text-4xl">Made at AIKTC.</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "Aariz Khan", r: "Product & AI" },
            { n: "Sana Sheikh", r: "Frontend" },
            { n: "Rehan Ansari", r: "Backend" },
            { n: "Prof. Tabrez Khan", r: "Faculty Mentor" },
          ].map((m, i) => (
            <div key={m.n} className="rounded-2xl border border-border bg-card p-6">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-hero font-display text-2xl text-primary-foreground">
                {m.n[0]}
              </div>
              <div className="mt-4 font-display text-lg">{m.n}</div>
              <div className="text-sm text-muted-foreground">{m.r}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
