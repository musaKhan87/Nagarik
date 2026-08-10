import React, { useState } from 'react';
import { Sparkles, MapPin, Camera, CheckCircle2, Navigation, Clock, LogOut, Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useComplaints } from '../context/ComplaintContext';
import { Button } from "../components/ui/button";
import { useAuth } from '../context/AuthContext';

export function WorkerDashboard() {
  const { complaints, resolveComplaint } = useComplaints();
  const { currentUser, logout } = useAuth();

  const [selectedTaskModal, setSelectedTaskModal] = useState(null);
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleProofPhotos = [
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600'
  ];

  const openResolutionModal = (task) => {
    setSelectedTaskModal(task);
    setProofPhotoUrl(sampleProofPhotos[0]);
    setErrorMsg('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitResolution = async () => {
    if (!proofPhotoUrl) {
      setErrorMsg('Please upload or provide a resolution proof photo.');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    try {
      const res = await resolveComplaint(selectedTaskModal._id, proofPhotoUrl);
      if (res.success) {
        setSelectedTaskModal(null);
        setProofPhotoUrl('');
      } else {
        setErrorMsg(res.message || 'Failed to submit resolution.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error marking complaint resolved.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-hero text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold">Nagarik</span>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] uppercase font-bold text-primary border border-primary/30">
              Field Worker Portal
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm text-primary-foreground font-bold shadow-sm">
              {currentUser?.name?.split(" ").map((n) => n[0]).join("") || "W"}
            </div>
            <Button onClick={logout} variant="outline" size="sm" className="rounded-full gap-1">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
        
        {/* Welcome Section */}
        <div>
          <div className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Field Operations</div>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-foreground">
            Hey Field Team 👷
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review assigned tasks, navigate to locations, and upload resolution proof photos.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { l: "Open Assigned Tasks", v: complaints.filter(c => c.status !== 'Resolved').length, c: "text-amber-500" },
            { l: "Resolved Issues", v: complaints.filter(c => c.status === 'Resolved').length, c: "text-emerald-500" },
            { l: "Avg. Resolution SLA", v: "2.4 Hours", c: "text-primary" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
              <div className={`font-display text-3xl font-extrabold ${s.c}`}>{s.v}</div>
              <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Task Cards */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground">Assigned Tasks ({complaints.length})</h2>

          {complaints.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
              No tasks currently assigned.
            </div>
          ) : (
            complaints.map((t) => (
              <div key={t._id} className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition hover:border-primary/40">
                <div className="p-5 sm:p-6 space-y-4">
                  
                  {/* Task Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        #{t._id.slice(-6)}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 font-bold uppercase ${
                        t.priority === "Critical" ? "bg-destructive/15 text-destructive border border-destructive/30" :
                        t.priority === "High" ? "bg-amber-500/15 text-amber-600 border border-amber-500/30" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {t.priority} SLA
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground font-medium">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>Assigned to you</span>
                    </div>
                  </div>

                  {/* Title & Photo */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-3 space-y-1">
                      <h3 className="font-display text-xl font-bold text-foreground">{t.issueType}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                      
                      {t.location?.address && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{t.location.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="relative h-28 w-full sm:w-28 rounded-2xl overflow-hidden bg-secondary">
                      <img src={t.photo} alt={t.issueType} className="h-full w-full object-cover" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${t.location?.coordinates ? `${t.location.coordinates[1]},${t.location.coordinates[0]}` : encodeURIComponent(t.location?.address || '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl border border-border bg-background hover:bg-secondary px-4 py-2.5 text-xs font-bold text-foreground transition"
                    >
                      <Navigation className="h-4 w-4 mr-1.5 text-primary" /> Navigate to Location
                    </a>

                    {t.status === 'Resolved' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> Issue Resolved
                      </span>
                    ) : (
                      <Button onClick={() => openResolutionModal(t)} className="gap-2 rounded-xl text-xs font-bold">
                        <Camera className="h-4 w-4" /> Upload Resolution Proof Photo
                      </Button>
                    )}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* WORKER PROOF PHOTO UPLOAD MODAL */}
      {selectedTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedTaskModal(null)}
              className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  Worker Proof Verification
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Upload Resolution Proof Photo
              </h2>
              <p className="text-xs text-muted-foreground">
                Task: {selectedTaskModal.issueType} (#{selectedTaskModal._id.slice(-6)})
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Proof Photo Upload Options */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-foreground">Resolution Proof Image</div>
              
              {/* Image Preview Box */}
              <div className="relative h-48 w-full overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/30 flex items-center justify-center">
                {proofPhotoUrl ? (
                  <img src={proofPhotoUrl} alt="Proof preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center space-y-2 text-muted-foreground p-4">
                    <ImageIcon className="mx-auto h-8 w-8 text-primary/60" />
                    <p className="text-xs">No image selected yet</p>
                  </div>
                )}
              </div>

              {/* Upload Input & Presets */}
              <div className="space-y-2">
                <label className="flex items-center justify-center gap-2 w-full rounded-xl border border-border bg-background hover:bg-secondary p-3 text-xs font-bold text-foreground cursor-pointer transition">
                  <Upload className="h-4 w-4 text-primary" />
                  <span>Choose Photo from Device</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">Or select demo proof photo:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {sampleProofPhotos.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProofPhotoUrl(url)}
                        className={`h-16 rounded-xl overflow-hidden border-2 transition ${
                          proofPhotoUrl === url ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedTaskModal(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={submitResolution} disabled={uploading || !proofPhotoUrl} className="rounded-xl gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{uploading ? "Submitting Proof..." : "Submit Proof & Mark Resolved"}</span>
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
