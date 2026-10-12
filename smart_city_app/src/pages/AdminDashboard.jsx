import React, { useState, useEffect,useMemo } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import {
  Map, BarChart2, Filter, Search, ArrowUpRight, ChevronRight,
  MapPin, UserPlus, Users, Sparkles, Plus, AlertCircle, Eye, Settings2, Trash2,
  Clock, CheckCircle2, ShieldAlert, X, Briefcase, Image as ImageIcon, Flame, Edit2
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import { MapView } from '../components/MapView';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AdminShell, AccessDenied, PageHeader } from '../components/admin/admin-shell';
import { useAdminRole, ROLE_META } from '../lib/admin-role';
import { RoleManagement } from './RoleManagement';

// ────────────────────────────────────────────────────────────────
// OVERVIEW SUBPAGE
// ────────────────────────────────────────────────────────────────
function OverviewView({ complaints, workers, setSelectedComplaint }) {
  const { role } = useAdminRole();
  const navigate = useNavigate();
  const meta = ROLE_META[role];
  const scope = meta.dept ? `${meta.dept} dept` : "Navi Mumbai";

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  const cats = ["Broken Road", "Garbage", "Street Light", "Waterlogging", "Illegal Dumping"];
  const recent = complaints.slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow={`Overview · ${scope}`}
        title={`Good afternoon, ${meta.name}.`}
        subtitle="Here's what's happening across your wards today."
      >
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Last 7 days</Button>
        <Button className="gap-2" onClick={() => navigate('/admin/complaints')}>Manage complaints <ArrowUpRight className="h-4 w-4" /></Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Total complaints", v: total, c: "text-foreground" },
          { l: "Pending", v: pending, c: "text-warning" },
          { l: "In progress", v: inProgress, c: "text-primary" },
          { l: "Resolved", v: resolved, c: "text-success" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-card p-5 shadow-elev">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
            <div className={`mt-2 font-display text-3xl ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display text-xl">City heatmap</div>
              <div className="text-xs text-muted-foreground">Complaint density · live</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/heatmap')}>Expand <ChevronRight className="ml-1 h-4 w-4" /></Button>
          </div>
          <MapView complaints={complaints} />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="font-display text-xl">By category</div>
          <div className="text-xs text-muted-foreground">Share of complaints</div>
          <div className="mt-6 space-y-4">
            {cats.map((cat) => {
              const count = complaints.filter(c => c.issueType === cat).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{cat}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
          <div>
            <div className="font-display text-lg sm:text-xl text-foreground">Recent complaints</div>
            <div className="text-xs text-muted-foreground">Auto-routed to departments · assign or escalate</div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/complaints')} className="text-xs rounded-xl">
            View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Mobile View for Recent Complaints */}
        <div className="p-3 space-y-2.5 md:hidden">
          {recent.map((c) => {
            const assignedWorker = workers.find(w => w._id === (c.assignedWorker?._id || c.assignedWorker));
            return (
              <div key={c._id} className="rounded-xl border border-border bg-surface p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-muted-foreground">#{c._id?.slice(-6)}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      c.priority === "Critical" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" :
                      c.priority === "High" ? "bg-orange-500/15 text-orange-600 dark:text-orange-400" :
                      c.priority === "Medium" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"
                    }`}>{c.priority}</span>
                    <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">{c.status}</span>
                  </div>
                </div>
                <div className="text-xs font-semibold text-foreground line-clamp-1">{c.issueType}</div>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                <div className="pt-1 flex items-center justify-between text-xs border-t border-border/40">
                  <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                    {assignedWorker ? assignedWorker.name : 'Unassigned'}
                  </span>
                  {c.status === 'Pending' ? (
                    <Button onClick={() => setSelectedComplaint(c)} size="sm" className="h-7 text-[11px] px-3 rounded-lg">
                      Assign
                    </Button>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Assigned</span>
                  )}
                </div>
              </div>
            );
          })}
          {recent.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">No recent complaints found.</div>
          )}
        </div>

        {/* Desktop Table for Recent Complaints */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                {["ID", "Issue", "Category", "Severity", "Status", "Assigned"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((c) => {
                const assignedWorker = workers.find(w => w._id === (c.assignedWorker?._id || c.assignedWorker));
                return (
                  <tr key={c._id} className="border-t border-border transition hover:bg-secondary/40">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground truncate max-w-[120px]">#{c._id?.slice(-6)}</td>
                    <td className="px-6 py-4 font-medium">{c.description}</td>
                    <td className="px-6 py-4 text-muted-foreground">{c.issueType}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        c.priority === "Critical" ? "bg-destructive/15 text-destructive" :
                        c.priority === "High" ? "bg-accent/20 text-accent-foreground" :
                        c.priority === "Medium" ? "bg-warning/20" : "bg-secondary text-muted-foreground"
                      }`}>{c.priority}</span>
                    </td>
                    <td className="px-6 py-4 text-xs">{c.status}</td>
                    <td className="px-6 py-4">
                      {c.status === 'Pending' ? (
                        <Button onClick={() => setSelectedComplaint(c)} size="sm" className="rounded-full text-xs font-bold shadow-sm">
                          Assign
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {assignedWorker ? assignedWorker.name : 'Assigned'}
                          </span>
                          {c.status !== 'Resolved' && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedComplaint(c)}
                              className="h-7 px-2.5 rounded-lg text-[11px] font-bold text-primary hover:border-primary/60 hover:bg-primary/5 transition"
                            >
                              Reassign
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">No recent complaints found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// COMPLAINTS SUBPAGE (Mobile-Optimized & Desktop)
// ────────────────────────────────────────────────────────────────
function ComplaintsView({ complaints, workers, setSelectedComplaint }) {
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const TABS = ["All", "🚨 SLA Breached", "Pending", "In Progress", "Resolved"];

  const now = new Date();
  const breachedComplaints = complaints.filter(c => 
    c.status !== 'Resolved' && (c.isSLABreached || (c.deadline && new Date(c.deadline) < now))
  );

  const filtered = complaints
    .filter((c) => {
      if (tab === "🚨 SLA Breached") {
        return c.status !== 'Resolved' && (c.isSLABreached || (c.deadline && new Date(c.deadline) < now));
      }
      return tab === "All" ? true : c.status === tab;
    })
    .filter((c) => (filterDept ? c.assignedDept === filterDept : true))
    .filter((c) =>
      q ? [c.description, c.issueType, c._id, c.location?.address, c.address].some((v) => v?.toLowerCase().includes(q.toLowerCase())) : true
    );

  // Helper for priority badges
  const renderPriorityBadge = (p) => {
    switch (p) {
      case "Critical":
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">Critical</span>;
      case "High":
        return <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 text-[11px] font-bold text-orange-600 dark:text-orange-400">High</span>;
      case "Medium":
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">Medium</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 border border-slate-500/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">{p || 'Low'}</span>;
    }
  };

  // Helper for status badges
  const renderStatusBadge = (s) => {
    switch (s) {
      case "Resolved":
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Resolved</span>;
      case "In Progress":
        return <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-[11px] font-bold text-sky-600 dark:text-sky-400"><Clock className="h-3 w-3" /> In Progress</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">Pending</span>;
    }
  };

  // Helper for SLA badge
  const renderSlaBadge = (c) => {
    if (!c.deadline) return <span className="text-xs text-muted-foreground">Standard</span>;
    const isBreached = c.status !== 'Resolved' && (c.isSLABreached || new Date(c.deadline) < now);
    const diffHours = Math.round((new Date(c.deadline) - now) / (1000 * 60 * 60));
    if (isBreached || diffHours < 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 text-destructive border border-destructive/30 px-2.5 py-0.5 text-[10px] font-extrabold animate-pulse">
          🚨 Breached ({Math.abs(diffHours)}h ago)
        </span>
      );
    }
    if (diffHours <= 6) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-extrabold">
          ⏱️ {diffHours}h remaining
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold">
        ⏱️ {diffHours}h target
      </span>
    );
  };

  return (
    <>
      <PageHeader 
        eyebrow="Records & SLA Tracking" 
        title="Complaints directory" 
        subtitle="Manage complaints, monitor SLA deadlines, assign field workers, and track resolution."
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
            {complaints.length} Total
          </span>
        </div>
      </PageHeader>

      {/* SLA Breach Alert Banner */}
      {breachedComplaints.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-destructive text-destructive-foreground font-bold shadow-md animate-pulse shrink-0">
              🚨
            </div>
            <div>
              <div className="font-extrabold text-destructive text-sm leading-snug">
                {breachedComplaints.length} Complaint(s) Have Breached SLA Deadlines!
              </div>
              <div className="text-muted-foreground mt-0.5 leading-relaxed">
                Assign available field workers immediately to fulfill SLA commitments.
              </div>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => setTab("🚨 SLA Breached")} 
            className="rounded-xl w-full sm:w-auto shrink-0 shadow-sm"
          >
            View Breached ({breachedComplaints.length})
          </Button>
        </div>
      )}

      {/* Filters & Search Controls */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
          {/* Search bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by ID, category, address, or issue..." 
              className="pl-10 h-11 rounded-2xl text-xs sm:text-sm bg-card border-border" 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="h-11 bg-card border border-border text-foreground rounded-2xl px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
          >
            <option value="">All Departments</option>
            <option value="Roads & Infrastructure Dept">Roads & Infrastructure</option>
            <option value="Sanitation Dept">Sanitation Dept</option>
            <option value="Electricity Dept">Electricity Dept</option>
            <option value="Water Supply Dept">Water Supply</option>
          </select>
        </div>

        {/* Scrollable Status Tabs on mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          {TABS.map((t) => {
            const count = t === "All" 
              ? complaints.length 
              : t === "🚨 SLA Breached" 
                ? breachedComplaints.length 
                : complaints.filter(c => c.status === t).length;
            const isSelected = tab === t;

            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
                  isSelected 
                    ? t.includes('Breached') 
                      ? "bg-destructive text-destructive-foreground shadow-sm" 
                      : "bg-primary text-primary-foreground shadow-sm" 
                    : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                <span>{t}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected 
                    ? "bg-white/20 text-white" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MOBILE CARD VIEW (Shown on mobile devices < 768px)          */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="mt-5 space-y-3 md:hidden">
        {filtered.map((c) => {
          const assignedWorker = workers.find(w => w._id?.toString() === (c.assignedWorker?._id || c.assignedWorker)?.toString());
          const addressText = c.location?.address || c.address || 'Address provided';

          return (
            <div 
              key={c._id} 
              className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition space-y-3"
            >
              {/* Card Top: ID & Status Chips */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-lg">
                  #{c._id ? c._id.slice(-6) : 'ID'}
                </span>
                <div className="flex items-center gap-1.5">
                  {renderPriorityBadge(c.priority)}
                  {renderStatusBadge(c.status)}
                </div>
              </div>

              {/* Card Content with optional thumbnail */}
              <div className="flex items-start gap-3">
                {c.photo ? (
                  <button 
                    type="button"
                    onClick={() => setPreviewPhoto(c.photo)}
                    className="relative h-16 w-16 rounded-xl overflow-hidden border border-border shrink-0 bg-muted group"
                    title="Tap to preview photo"
                  >
                    <img src={c.photo} alt="Issue" className="h-full w-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Eye className="h-4 w-4 text-white drop-shadow" />
                    </div>
                  </button>
                ) : (
                  <div className="h-16 w-16 rounded-xl border border-dashed border-border bg-muted/40 shrink-0 flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-foreground">{c.issueType}</span>
                    {c.assignedDept && (
                      <span className="text-[10px] text-muted-foreground border border-border/70 rounded-md px-1.5 py-0.2">
                        {c.assignedDept.replace(' Dept', '')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/90 font-medium mt-1 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 truncate">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">{addressText}</span>
                  </div>
                </div>
              </div>

              {/* SLA Target Banner on Card */}
              <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs">
                <span className="text-[11px] text-muted-foreground font-medium">SLA Deadline:</span>
                {renderSlaBadge(c)}
              </div>

              {/* Worker Action Footer */}
              <div className="border-t border-border/50 pt-2.5">
                {c.status === 'Pending' ? (
                  <Button 
                    onClick={() => setSelectedComplaint(c)} 
                    size="sm" 
                    className="w-full rounded-xl font-bold text-xs h-9 shadow-sm"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Assign Field Worker
                  </Button>
                ) : (
                  <div className="flex items-center justify-between bg-surface rounded-xl px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-foreground truncate">
                        {assignedWorker ? assignedWorker.name : 'Worker Assigned'}
                      </span>
                    </div>
                    {c.status !== 'Resolved' && (
                      <button 
                        onClick={() => setSelectedComplaint(c)}
                        className="text-[11px] font-bold text-primary hover:underline shrink-0 ml-2"
                      >
                        Reassign
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground">
            No complaints match your selection.
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* DESKTOP TABLE VIEW (Shown on md: screens and larger)        */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="mt-6 hidden md:block overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3.5 text-left font-medium">Photo</th>
                <th className="px-5 py-3.5 text-left font-medium">ID</th>
                <th className="px-5 py-3.5 text-left font-medium">Issue / Description</th>
                <th className="px-5 py-3.5 text-left font-medium">Category</th>
                <th className="px-5 py-3.5 text-left font-medium">SLA Target</th>
                <th className="px-5 py-3.5 text-left font-medium">Severity</th>
                <th className="px-5 py-3.5 text-left font-medium">Status</th>
                <th className="px-5 py-3.5 text-left font-medium">Worker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => {
                const assignedWorker = workers.find(w => w._id?.toString() === (c.assignedWorker?._id || c.assignedWorker)?.toString());
                const addressText = c.location?.address || c.address || 'Address provided';

                return (
                  <tr key={c._id} className="transition hover:bg-secondary/40">
                    <td className="px-5 py-3.5">
                      {c.photo ? (
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto(c.photo)}
                          className="h-10 w-10 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary transition block"
                          title="Preview full photo"
                        >
                          <img src={c.photo} alt="Issue" className="h-full w-full object-cover" />
                        </button>
                      ) : (
                        <div className="h-10 w-10 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground truncate max-w-[100px]">
                      #{c._id ? c._id.slice(-6) : 'ID'}
                    </td>
                    <td className="px-5 py-3.5 max-w-[280px]">
                      <div className="font-medium text-foreground truncate">{c.description}</div>
                      <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span>{addressText}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-foreground whitespace-nowrap">
                      {c.issueType}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {renderSlaBadge(c)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {renderPriorityBadge(c.priority)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {renderStatusBadge(c.status)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {c.status === 'Pending' ? (
                        <Button 
                          onClick={() => setSelectedComplaint(c)} 
                          size="sm" 
                          className="rounded-full text-xs font-bold gap-1 shadow-sm"
                        >
                          <UserPlus className="h-3 w-3" /> Assign
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground bg-surface/80 px-2 py-0.5 rounded-lg border border-border/60">
                            {assignedWorker ? assignedWorker.name : 'Worker Assigned'}
                          </span>
                          {c.status !== 'Resolved' && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedComplaint(c)}
                              className="h-7 px-2.5 rounded-lg text-[11px] font-bold text-primary hover:border-primary/60 hover:bg-primary/5 transition"
                            >
                              Reassign
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No complaints match your selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Photo Preview Lightbox Modal */}
      {previewPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPreviewPhoto(null)}
        >
          <div 
            className="relative max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden border border-white/20 bg-black shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <img src={previewPhoto} alt="Full Issue Photo" className="w-full h-full object-contain max-h-[80vh]" />
            <button 
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-3 right-3 rounded-full bg-black/70 p-2 text-white hover:bg-black transition shadow-lg"
              title="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// HEATMAP SUBPAGE
// ────────────────────────────────────────────────────────────────
function HeatmapView({ complaints = [], setSelectedComplaint }) {
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  // Compute hotspot areas dynamically using full location address
  const stats = useMemo(() => {
    const areas = [
      "Vashi",
      "Kharghar",
      "Belapur",
      "Nerul",
      "Panvel",
      "Seawoods",
      "Kopar Khairane",
      "Ghansoli",
      "Airoli"
    ];

    const results = areas.map(area => {
      const matched = complaints.filter(c => {
        const addr = (c.location?.address || c.address || '').toLowerCase();
        return addr.includes(area.toLowerCase());
      });
      return {
        w: `${area} Ward`,
        name: area,
        c: matched.length,
        resolved: matched.filter(c => c.status === 'Resolved').length,
        active: matched.filter(c => c.status !== 'Resolved').length
      };
    }).filter(a => a.c > 0).sort((a, b) => b.c - a.c);

    // If no specific area matched or there are general complaints
    if (results.length === 0) {
      return [
        { 
          w: "Navi Mumbai Municipal Zone", 
          name: "Central", 
          c: complaints.length, 
          resolved: complaints.filter(c => c.status === 'Resolved').length, 
          active: complaints.filter(c => c.status !== 'Resolved').length 
        }
      ];
    }
    return results;
  }, [complaints]);

  return (
    <>
      <PageHeader 
        eyebrow="Geospatial Intelligence" 
        title="City Grievance Heatmap" 
        subtitle="Live geospatial density and coordinate mapping of citizen complaints across municipal zones."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <MapView complaints={complaints} height="560px" onPointClick={setSelectedHotspot} />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-xl font-bold text-foreground">Hotspot Areas</div>
                <div className="text-xs text-muted-foreground mt-0.5">Active grievance cluster density</div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {complaints.length} Total Points
              </span>
            </div>

            <div className="mt-5 space-y-3.5">
              {stats.map((w) => {
                const max = stats[0]?.c || 1;
                const pct = Math.round((w.c / max) * 100);
                return (
                  <div key={w.w} className="space-y-1.5 p-2 rounded-xl hover:bg-secondary/40 transition">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {w.w}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">{w.active} active</span>
                        <span className="font-mono font-bold text-foreground text-xs">{w.c} cases</span>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-500" 
                        style={{ width: `${Math.max(5, pct)}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedHotspot && (
            <div className="mt-6 rounded-2xl border border-border bg-surface/80 p-4 text-xs space-y-2.5 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <span>Selected Grievance</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedHotspot.status === 'Resolved'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {selectedHotspot.status}
                </span>
              </div>

              <div className="space-y-1 text-muted-foreground">
                <div><strong className="text-foreground">Category:</strong> {selectedHotspot.issueType}</div>
                <div><strong className="text-foreground">Severity:</strong> {selectedHotspot.priority}</div>
                <div className="line-clamp-2"><strong className="text-foreground">Address:</strong> {selectedHotspot.location?.address || selectedHotspot.address || 'Navi Mumbai'}</div>
                {selectedHotspot.description && (
                  <p className="text-[11px] text-muted-foreground italic line-clamp-2 pt-1 border-t border-border/40">
                    "{selectedHotspot.description}"
                  </p>
                )}
              </div>

              {setSelectedComplaint && selectedHotspot.status !== 'Resolved' && (
                <div className="pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => setSelectedComplaint(selectedHotspot)}
                    className="w-full rounded-xl text-xs font-bold h-9 shadow-sm"
                  >
                    {selectedHotspot.assignedWorker ? 'Reassign Field Worker' : 'Assign Field Worker'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// WORKERS SUBPAGE
// ────────────────────────────────────────────────────────────────
function WorkersView({ workers, complaints, onAddWorker, onEditWorker, onDeleteWorker }) {
  return (
    <>
      <PageHeader eyebrow="Roster" title="Field workers" subtitle="Assign tasks, monitor workload, review active tasks, and manage credentials.">
        <Button onClick={onAddWorker} className="gap-2 font-bold rounded-xl shadow-sm text-xs sm:text-sm"><UserPlus className="h-4 w-4" /> Add worker</Button>
      </PageHeader>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {workers.map((w) => {
          const wId = w._id?.toString();
          const activeTasks = complaints.filter(c => (c.assignedWorker?._id || c.assignedWorker)?.toString() === wId && c.status === 'In Progress').length;
          const resolvedTasks = complaints.filter(c => (c.assignedWorker?._id || c.assignedWorker)?.toString() === wId && c.status === 'Resolved').length;
          return (
            <div key={w._id} className="rounded-3xl border border-border bg-card p-5 shadow-elev space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-hero font-display text-sm text-white font-bold shrink-0">
                  {w.name ? w.name.split(" ").map((n) => n[0]).join("") : "W"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold text-foreground text-sm">{w.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{w.department || 'General Duty'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-border bg-surface p-3">
                  <div className="text-muted-foreground">Active Tasks</div>
                  <div className="mt-1 font-display text-xl text-primary font-bold">{activeTasks}</div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-3">
                  <div className="text-muted-foreground">Resolved</div>
                  <div className="mt-1 font-display text-xl text-success font-bold">{resolvedTasks}</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 text-xs text-muted-foreground pt-1 border-t border-border/50">
                <div className="truncate flex-1 font-mono">
                  📞 {w.phone || 'N/A'}
                </div>
                <div className="truncate flex-1 text-left sm:text-right">
                  ✉️ {w.email || 'N/A'}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onEditWorker && onEditWorker(w)}
                  className="rounded-xl text-xs h-8 gap-1.5 font-medium"
                >
                  <Edit2 className="h-3 w-3 text-primary" />
                  <span>Edit Credentials</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onDeleteWorker && onDeleteWorker(w)}
                  className="rounded-xl text-xs h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2.5"
                  title="Delete worker"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
        {workers.length === 0 && (
          <div className="col-span-full border border-dashed border-border rounded-3xl p-12 text-center text-muted-foreground bg-card/50">
            <Users className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
            <div className="font-medium text-foreground text-sm">No registered field workers found</div>
            <p className="text-xs mt-1">Click "Add worker" above to register a new field worker for this department.</p>
          </div>
        )}
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// ANALYTICS SUBPAGE WITH PIE / BAR CHARTS & SLA PERFORMANCE
// ────────────────────────────────────────────────────────────────
function AnalyticsView({ complaints = [] }) {
  const total = complaints.length || 1;
  const categories = [
    { name: 'Broken Road', color: '#f59e0b', bg: 'bg-amber-500' },
    { name: 'Garbage', color: '#ef4444', bg: 'bg-rose-500' },
    { name: 'Street Light', color: '#06b6d4', bg: 'bg-cyan-500' },
    { name: 'Waterlogging', color: '#3b82f6', bg: 'bg-blue-500' },
    { name: 'Illegal Dumping', color: '#8b5cf6', bg: 'bg-purple-500' },
    { name: 'Other', color: '#10b981', bg: 'bg-emerald-500' }
  ];

  // Calculate Category Breakdown & Angles for SVG Donut Chart
  const categoryStats = categories.map(cat => {
    const count = complaints.filter(c => c.issueType === cat.name).length;
    const percentage = Math.round((count / total) * 100);
    return { ...cat, count, percentage };
  });

  // Calculate Donut Segments
  let cumulativePercent = 0;
  const donutSegments = categoryStats.map(stat => {
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += stat.percentage || 1;
    const endAngle = (cumulativePercent / 100) * 360;
    return { ...stat, startAngle, endAngle };
  });

  // Calculate Departmental SLA Resolution Bar Data
  const departments = [
    'Roads & Infrastructure Dept',
    'Sanitation Dept',
    'Electricity Dept',
    'General Dept'
  ];

  const deptStats = departments.map(dept => {
    const deptComplaints = complaints.filter(c => (c.assignedDept || 'General Dept') === dept);
    const resolved = deptComplaints.filter(c => c.status === 'Resolved').length;
    const inProgress = deptComplaints.filter(c => c.status === 'In Progress').length;
    const pending = deptComplaints.filter(c => c.status === 'Submitted' || c.status === 'Pending').length;
    return { dept, total: deptComplaints.length, resolved, inProgress, pending };
  });

  // Calculate Citizen Feedback Rating Distribution
  const ratingsCount = [5, 4, 3, 2, 1].map(stars => {
    const count = complaints.filter(c => c.feedback?.rating === stars).length;
    return { stars, count };
  });

  return (
    <>
      <PageHeader 
        eyebrow="Statistics & Intelligence" 
        title="Analytics & Heatmap Metrics" 
        subtitle="Real-time category pie breakdown, departmental SLA performance bar charts, and citizen rating distributions."
      />

      <div className="mt-8 space-y-8">
        
        {/* Top Grid: SVG Donut Pie Chart & SLA Bar Chart */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* SVG Donut / Pie Chart: Share of Complaints by Category */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Complaint Category Distribution</h3>
                <p className="text-xs text-muted-foreground">Pie chart breakdown of incoming grievance types</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                {complaints.length} Total Reports
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              
              {/* SVG Donut Graphic */}
              <div className="relative h-56 w-56 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  {donutSegments.map((seg, i) => {
                    const strokeDasharray = `${seg.percentage * 2.83} 283`;
                    const strokeDashoffset = -((cumulativePercent - seg.percentage) * 2.83);
                    return (
                      <circle
                        key={seg.name}
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="10"
                        strokeDasharray={`${(seg.percentage / 100) * 282.7} 282.7`}
                        strokeDashoffset={`-${(donutSegments.slice(0, i).reduce((acc, curr) => acc + curr.percentage, 0) / 100) * 282.7}`}
                        className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                      />
                    );
                  })}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-display text-3xl font-extrabold text-foreground">{complaints.length}</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Issues</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-3 w-full">
                {categoryStats.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${cat.bg}`} />
                      <span className="text-foreground">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{cat.count}</span>
                      <span className="text-muted-foreground text-[11px] font-mono">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Departmental SLA Performance Bar Chart */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Departmental Resolution Rates</h3>
                <p className="text-xs text-muted-foreground">Bar chart comparison of resolved vs active workloads</p>
              </div>
              <span className="text-xs font-bold text-emerald-500">Live Grid</span>
            </div>

            <div className="space-y-5 pt-2">
              {deptStats.map((ds) => {
                const maxVal = Math.max(...deptStats.map(d => d.total), 1);
                const resPct = Math.round((ds.resolved / maxVal) * 100);
                const inProgPct = Math.round((ds.inProgress / maxVal) * 100);

                return (
                  <div key={ds.dept} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-foreground truncate max-w-[200px]">{ds.dept.replace(' Dept', '')}</span>
                      <span className="text-muted-foreground">
                        <strong className="text-emerald-500">{ds.resolved} Resolved</strong> / {ds.total} Total
                      </span>
                    </div>

                    {/* Stacked Bar Visual */}
                    <div className="h-3 w-full overflow-hidden rounded-full bg-secondary flex gap-0.5">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(ds.resolved / (ds.total || 1)) * 100}%` }} title="Resolved" />
                      <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(ds.inProgress / (ds.total || 1)) * 100}%` }} title="In Progress" />
                      <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${(ds.pending / (ds.total || 1)) * 100}%` }} title="Pending" />
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-center gap-6 pt-4 text-[11px] font-bold text-muted-foreground border-t border-border/60">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Resolved</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> In Progress</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pending</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Grid: Monthly Resolution Trend Bar & Citizen Star Rating Distribution */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Monthly Resolution Trend Bar Chart */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">6-Month Resolution Efficiency</h3>
              <p className="text-xs text-muted-foreground">Monthly complaint volume vs on-time SLA completion</p>
            </div>

            <div className="h-48 flex items-end justify-between gap-3 pt-6 px-4">
              {[
                { month: 'Mar', total: 42, resolved: 38 },
                { month: 'Apr', total: 58, resolved: 52 },
                { month: 'May', total: 65, resolved: 60 },
                { month: 'Jun', total: 80, resolved: 74 },
                { month: 'Jul', total: 95, resolved: 89 },
                { month: 'Aug', total: complaints.length || 30, resolved: complaints.filter(c => c.status === 'Resolved').length || 24 }
              ].map((m) => {
                const heightPct = Math.round((m.total / 100) * 100);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div 
                        className="w-3.5 rounded-t-lg bg-primary/30 group-hover:bg-primary/50 transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                        title={`Total: ${m.total}`}
                      />
                      <div 
                        className="w-3.5 rounded-t-lg bg-emerald-500 group-hover:bg-emerald-400 transition-all duration-300"
                        style={{ height: `${Math.round((m.resolved / 100) * 100)}%` }}
                        title={`Resolved: ${m.resolved}`}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Citizen 1-5 Star Rating Distribution */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Citizen Satisfaction Ratings</h3>
              <p className="text-xs text-muted-foreground">Distribution of 1–5 star ratings submitted post-resolution</p>
            </div>

            <div className="space-y-3 pt-2">
              {ratingsCount.map((r) => {
                const maxR = Math.max(...ratingsCount.map(item => item.count), 1);
                const rPct = Math.round((r.count / maxR) * 100);
                return (
                  <div key={r.stars} className="flex items-center gap-3 text-xs font-bold">
                    <span className="w-12 text-amber-500 flex items-center gap-1">
                      {r.stars} ★
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${rPct}%` }} />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">{r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// SETTINGS SUBPAGE
// ────────────────────────────────────────────────────────────────
function SettingsView() {
  return (
    <>
      <PageHeader eyebrow="Preferences" title="Portal settings" subtitle="Configure departments, priorities, and alerts."></PageHeader>
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 max-w-2xl">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <div className="font-medium">Auto-Assignment Mode</div>
              <div className="text-xs text-muted-foreground">Automatically route to best field worker based on distance and workload.</div>
            </div>
            <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <div className="font-medium">SMS Alerts for Citizens</div>
              <div className="text-xs text-muted-foreground">Send real-time alerts when issue is assigned or resolved.</div>
            </div>
            <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
          </div>
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// MAIN ROUTER CONTAINER
// ────────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const { currentUser } = useAuth();
  const { role, can } = useAdminRole();
  const meta = ROLE_META[role];
  const { complaints, assignWorker } = useComplaints();
  const [workers, setWorkers] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignedWorkerId, setAssignedWorkerId] = useState('');

  // Add Worker Modal State
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [wName, setWName] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wEmail, setWEmail] = useState('');
  const [wPassword, setWPassword] = useState('');
  const [wDept, setWDept] = useState('Roads & Infrastructure Dept');

  // Edit Worker Modal State
  const [editingWorker, setEditingWorker] = useState(null);
  const [editWName, setEditWName] = useState('');
  const [editWPhone, setEditWPhone] = useState('');
  const [editWEmail, setEditWEmail] = useState('');
  const [editWDept, setEditWDept] = useState('Roads & Infrastructure Dept');
  const [editWPassword, setEditWPassword] = useState('');

  // Delete Worker State
  const [deletingWorker, setDeletingWorker] = useState(null);

  const currentDept = currentUser?.department || (role === 'dept_admin' && meta?.dept ? `${meta.dept} Dept` : null);
  const displayedWorkers = (role === 'dept_admin' && currentDept)
    ? workers.filter(w => !w.department || w.department.toLowerCase().includes(currentDept.toLowerCase()) || currentDept.toLowerCase().includes(w.department.toLowerCase()))
    : workers;

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/admin/workers');
      setWorkers(response.data);
    } catch (error) {
      console.error('Failed to load workers directory:', error);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignedWorkerId || !selectedComplaint) return;
    const res = await assignWorker(selectedComplaint._id, assignedWorkerId);
    if (res.success) {
      setSelectedComplaint(null);
      setAssignedWorkerId('');
    } else {
      alert(res.message);
    }
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (!wName || !wPhone) return;
    try {
      const targetDept = (role === 'dept_admin' && currentDept) ? currentDept : wDept;
      await api.post('/admin/workers', {
        name: wName,
        phone: wPhone,
        email: wEmail,
        department: targetDept,
        password: wPassword.trim() || undefined
      });
      setShowAddWorker(false);
      setWName('');
      setWPhone('');
      setWEmail('');
      setWPassword('');
      fetchWorkers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create worker');
    }
  };

  const handleStartEditWorker = (worker) => {
    setEditingWorker(worker);
    setEditWName(worker.name || '');
    setEditWPhone(worker.phone || '');
    setEditWEmail(worker.email || '');
    setEditWDept(worker.department || currentDept || 'Roads & Infrastructure Dept');
    setEditWPassword('');
  };

  const handleUpdateWorker = async (e) => {
    e.preventDefault();
    if (!editingWorker) return;
    try {
      const payload = {
        name: editWName,
        phone: editWPhone,
        email: editWEmail,
        department: editWDept
      };
      if (editWPassword.trim().length > 0) {
        payload.password = editWPassword.trim();
      }
      await api.put(`/admin/workers/${editingWorker._id}`, payload);
      setEditingWorker(null);
      fetchWorkers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update worker credentials');
    }
  };

  const handleDeleteWorker = async () => {
    if (!deletingWorker) return;
    try {
      await api.delete(`/admin/workers/${deletingWorker._id}`);
      setDeletingWorker(null);
      fetchWorkers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete worker');
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={
          <AdminShell>
            <OverviewView complaints={complaints} workers={displayedWorkers} setSelectedComplaint={setSelectedComplaint} />
          </AdminShell>
        } />
        <Route path="/complaints" element={
          <AdminShell>
            <ComplaintsView complaints={complaints} workers={displayedWorkers} setSelectedComplaint={setSelectedComplaint} />
          </AdminShell>
        } />
        <Route path="/heatmap" element={
          <AdminShell>
            <HeatmapView complaints={complaints} setSelectedComplaint={setSelectedComplaint} />
          </AdminShell>
        } />
        <Route path="/workers" element={
          <AdminShell>
            {can('admin.workers') ? (
              <WorkersView 
                workers={displayedWorkers} 
                complaints={complaints} 
                onAddWorker={() => setShowAddWorker(true)} 
                onEditWorker={handleStartEditWorker} 
                onDeleteWorker={(w) => setDeletingWorker(w)}
              />
            ) : (
              <AccessDenied />
            )}
          </AdminShell>
        } />
        <Route path="/users" element={
          <AdminShell>
            <RoleManagement />
          </AdminShell>
        } />
        <Route path="/analytics" element={
          <AdminShell>
            <AnalyticsView complaints={complaints} />
          </AdminShell>
        } />
        <Route path="/settings" element={
          <AdminShell>
            <SettingsView />
          </AdminShell>
        } />
      </Routes>
      
      {/* Assign / Reassign Modal Wrapper */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm overflow-y-auto">
          <form onSubmit={handleAssign} className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-border max-w-md w-full shadow-2xl space-y-4 bg-card my-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                  {selectedComplaint.assignedWorker ? 'Reassign Field Worker' : 'Assign Field Worker'}
                </h3>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {selectedComplaint.assignedWorker 
                    ? 'Select a new verified field worker to take over this complaint.' 
                    : 'Choose a verified field worker to assign this complaint.'}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => { setSelectedComplaint(null); setAssignedWorkerId(''); }}
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Issue: </span> 
              {selectedComplaint.issueType} — {selectedComplaint.description}
            </div>

            {selectedComplaint.assignedWorker && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300">
                <span className="font-semibold">Currently Assigned: </span>
                {displayedWorkers.find(w => w._id?.toString() === (selectedComplaint.assignedWorker?._id || selectedComplaint.assignedWorker)?.toString())?.name || 'Worker Assigned'}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Select worker</label>
              <select 
                value={assignedWorkerId} 
                onChange={e => setAssignedWorkerId(e.target.value)} 
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Choose Worker --</option>
                {displayedWorkers.map(w => (
                  <option key={w._id} value={w._id}>{w.name} ({w.department})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={() => { setSelectedComplaint(null); setAssignedWorkerId(''); }} className="flex-1 rounded-xl text-xs h-10">
                Cancel
              </Button>
              <Button type="submit" disabled={!assignedWorkerId} className="flex-1 rounded-xl text-xs h-10 font-bold">
                Confirm
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddWorker && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm overflow-y-auto">
          <form onSubmit={handleCreateWorker} autoComplete="off" className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-border max-w-md w-full shadow-2xl space-y-4 bg-card my-auto">
            {/* Dummy inputs to prevent browser autofilling saved admin credentials */}
            <input type="text" name="dummy_username_add" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input type="password" name="dummy_password_add" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">Add new field worker</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Create an account with all credentials for a field worker.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddWorker(false)}
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Full name *</label>
                <Input 
                  name="field_worker_fullname"
                  autoComplete="off"
                  value={wName} 
                  onChange={e => setWName(e.target.value)} 
                  required 
                  placeholder="e.g. Ramesh Shinde" 
                  className="rounded-xl h-10 text-xs sm:text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Phone number (Login Username) *</label>
                <Input 
                  type="tel"
                  name="field_worker_phone_contact"
                  autoComplete="new-off"
                  value={wPhone} 
                  onChange={e => setWPhone(e.target.value)} 
                  required 
                  placeholder="e.g. 9876543219" 
                  className="rounded-xl h-10 text-xs sm:text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Email address</label>
                <Input 
                  type="email"
                  name="field_worker_email_contact"
                  autoComplete="off"
                  value={wEmail} 
                  onChange={e => setWEmail(e.target.value)} 
                  placeholder="e.g. ramesh.field@smartcity.gov" 
                  className="rounded-xl h-10 text-xs sm:text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Initial Password</label>
                <Input 
                  type="password" 
                  name="field_worker_temp_password"
                  autoComplete="new-password"
                  value={wPassword} 
                  onChange={e => setWPassword(e.target.value)} 
                  placeholder="Defaults to: password" 
                  className="rounded-xl h-10 text-xs sm:text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Department</label>
                {role === 'dept_admin' && currentDept ? (
                  <div className="px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm font-medium text-foreground">
                    {currentDept} <span className="text-[11px] text-muted-foreground">(Your assigned department)</span>
                  </div>
                ) : (
                  <select 
                    value={wDept} 
                    onChange={e => setWDept(e.target.value)} 
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Roads & Infrastructure Dept">Roads & Infrastructure Dept</option>
                    <option value="Sanitation Dept">Sanitation Dept</option>
                    <option value="Electricity Dept">Electricity Dept</option>
                    <option value="Water Supply Dept">Water Supply Dept</option>
                  </select>
                )}
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAddWorker(false)} className="flex-1 rounded-xl text-xs h-10">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-xl text-xs h-10 font-bold">
                Create worker
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Worker Modal */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm overflow-y-auto">
          <form onSubmit={handleUpdateWorker} autoComplete="off" className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-border max-w-md w-full shadow-2xl space-y-4 bg-card my-auto">
            <input type="text" name="dummy_username_edit" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input type="password" name="dummy_password_edit" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">Edit Worker Credentials</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Update worker information and set new login password.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingWorker(null)}
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Full name</label>
                <Input 
                  name="field_worker_edit_name"
                  autoComplete="off"
                  value={editWName} 
                  onChange={e => setEditWName(e.target.value)} 
                  required 
                  placeholder="Worker Name" 
                  className="rounded-xl h-10 text-xs sm:text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Phone number (Login ID)</label>
                <Input 
                  type="tel"
                  name="field_worker_edit_phone"
                  autoComplete="new-off"
                  value={editWPhone} 
                  onChange={e => setEditWPhone(e.target.value)} 
                  required 
                  placeholder="10 digit phone" 
                  className="rounded-xl h-10 text-xs sm:text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Email address</label>
                <Input 
                  type="email" 
                  name="field_worker_edit_email"
                  autoComplete="off"
                  value={editWEmail} 
                  onChange={e => setEditWEmail(e.target.value)} 
                  placeholder="worker@smartcity.gov" 
                  className="rounded-xl h-10 text-xs sm:text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Department</label>
                {role === 'dept_admin' && currentDept ? (
                  <div className="px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm font-medium text-foreground">
                    {currentDept} <span className="text-[11px] text-muted-foreground">(Your assigned department)</span>
                  </div>
                ) : (
                  <select 
                    value={editWDept} 
                    onChange={e => setEditWDept(e.target.value)} 
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Roads & Infrastructure Dept">Roads & Infrastructure Dept</option>
                    <option value="Sanitation Dept">Sanitation Dept</option>
                    <option value="Electricity Dept">Electricity Dept</option>
                    <option value="Water Supply Dept">Water Supply Dept</option>
                  </select>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Reset Password</label>
                <Input 
                  type="password" 
                  name="field_worker_edit_password"
                  autoComplete="new-password"
                  value={editWPassword} 
                  onChange={e => setEditWPassword(e.target.value)} 
                  placeholder="Leave blank to keep existing password" 
                  className="rounded-xl h-10 text-xs sm:text-sm" 
                />
                <p className="text-[11px] text-muted-foreground mt-0.5">Only type here if you wish to overwrite their current password.</p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingWorker(null)} className="flex-1 rounded-xl text-xs h-10">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-xl text-xs h-10 font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Worker Confirmation Modal */}
      {deletingWorker && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm overflow-y-auto">
          <div className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-destructive/30 max-w-md w-full shadow-2xl space-y-4 bg-card my-auto">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Delete Field Worker?</h3>
                <p className="text-xs text-muted-foreground">This worker account will be permanently removed.</p>
              </div>
            </div>

            <div className="rounded-xl bg-destructive/5 border border-destructive/15 p-3 text-xs text-muted-foreground space-y-1">
              <div><strong className="text-foreground">Name:</strong> {deletingWorker.name}</div>
              <div><strong className="text-foreground">Phone:</strong> {deletingWorker.phone}</div>
              <div><strong className="text-foreground">Department:</strong> {deletingWorker.department}</div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={() => setDeletingWorker(null)} className="flex-1 rounded-xl text-xs h-10">
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteWorker} className="flex-1 rounded-xl text-xs h-10 font-bold">
                Delete Worker
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
