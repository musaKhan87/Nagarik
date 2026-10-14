import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Search, CheckCircle2, Star, Clock, ShieldCheck, Sparkles, Building2, User, MessageSquare, Award, Heart, ThumbsUp, Zap } from 'lucide-react';
import api from '../api';
import { useComplaints } from '../context/ComplaintContext';
import { StarRating } from '../components/StarRating';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const STATUS_COLORS = {
  Pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Submitted: "bg-primary/15 text-primary border-primary/30",
  "Under Review": "bg-sky-500/15 text-sky-600 border-sky-500/30",
  "In Progress": "bg-indigo-500/15 text-indigo-600 border-indigo-500/30",
  Resolved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
  Closed: "bg-secondary text-muted-foreground border-border",
};

export function TrackComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { submitFeedback } = useComplaints();

  const [complaintId, setComplaintId] = useState(id || '');
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [sendingKudos, setSendingKudos] = useState(false);
  const [kudosSuccess, setKudosSuccess] = useState(false);

  const fetchDetail = async (searchId) => {
    if (!searchId) return;
    setLoading(true);
    try {
      const response = await api.get(`/complaints/${searchId}`);
      setActiveComplaint(response.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Complaint not found');
      setActiveComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail(id);
    }
  }, [id]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !activeComplaint) return;
    
    setSubmittingFeedback(true);
    try {
      const res = await submitFeedback(activeComplaint._id || activeComplaint.id, rating, comment);
      if (res.success) {
        setFeedbackSuccess(true);
        fetchDetail(activeComplaint._id || activeComplaint.id);
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSendKudos = async () => {
    if (!activeComplaint) return;
    setSendingKudos(true);
    try {
      const resp = await api.post(`/complaints/${activeComplaint._id || activeComplaint.id}/kudos`);
      if (resp.data?.success) {
        setKudosSuccess(true);
        fetchDetail(activeComplaint._id || activeComplaint.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send appreciation');
    } finally {
      setSendingKudos(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 bg-background text-foreground">
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-border shadow-2xl bg-card space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Real-Time Grievance Tracker</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Track Grievance Status</h1>
          <p className="text-xs text-muted-foreground">Enter your complaint ID to view resolution proof photos & submit 1–5 star ratings.</p>
        </div>

        {/* Search Input Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              value={complaintId} 
              onChange={e => setComplaintId(e.target.value)} 
              placeholder="Enter Complaint ID (e.g. 64b8f...)" 
              className="pl-10 rounded-2xl" 
            />
          </div>
          <Button onClick={() => fetchDetail(complaintId)} className="rounded-2xl px-6">
            Search
          </Button>
        </div>

        {loading && <div className="text-center py-8 text-sm text-muted-foreground animate-pulse">Retrieving complaint status...</div>}

        {activeComplaint && !loading && (
          <div className="space-y-8">
            
            {/* Status Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-6">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground block mb-0.5">Category</span>
                <h3 className="text-2xl font-extrabold text-foreground">{activeComplaint.issueType}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_COLORS[activeComplaint.status] || 'bg-secondary'}`}>
                  {activeComplaint.status}
                </span>
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-xl">
                  #{activeComplaint._id.slice(-6)}
                </span>
              </div>
            </div>

            {/* Timeline Progress */}
            <div className="space-y-3 bg-secondary/30 p-5 rounded-2xl border border-border/60">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status Timeline</h4>
              <div className="flex items-center justify-between gap-2 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-primary">
                  <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20" />
                  <span>Submitted</span>
                </div>
                <div className="h-[2px] bg-border flex-grow" />
                <div className={`flex items-center gap-1.5 ${['In Progress', 'Resolved'].includes(activeComplaint.status) ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-3 h-3 rounded-full ${['In Progress', 'Resolved'].includes(activeComplaint.status) ? 'bg-primary ring-4 ring-primary/20' : 'bg-border'}`} />
                  <span>In Progress</span>
                </div>
                <div className="h-[2px] bg-border flex-grow" />
                <div className={`flex items-center gap-1.5 ${activeComplaint.status === 'Resolved' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                  <div className={`w-3 h-3 rounded-full ${activeComplaint.status === 'Resolved' ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-border'}`} />
                  <span>Resolved</span>
                </div>
              </div>
            </div>

            {/* Photos Section — Before & After comparison */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {activeComplaint.resolvedPhoto ? "Resolution Proof — Before & After" : "Report Photo"}
              </h4>

              <div className={`grid gap-4 ${activeComplaint.resolvedPhoto ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                
                {/* Before Photo */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <span>🔴 Initial Complaint Photo</span>
                  </span>
                  <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-secondary shadow-sm">
                    <img src={activeComplaint.photo} alt="Initial complaint photo" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* After Resolution Photo */}
                {activeComplaint.resolvedPhoto && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>🟢 Worker Resolution Proof Photo</span>
                    </span>
                    <div className="aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-secondary shadow-sm">
                      <img src={activeComplaint.resolvedPhoto} alt="Resolution proof" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Department & Priority Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-card p-4 rounded-2xl border border-border/80">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Assigned Department</span>
                <span className="font-extrabold text-foreground flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  {activeComplaint.assignedDept || 'General Dept'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Priority Level</span>
                <span className="font-extrabold text-foreground">{activeComplaint.priority || 'Medium'} SLA</span>
              </div>
            </div>

            {/* Location Address */}
            {activeComplaint.location?.address && (
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-secondary/40 p-3.5 rounded-2xl border border-border/60">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{activeComplaint.location.address}</span>
              </div>
            )}

            {/* WORKER RECOGNITION & SPEED APPRECIATION CARD */}
            {activeComplaint.status === 'Resolved' && (
              <div className="rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-amber-500/5 p-5 sm:p-6 shadow-md space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 shadow-sm">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                        <span>Worker Recognition & Appreciation</span>
                        {activeComplaint.resolutionDetails?.isEarly && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                            Early Resolution ⚡
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">Recognizing dedication and rapid response in civic field service</p>
                    </div>
                  </div>
                  {activeComplaint.resolutionDetails?.speedBadge && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-600 border border-amber-500/30 shadow-sm">
                      <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {activeComplaint.resolutionDetails.speedBadge}
                    </span>
                  )}
                </div>

                {/* Worker Profile & Speed Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-3 bg-card/90 p-3.5 rounded-2xl border border-border/80 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm uppercase shrink-0">
                      {(activeComplaint.resolutionDetails?.workerName || activeComplaint.assignedWorker?.name || 'W').charAt(0)}
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">Resolved By Field Worker</div>
                      <div className="font-extrabold text-foreground text-sm">
                        {activeComplaint.resolutionDetails?.workerName || activeComplaint.assignedWorker?.name || 'Field Officer'}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-primary" />
                        {activeComplaint.resolutionDetails?.workerDepartment || activeComplaint.assignedDept || 'Municipal Field Team'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/90 p-3.5 rounded-2xl border border-border/80 shadow-sm flex flex-col justify-center space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Time Taken:</span>
                      <span className="font-extrabold text-foreground">
                        {activeComplaint.resolutionDetails?.resolutionTimeHours !== undefined 
                          ? `${activeComplaint.resolutionDetails.resolutionTimeHours} hrs`
                          : 'Promptly'}
                      </span>
                    </div>
                    {activeComplaint.resolutionDetails?.aheadOfTimeHours > 0 ? (
                      <div className="flex items-center justify-between text-[11px] text-emerald-600 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                        <span>Ahead of SLA Deadline:</span>
                        <span>+{activeComplaint.resolutionDetails.aheadOfTimeHours}h Saved 🚀</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-muted-foreground italic">
                        Completed within standard SLA response time
                      </div>
                    )}
                  </div>
                </div>

                {/* Appreciation Note */}
                {activeComplaint.resolutionDetails?.appreciationNote && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>"{activeComplaint.resolutionDetails.appreciationNote}"</span>
                  </div>
                )}

                {/* Citizen Kudos Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                    <span className="font-extrabold text-foreground">
                      {activeComplaint.resolutionDetails?.citizenKudosCount || 0}
                    </span>
                    <span>citizens applauded this worker</span>
                  </div>

                  <Button
                    onClick={handleSendKudos}
                    disabled={sendingKudos || kudosSuccess}
                    size="sm"
                    className="rounded-2xl gap-1.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{kudosSuccess ? "Appreciation Sent! 💖" : "Send Worker Kudos 👏"}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* CITIZEN 1-5 STAR RATING & FEEDBACK SECTION */}
            {activeComplaint.status === 'Resolved' && (
              <div className="border-t border-border/80 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-foreground">Rate Issue Resolution</h4>
                    <p className="text-xs text-muted-foreground">Rate your satisfaction with the field worker's resolution proof.</p>
                  </div>
                </div>

                {activeComplaint.feedback ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarRating rating={activeComplaint.feedback.rating} readOnly />
                        <span className="text-xs font-bold text-emerald-600">{activeComplaint.feedback.rating}/5 Stars</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Verified Citizen Rating</span>
                    </div>

                    {activeComplaint.feedback.comment && (
                      <p className="text-xs text-foreground italic bg-card/60 p-3 rounded-xl border border-emerald-500/20">
                        "{activeComplaint.feedback.comment}"
                      </p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground">Select Rating (1 to 5 Stars):</label>
                      <StarRating rating={rating} onChange={setRating} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Comments / Feedback (Optional):</label>
                      <Textarea 
                        value={comment} 
                        onChange={e => setComment(e.target.value)} 
                        rows={3} 
                        className="w-full rounded-xl text-xs" 
                        placeholder="Was the issue resolved to your satisfaction?" 
                      />
                    </div>

                    <Button type="submit" disabled={!rating || submittingFeedback} className="rounded-xl w-full gap-2">
                      <Star className="h-4 w-4 fill-primary-foreground" />
                      <span>{submittingFeedback ? "Submitting Rating..." : "Submit Citizen Rating"}</span>
                    </Button>
                  </form>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
