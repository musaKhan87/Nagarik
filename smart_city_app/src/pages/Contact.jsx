import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function Contact() {
  return (
    <div>
      <section className="relative overflow-hidden bg-warm">
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-28">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Get in touch</div>
          <h1 className="mt-3 font-display text-5xl sm:text-6xl md:text-7xl">Talk to us.</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Questions, partnerships, or feedback — drop us a line and we'll get back within 24 hours.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            {[
              { i: Mail, t: "Email", d: "hello@nagarik.city", s: "For all general enquiries" },
              { i: Phone, t: "Phone", d: "+91 22 2745 0000", s: "Mon–Fri, 10am–6pm IST" },
              { i: MapPin, t: "Campus", d: "AIKTC, New Panvel, Navi Mumbai 410206", s: "Dept. of Computer Engineering" },
              { i: Clock, t: "Response time", d: "Within 24 hours", s: "Even on weekends, usually" },
            ].map((c) => (
              <div key={c.t} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <c.i className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.t}</div>
                  <div className="mt-1 font-medium">{c.d}</div>
                  <div className="text-sm text-muted-foreground">{c.s}</div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message sent!", { description: "We'll get back to you within 24 hours." });
              e.target.reset();
            }}
            className="rounded-3xl border border-border bg-card p-8 shadow-elev"
          >
            <h2 className="font-display text-3xl">Send a message</h2>
            <p className="mt-1 text-sm text-muted-foreground">We read every one.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fn">First name</Label>
                <Input id="fn" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="ln">Last name</Label>
                <Input id="ln" required className="mt-1.5" />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="em">Email</Label>
              <Input id="em" type="email" required className="mt-1.5" />
            </div>
            <div className="mt-4">
              <Label htmlFor="sub">Subject</Label>
              <Input id="sub" required className="mt-1.5" />
            </div>
            <div className="mt-4">
              <Label htmlFor="msg">Message</Label>
              <Textarea id="msg" rows={5} required className="mt-1.5" />
            </div>
            <Button type="submit" size="lg" className="mt-6 w-full rounded-full">
              Send message
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
