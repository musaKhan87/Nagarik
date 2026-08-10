import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import {
  Map, BarChart2, Filter, Search, ArrowUpRight, ChevronRight,
  MapPin, UserPlus, Users, Sparkles, Plus, AlertCircle, Eye, Settings2, Trash2
} from 'lucide-react';
import api from '../api';
import { useComplaints } from '../context/ComplaintContext';
import { MapView } from '../components/MapView';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AdminShell, AccessDenied, PageHeader } from '../components/admin/admin-shell';
import { useAdminRole, ROLE_META } from '../lib/admin-role';

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
        <div className="flex items-center justify-between p-6">
          <div>
            <div className="font-display text-xl">Recent complaints</div>
            <div className="text-xs text-muted-foreground">Auto-routed to departments · assign or escalate</div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/complaints')}>View all <ChevronRight className="ml-1 h-4 w-4" /></Button>
        </div>
        <div className="overflow-x-auto">
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
                const assignedWorker = workers.find(w => w._id === c.assignedWorker);
                return (
                  <tr key={c._id} className="border-t border-border transition hover:bg-secondary/40">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground truncate max-w-[120px]">#{c._id}</td>
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
                        <Button onClick={() => setSelectedComplaint(c)} size="sm" className="rounded-full">
                          Assign
                        </Button>
                      ) : (
                        <span className="text-xs">{assignedWorker ? assignedWorker.name : 'Assigned'}</span>
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
// COMPLAINTS SUBPAGE
// ────────────────────────────────────────────────────────────────
function ComplaintsView({ complaints, workers, setSelectedComplaint }) {
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [filterDept, setFilterDept] = useState("");

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
      q ? [c.description, c.issueType, c._id].some((v) => v?.toLowerCase().includes(q.toLowerCase())) : true
    );

  return (
    <>
      <PageHeader eyebrow="Records & SLA Tracking" title="Complaints directory" subtitle="Manage complaints, monitor SLA deadlines, assign field workers, and track resolution.">
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filters</Button>
      </PageHeader>

      {/* SLA Breach Banner */}
      {breachedComplaints.length > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-destructive text-destructive-foreground font-bold shadow-md animate-pulse">
              🚨
            </div>
            <div>
              <div className="font-extrabold text-destructive text-sm">
                {breachedComplaints.length} Complaint(s) Have Breached SLA Deadlines!
              </div>
              <div className="text-muted-foreground">
                Urgent action required: Assign available field workers immediately to fulfill SLA commitments.
              </div>
            </div>
          </div>
          <Button size="sm" variant="destructive" onClick={() => setTab("🚨 SLA Breached")} className="rounded-xl">
            View Breached ({breachedComplaints.length})
          </Button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by ID, description..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All Departments</option>
          <option value="Roads & Infrastructure Dept">Roads & Infrastructure Dept</option>
          <option value="Sanitation Dept">Sanitation Dept</option>
          <option value="Electricity Dept">Electricity Dept</option>
          <option value="Water Supply Dept">Water Supply Dept</option>
        </select>
        <div className="flex flex-wrap gap-1 rounded-full border border-border bg-card p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                tab === t 
                  ? t.includes('Breached') ? "bg-destructive text-destructive-foreground shadow-sm" : "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                {["ID", "Issue", "Category", "SLA Target", "Severity", "Status", "Assigned"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const assignedWorker = workers.find(w => w._id?.toString() === (c.assignedWorker?._id || c.assignedWorker)?.toString());
                const isBreached = c.status !== 'Resolved' && (c.isSLABreached || (c.deadline && new Date(c.deadline) < now));
                
                // Calculate hours remaining or overdue
                let slaBadge = null;
                if (c.deadline) {
                  const diffHours = Math.round((new Date(c.deadline) - now) / (1000 * 60 * 60));
                  if (isBreached || diffHours < 0) {
                    slaBadge = <span className="rounded-full bg-destructive/15 text-destructive border border-destructive/30 px-2.5 py-0.5 text-[10px] font-extrabold animate-pulse">🚨 Breached ({Math.abs(diffHours)}h ago)</span>;
                  } else if (diffHours <= 6) {
                    slaBadge = <span className="rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-extrabold">⏱️ {diffHours}h remaining</span>;
                  } else {
                    slaBadge = <span className="rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold">⏱️ {diffHours}h target</span>;
                  }
                }

                return (
                  <tr key={c._id} className="border-t border-border transition hover:bg-secondary/40">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground truncate max-w-[120px]">#{c._id}</td>
                    <td className="px-6 py-4 font-medium">{c.description}</td>
                    <td className="px-6 py-4 text-muted-foreground">{c.issueType}</td>
                    <td className="px-6 py-4">{slaBadge || <span className="text-xs text-muted-foreground">Standard</span>}</td>
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
                        <Button onClick={() => setSelectedComplaint(c)} size="sm" className="rounded-full">
                          Assign
                        </Button>
                      ) : (
                        <span className="text-xs">{assignedWorker ? assignedWorker.name : 'Assigned'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">No complaints match your selection.</td>
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
// HEATMAP SUBPAGE
// ────────────────────────────────────────────────────────────────
function HeatmapView({ complaints }) {
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  const stats = [
    { w: "Vashi Sector 15", c: complaints.filter(c => c.address?.includes("Vashi")).length },
    { w: "Kharghar", c: complaints.filter(c => c.address?.includes("Kharghar")).length },
    { w: "Belapur", c: complaints.filter(c => c.address?.includes("Belapur")).length },
    { w: "Nerul", c: complaints.filter(c => c.address?.includes("Nerul")).length },
  ].sort((a,b) => b.c - a.c);

  return (
    <>
      <PageHeader eyebrow="Geospatial" title="City heatmap" subtitle="Real-time geo-coordinates mapping of complaints."></PageHeader>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <MapView complaints={complaints} height="520px" onPointClick={setSelectedHotspot} />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="font-display text-xl">Hotspot areas</div>
          <div className="text-xs text-muted-foreground">By volume (30d)</div>
          <div className="mt-5 space-y-3">
            {stats.map((w) => {
              const max = stats[0].c || 1;
              const pct = (w.c / max) * 100;
              return (
                <div key={w.w}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{w.w}</span>
                    <span className="text-muted-foreground">{w.c} complaints</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {selectedHotspot && (
            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs">
              <div className="font-medium text-foreground">Selected complaint detail</div>
              <div className="mt-2 text-muted-foreground">
                <span className="font-bold">Type:</span> {selectedHotspot.issueType} <br/>
                <span className="font-bold">Address:</span> {selectedHotspot.address} <br/>
                <span className="font-bold">Description:</span> {selectedHotspot.description}
              </div>
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
function WorkersView({ workers, complaints, onAddWorker }) {
  return (
    <>
      <PageHeader eyebrow="Roster" title="Field workers" subtitle="Assign tasks, monitor workload, and review active tasks.">
        <Button onClick={onAddWorker} className="gap-2"><UserPlus className="h-4 w-4" /> Add worker</Button>
      </PageHeader>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {workers.map((w) => {
          const wId = w._id?.toString();
          const activeTasks = complaints.filter(c => (c.assignedWorker?._id || c.assignedWorker)?.toString() === wId && c.status === 'In Progress').length;
          const resolvedTasks = complaints.filter(c => (c.assignedWorker?._id || c.assignedWorker)?.toString() === wId && c.status === 'Resolved').length;
          return (
            <div key={w._id} className="rounded-3xl border border-border bg-card p-5 shadow-elev">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-hero font-display text-sm text-white font-bold shrink-0">
                  {w.name ? w.name.split(" ").map((n) => n[0]).join("") : "W"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground">{w.name}</div>
                  <div className="text-xs text-muted-foreground">{w.department || 'General Duty'}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-border bg-surface p-3">
                  <div className="text-muted-foreground">Active</div>
                  <div className="mt-1 font-display text-xl text-primary">{activeTasks}</div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-3">
                  <div className="text-muted-foreground">Resolved</div>
                  <div className="mt-1 font-display text-xl text-success">{resolvedTasks}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="text-xs text-muted-foreground truncate flex-1">
                  📞 {w.phone || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground truncate flex-1 text-right">
                  ✉️ {w.email || 'N/A'}
                </div>
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
  const { complaints, assignWorker } = useComplaints();
  const [workers, setWorkers] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignedWorkerId, setAssignedWorkerId] = useState('');

  // Add Worker Modal State
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [wName, setWName] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wDept, setWDept] = useState('Roads & Infrastructure Dept');

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
      await api.post('/admin/workers', {
        name: wName,
        phone: wPhone,
        department: wDept
      });
      setShowAddWorker(false);
      setWName('');
      setWPhone('');
      fetchWorkers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create worker');
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={
          <AdminShell>
            <OverviewView complaints={complaints} workers={workers} setSelectedComplaint={setSelectedComplaint} />
          </AdminShell>
        } />
        <Route path="/complaints" element={
          <AdminShell>
            <ComplaintsView complaints={complaints} workers={workers} setSelectedComplaint={setSelectedComplaint} />
          </AdminShell>
        } />
        <Route path="/heatmap" element={
          <AdminShell>
            <HeatmapView complaints={complaints} />
          </AdminShell>
        } />
        <Route path="/workers" element={
          <AdminShell>
            <WorkersView workers={workers} complaints={complaints} onAddWorker={() => setShowAddWorker(true)} />
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
      
      {/* Assign Modal Wrapper */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6 backdrop-blur-sm">
          <form onSubmit={handleAssign} className="glass-panel p-8 rounded-3xl border border-border max-w-md w-full shadow-2xl space-y-4 bg-card">
            <h3 className="font-display text-xl font-bold text-foreground">Assign field worker</h3>
            <p className="text-muted-foreground text-xs">Choose a verified field worker to assign the resolution of complaint.</p>

            <div>
              <label className="block text-xs text-muted-foreground uppercase mb-1">Select worker</label>
              <select value={assignedWorkerId} onChange={e => setAssignedWorkerId(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">-- Choose Worker --</option>
                {workers.map(w => (
                  <option key={w._id} value={w._id}>{w.name} ({w.department})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 mt-6">
              <Button type="submit" disabled={!assignedWorkerId} className="flex-1 rounded-full">
                Confirm
              </Button>
              <Button type="button" variant="outline" onClick={() => { setSelectedComplaint(null); setAssignedWorkerId(''); }} className="flex-1 rounded-full">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddWorker && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6 backdrop-blur-sm">
          <form onSubmit={handleCreateWorker} className="glass-panel p-8 rounded-3xl border border-border max-w-md w-full shadow-2xl space-y-4 bg-card">
            <h3 className="font-display text-xl font-bold text-foreground">Add new field worker</h3>
            <p className="text-muted-foreground text-xs">Create an account for a new municipal field worker.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground uppercase mb-1">Full name</label>
                <Input value={wName} onChange={e => setWName(e.target.value)} required placeholder="e.g. Ramesh Shinde" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase mb-1">Phone number</label>
                <Input value={wPhone} onChange={e => setWPhone(e.target.value)} required placeholder="e.g. 9876543219" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase mb-1">Department</label>
                <select value={wDept} onChange={e => setWDept(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="Roads & Infrastructure Dept">Roads & Infrastructure Dept</option>
                  <option value="Sanitation Dept">Sanitation Dept</option>
                  <option value="Electricity Dept">Electricity Dept</option>
                  <option value="Water Supply Dept">Water Supply Dept</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button type="submit" className="flex-1 rounded-full">
                Create worker
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddWorker(false)} className="flex-1 rounded-full">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
