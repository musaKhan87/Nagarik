import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ThumbsUp, Filter, AlertTriangle } from "lucide-react";
import { useComplaints } from '../context/ComplaintContext';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const STATUS_COLORS = {
  Pending: "bg-warning/20 text-warning-foreground border-warning/30",
  "In Progress": "bg-primary/15 text-primary border-primary/30",
  Resolved: "bg-success/20 text-success border-success/30",
};

const SEV_COLORS = {
  Critical: "bg-destructive/15 text-destructive",
  High: "bg-accent/20 text-accent-foreground",
  Medium: "bg-secondary text-secondary-foreground",
  Low: "bg-muted text-muted-foreground",
};

export function CitizenDashboard() {
  const { complaints, upvoteComplaint, loading } = useComplaints();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const list = complaints.filter((c) => 
    (c.issueType + (c.id || c._id) + (c.location?.address || "")).toLowerCase().includes(q.toLowerCase())
  );

  const handleUpvote = async (e, id) => {
    e.stopPropagation();
    await upvoteComplaint(id);
  };

  if (loading) {
    return <div className="text-center py-12 text-sm text-muted-foreground">Loading your dashboard...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 bg-background text-foreground">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your dashboard</div>
          <h1 className="mt-1.5 font-display text-3xl sm:text-4xl md:text-5xl text-foreground">Track your complaints.</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live status, upvotes, resolution proof.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search complaints..." className="w-full pl-9" />
          </div>
          <Button onClick={() => navigate('/report')} className="rounded-full w-full sm:w-auto font-bold">File Report</Button>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: complaints.length, v: "Total", c: "" },
          { k: complaints.filter(c => c.status === 'Pending').length, v: "Pending", c: "text-warning" },
          { k: complaints.filter(c => c.status === 'In Progress').length, v: "In progress", c: "text-primary" },
          { k: complaints.filter(c => c.status === 'Resolved').length, v: "Resolved", c: "text-success" },
        ].map((s) => (
          <div key={s.v} className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <div className={`font-display text-2xl sm:text-3xl font-bold ${s.c}`}>{s.k}</div>
            <div className="mt-0.5 text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="glass-panel text-center p-16 rounded-xl border border-border mt-8">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground font-bold mb-2">No complaints filed yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Every report you submit will appear here.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {list.map((c) => {
            const progressPct = c.status === 'Resolved' ? 100 : c.status === 'In Progress' ? 50 : 15;
            return (
              <div 
                key={c._id || c.id} 
                onClick={() => navigate(`/track/${c._id || c.id}`)}
                className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-elev sm:p-6 cursor-pointer"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-muted-foreground">#{c._id || c.id}</span>
                      <span className={`rounded-full border px-2 py-0.5 ${STATUS_COLORS[c.status] || ''}`}>{c.status}</span>
                      <span className={`rounded-full px-2 py-0.5 ${SEV_COLORS[c.priority] || ''}`}>{c.priority}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <h3 className="truncate font-display text-lg sm:text-xl text-foreground">{c.issueType}</h3>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {c.location?.address} · {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleUpvote(e, c._id || c.id)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs transition hover:bg-secondary text-foreground"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> {c.upvoteCount || 0}
                  </button>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-hero transition-all" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
