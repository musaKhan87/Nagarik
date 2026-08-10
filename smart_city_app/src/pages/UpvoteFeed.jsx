import React, { useState, useMemo } from 'react';
import { ThumbsUp, Search, MapPin, Sparkles, Filter, Flame, ShieldCheck, CheckCircle2, Zap, Layers, AlertCircle, Eye, X, Building2, Calendar, UserCheck } from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

export function UpvoteFeed() {
  const { complaints, upvoteComplaint, loading } = useComplaints();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('most_upvoted');
  const [upvotingIds, setUpvotingIds] = useState({});
  const [selectedComplaintModal, setSelectedComplaintModal] = useState(null);

  const categories = [
    { name: 'All', icon: '✨' },
    { name: 'Broken Road', icon: '🛣️' },
    { name: 'Garbage', icon: '🗑️' },
    { name: 'Street Light', icon: '💡' },
    { name: 'Waterlogging', icon: '💧' },
    { name: 'Illegal Dumping', icon: '🚛' },
    { name: 'Other', icon: '📌' }
  ];

  const handleUpvote = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert('Please log in to upvote complaints!');
      return;
    }

    setUpvotingIds(prev => ({ ...prev, [id]: true }));
    try {
      await upvoteComplaint(id);
    } catch (err) {
      console.error('Upvote error:', err);
    } finally {
      setUpvotingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const totalUpvotesCount = useMemo(() => {
    return complaints.reduce((sum, c) => sum + (c.upvoteCount || 0), 0);
  }, [complaints]);

  const activeIssuesCount = useMemo(() => {
    return complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchCat = selectedCategory === 'All' || c.issueType === selectedCategory;
      const matchSearch = search.trim() === '' || 
        c.issueType.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        (c.location?.address && c.location.address.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'most_upvoted') {
        return (b.upvoteCount || 0) - (a.upvoteCount || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      }
      if (sortBy === 'priority') {
        const pOrder = { Critical: 3, High: 2, Medium: 1, Low: 0 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      return 0;
    });
  }, [complaints, selectedCategory, search, sortBy]);

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Ultra-Premium Hero Banner Header */}
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-8 sm:p-14 shadow-2xl text-white">
          
          {/* Glowing Mesh Orbs & Light Leak Effects */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-amber-500/25 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

          {/* SVG Smart City Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 space-y-8 max-w-4xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-extrabold text-amber-300 backdrop-blur-md shadow-glow">
                <Flame className="h-4 w-4 animate-bounce text-amber-400" />
                <span>Community Escalation Engine</span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Community Grievance <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">Upvote Hub</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                Co-sign active issues reported by fellow citizens in your area. Higher upvote counts automatically escalate SLA dispatch priority for field response teams!
              </p>
            </div>

            {/* Glassmorphic Live Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              
              <div className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5 backdrop-blur-xl transition hover:border-amber-400/40 hover:bg-white/15 shadow-lg">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-display text-amber-300">
                    {totalUpvotesCount}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    Community Upvotes
                  </div>
                </div>
              </div>

              <div className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5 backdrop-blur-xl transition hover:border-sky-400/40 hover:bg-white/15 shadow-lg">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-display text-sky-300">
                    {activeIssuesCount}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    Active Issues
                  </div>
                </div>
              </div>

              <div className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5 backdrop-blur-xl transition hover:border-emerald-400/40 hover:bg-white/15 shadow-lg">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-300">
                    98.4%
                  </div>
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    SLA Priority Boost
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by area, road, or issue category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition cursor-pointer"
            >
              <option value="most_upvoted">🔥 Most Upvoted</option>
              <option value="newest">🕒 Newest First</option>
              <option value="priority">⚡ Highest SLA Priority</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat.name
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20 scale-105"
                  : "border border-border/80 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Complaint Cards Feed */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Sparkles className="mx-auto h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-muted-foreground">Fetching community grievances near you...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-4">
            <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="font-display text-xl font-bold text-foreground">No active grievances found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              There are currently no active complaints matching your search criteria. You can submit a new report anytime!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map((c) => {
              const isUpvoting = !!upvotingIds[c._id];
              const isResolved = c.status === 'Resolved' || c.status === 'Closed';
              const upvoteCount = c.upvoteCount || 0;
              const hasUserUpvoted = currentUser && c.upvotes?.some(u => u.userId === currentUser._id || u.userId === currentUser.id);

              return (
                <div
                  key={c._id}
                  onClick={() => setSelectedComplaintModal(c)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl cursor-pointer"
                >
                  <div className="space-y-4">
                    
                    {/* Image Header with Badge Overlays */}
                    <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-secondary/50">
                      <img
                        src={c.photo}
                        alt={c.issueType}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md ${
                          c.status === 'Resolved'
                            ? "bg-emerald-600 text-white"
                            : c.status === 'In Progress'
                            ? "bg-amber-500 text-white"
                            : "bg-primary text-primary-foreground"
                        }`}>
                          {c.status || 'Submitted'}
                        </span>

                        <span className="rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white flex items-center gap-1">
                          <Zap className="h-3 w-3 text-amber-400" />
                          <span>{c.priority || 'Medium'} SLA</span>
                        </span>
                      </div>

                      {/* Upvote Pill Badge Overlay */}
                      <div className="absolute bottom-3 right-3 rounded-full bg-black/75 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-400 flex items-center gap-1.5 shadow-lg">
                        <Flame className="h-3.5 w-3.5 text-amber-400" />
                        <span>{upvoteCount} Upvotes</span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition">
                          {c.issueType}
                        </h3>
                        <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                          #{c._id.slice(-6)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    {/* Location Pin */}
                    {c.location?.address && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground pt-1">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{c.location.address}</span>
                      </div>
                    )}
                  </div>

                  {/* PROMINENT HERO UPVOTE BUTTON */}
                  <div className="mt-6 pt-4 border-t border-border/60">
                    <button
                      type="button"
                      onClick={(e) => handleUpvote(e, c._id)}
                      disabled={isUpvoting || isResolved}
                      className={`w-full flex items-center justify-center gap-2.5 rounded-2xl py-3 px-4 text-xs font-bold transition-all duration-200 shadow-md ${
                        isResolved
                          ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
                          : hasUserUpvoted
                          ? "bg-emerald-600/15 border border-emerald-500/40 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                          : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-glow"
                      }`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${isUpvoting ? "animate-bounce" : ""}`} />
                      <span>
                        {isResolved
                          ? "Issue Resolved"
                          : hasUserUpvoted
                          ? `Upvoted (${upvoteCount}) • Boost Active!`
                          : `Upvote & Boost Urgency (${upvoteCount})`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Modal Drawer */}
        {selectedComplaintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedComplaintModal(null)}
                className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {selectedComplaintModal.issueType}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    #{selectedComplaintModal._id}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Grievance Details & Upvotes
                </h2>
              </div>

              {/* Modal Photo */}
              <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-secondary">
                <img
                  src={selectedComplaintModal.photo}
                  alt={selectedComplaintModal.issueType}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-border/70 p-3 space-y-1 bg-background/50">
                  <div className="text-muted-foreground flex items-center gap-1 font-semibold">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span>Assigned Dept</span>
                  </div>
                  <div className="font-bold text-foreground">
                    {selectedComplaintModal.assignedDept || 'City Infrastructure'}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 p-3 space-y-1 bg-background/50">
                  <div className="text-muted-foreground flex items-center gap-1 font-semibold">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                    <span>Total Support</span>
                  </div>
                  <div className="font-bold text-foreground">
                    {selectedComplaintModal.upvoteCount || 0} Citizen Upvotes
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</div>
                <p className="text-sm text-foreground leading-relaxed rounded-2xl bg-secondary/30 p-4 border border-border/60">
                  {selectedComplaintModal.description}
                </p>
              </div>

              {/* Location Address */}
              {selectedComplaintModal.location?.address && (
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-primary/5 p-3 rounded-2xl border border-primary/20">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>{selectedComplaintModal.location.address}</span>
                </div>
              )}

              {/* Action Upvote inside Modal */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => handleUpvote(e, selectedComplaintModal._id)}
                  disabled={selectedComplaintModal.status === 'Resolved'}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 px-4 text-sm font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Upvote This Issue (+1 Priority)</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
