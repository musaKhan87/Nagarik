import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, MapPin, Sparkles, CheckCircle2, ArrowRight, Layers, Check, ShieldAlert, Lock } from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { CameraCapture } from '../components/CameraCapture';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const CATEGORIES = ["Broken Road", "Garbage", "Street Light", "Waterlogging", "Illegal Dumping", "Other"];
const SEVERITIES = ["Critical", "High", "Medium", "Low"];

export function ReportIssue() {
  const { currentUser } = useAuth();
  const { createComplaint, createComplaintsBatch, upvoteComplaint } = useComplaints();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [image, setImage] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ lat: 19.076, lng: 72.877, address: 'Vashi, Sector 15, Navi Mumbai' });
  const [priority, setPriority] = useState('Medium');
  const [confidence, setConfidence] = useState(null);
  const [detectedIssues, setDetectedIssues] = useState([]);
  const [selectedIssues, setSelectedIssues] = useState([]);

  // Anti-Spam Fake Image Validation State
  const [isValidComplaint, setIsValidComplaint] = useState(true);
  const [rejectionReason, setRejectionReason] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [trackingIds, setTrackingIds] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateComplaint, setDuplicateComplaint] = useState(null);

  useEffect(() => {
    const preCat = searchParams.get('category');
    if (preCat) setIssueType(preCat);
  }, [searchParams]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: `Captured Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
          });
        }
      );
    }
  }, []);

  const handleCapture = (photoData, result) => {
    setImage(photoData);
    if (photoData && result) {
      setIssueType(result.issueType || 'Broken Road');
      setConfidence(result.confidence);
      setPriority(result.priority || 'Medium');

      if (result.isValidComplaint === false) {
        setIsValidComplaint(false);
        setRejectionReason(result.rejectionReason || 'Invalid photo detected.');
        setDetectedIssues([]);
        setSelectedIssues([]);
      } else {
        setIsValidComplaint(true);
        setRejectionReason(null);
        if (result.detectedIssues && result.detectedIssues.length > 0) {
          setDetectedIssues(result.detectedIssues);
          setSelectedIssues(result.detectedIssues.map(i => i.issueType));
        } else {
          const fallback = [{ issueType: result.issueType || 'Broken Road', confidence: result.confidence || 85, priority: result.priority || 'Medium' }];
          setDetectedIssues(fallback);
          setSelectedIssues([result.issueType || 'Broken Road']);
        }
      }
    } else {
      setIsValidComplaint(true);
      setRejectionReason(null);
    }
  };

  const toggleIssueSelection = (type) => {
    if (selectedIssues.includes(type)) {
      if (selectedIssues.length === 1) return; // keep at least 1 selected
      setSelectedIssues(selectedIssues.filter(t => t !== type));
    } else {
      setSelectedIssues([...selectedIssues, type]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!image || (!issueType && selectedIssues.length === 0) || !description) {
      alert('Please snap/upload a photo, select issue type(s), and describe the issue.');
      return;
    }

    setSubmitting(true);

    // Multiple issues auto-split flow
    if (selectedIssues.length > 1) {
      const batchPayload = selectedIssues.map(type => {
        const det = detectedIssues.find(d => d.issueType === type);
        return {
          issueType: type,
          description: `[Auto-Split Complaint] ${description}`,
          photo: image,
          lat: location.lat,
          lng: location.lng,
          address: location.address,
          priority: det?.priority || priority
        };
      });

      const res = await createComplaintsBatch(batchPayload);
      setSubmitting(false);

      if (res.success && res.results) {
        const ids = res.results.map(r => r.trackingId || r.complaintId || r.complaint?._id).filter(Boolean);
        setTrackingIds(ids);
        setStep(3);
      } else {
        alert(res.message || 'Error submitting complaints');
      }
    } else {
      // Single issue flow
      const targetType = selectedIssues[0] || issueType;
      const res = await createComplaint({
        issueType: targetType,
        description,
        photo: image,
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        priority
      });
      setSubmitting(false);

      if (res.isDuplicate) {
        setDuplicateComplaint(res.complaint);
        setShowDuplicateModal(true);
      } else if (res.trackingId || res.complaintId) {
        setTrackingIds([res.trackingId || res.complaintId]);
        setStep(3);
      } else {
        alert(res.message || 'Submission error');
      }
    }
  };

  const handleUpvoteDuplicate = async () => {
    if (duplicateComplaint) {
      await upvoteComplaint(duplicateComplaint._id);
      setShowDuplicateModal(false);
      navigate('/dashboard');
    }
  };

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:py-20 bg-background text-foreground">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/80 bg-card p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-center">
          {/* Background Ambient Glows */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

          {/* Glowing Lock Badge Icon */}
          <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-hero text-white shadow-glow mb-6">
            <ShieldAlert className="h-9 w-9 text-white" />
            <span className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-foreground text-xs font-bold border-2 border-card">
              !
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3.5 py-1 text-xs font-bold text-primary mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Nagarik Citizen Portal</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Sign In to File Report
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            To prevent spam and ensure field crews can dispatch directly to your location, please sign in or create an account first.
          </p>

          {/* Value Props List */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left text-xs font-semibold">
            <div className="rounded-2xl border border-border/60 bg-surface/80 p-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
              <span>AI Auto-Routing</span>
            </div>
            <div className="rounded-2xl border border-border/60 bg-surface/80 p-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
              <span>GIS Pinning</span>
            </div>
            <div className="rounded-2xl border border-border/60 bg-surface/80 p-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success shrink-0" />
              <span>SLA Alerts</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={() => navigate('/login', { state: { from: '/report' } })}
              size="lg"
              className="w-full rounded-full font-bold shadow-elev py-6 text-sm gap-2"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => navigate('/login', { state: { from: '/report', tab: 'signup' } })}
              variant="outline"
              size="lg"
              className="w-full rounded-full font-bold py-6 text-sm"
            >
              Create New Citizen Account
            </Button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="mt-6 text-xs text-muted-foreground hover:text-foreground font-semibold transition"
          >
            ← Return to Home Page
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 bg-background text-foreground">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-elev">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success text-success-foreground">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-4xl text-foreground">
            {trackingIds.length > 1 ? `${trackingIds.length} Complaints Filed!` : 'Complaint filed.'}
          </h1>
          
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {trackingIds.length > 1 
                ? "Our AI detected multiple issues and automatically generated separate tickets for each municipal department:" 
                : "Tracking ID registered on spatial grid:"}
            </p>

            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {trackingIds.map((id, idx) => (
                <span key={id} className="rounded-xl border border-border bg-surface px-4 py-2 font-mono text-sm font-bold text-primary">
                  Ticket #{id}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Field crews for the respective departments have been dispatched concurrently with your photo & GPS pin.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate('/dashboard')} size="lg" className="rounded-full">
              Go to Dashboard <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-full" onClick={() => { setStep(1); setImage(''); setIssueType(''); setDescription(''); setDetectedIssues([]); setSelectedIssues([]); }}>
              Report another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 bg-background text-foreground">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Report an issue</div>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl text-foreground">Tell us what's broken.</h1>
      <p className="mt-2 text-muted-foreground">Under a minute. Under three steps.</p>

      {/* Stepper */}
      <div className="mt-8 flex items-center gap-2">
        {[1, 2].map((n) => (
          <div key={n} className="flex flex-1 items-center gap-3">
            <div className={`grid h-8 w-8 place-items-center rounded-full text-sm font-medium ${step >= n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{n}</div>
            <div className={`h-px flex-1 ${step > n ? "bg-primary" : "bg-border"}`} />
          </div>
        ))}
        <div className={`grid h-8 w-8 place-items-center rounded-full text-sm font-medium ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>3</div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          {step === 1 && (
            <>
              <h2 className="font-display text-2xl text-foreground">1 · Capture the issue</h2>
              <p className="mt-1 text-sm text-muted-foreground">Camera or upload. AI will classify it automatically.</p>

              <div className="mt-6">
                <CameraCapture onCapture={handleCapture} initialImage={image} />
              </div>

              {/* Anti-Spam Rejection Warning Banner */}
              {!isValidComplaint && (
                <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Photo Rejected by Anti-Spam Shield</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rejectionReason || "No valid civic infrastructure issue detected. Selfies, indoor photos, and irrelevant images are rejected."}
                  </p>
                </div>
              )}

              {/* Detected Issues Banner */}
              {isValidComplaint && detectedIssues.length > 0 && (
                <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                      <Sparkles className="h-4 w-4" />
                      <span>{detectedIssues.length > 1 ? "AI Multi-Issue Auto-Split Detected!" : "AI Classification Complete"}</span>
                    </div>
                    {detectedIssues.length > 1 && (
                      <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        Auto-Split Enabled
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {detectedIssues.length > 1 
                      ? "Multiple civic issues were detected in this photo. Both departments will be dispatched concurrently:"
                      : `Detected: ${detectedIssues[0].issueType} (${detectedIssues[0].confidence}% match)`}
                  </p>

                  {/* Multi Issue Selection Pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {detectedIssues.map((item) => {
                      const isSel = selectedIssues.includes(item.issueType);
                      return (
                        <button
                          key={item.issueType}
                          type="button"
                          onClick={() => toggleIssueSelection(item.issueType)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                            isSel
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : "border-border bg-card text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {isSel && <Check className="h-3.5 w-3.5" />}
                          <span>{item.issueType}</span>
                          <span className="opacity-80 text-[10px]">({item.confidence}%)</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button size="lg" className="rounded-full" disabled={!image || !isValidComplaint} onClick={() => setStep(2)}>
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-2xl text-foreground">2 · Add the details</h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Location is auto-captured. Provide issue details below.</p>

              <div className="mt-5 space-y-4">
                {selectedIssues.length > 1 ? (
                  <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3.5 sm:p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                      <Layers className="h-4 w-4 shrink-0" />
                      <span>AI Department Auto-Split Routing ({selectedIssues.length} Complaints)</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                      {selectedIssues.map(t => {
                        const dept = t.includes('Road') || t.includes('Pothole') || t.includes('Traffic') ? '🛣️ Roads & Infra'
                          : t.includes('Garbage') || t.includes('Waterlogging') || t.includes('Dumping') || t.includes('Drain') || t.includes('Sewage') ? '🗑️ Sanitation Dept'
                          : t.includes('Light') ? '💡 Electricity Dept'
                          : t.includes('Water') ? '💧 Water Supply'
                          : '🏢 General Dept';
                        return (
                          <span key={t} className="flex items-center gap-1.5 rounded-xl bg-card px-2.5 py-1 text-xs font-bold text-foreground border border-border shadow-sm">
                            <span>{t}</span>
                            <span className="text-primary font-mono text-[10px]">({dept})</span>
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Each complaint will be auto-routed to its designated department with concurrent dispatch.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Category *</Label>
                    <Select value={selectedIssues[0] || issueType} onValueChange={(val) => { setIssueType(val); setSelectedIssues([val]); }}>
                      <SelectTrigger className="mt-1.5 h-11 rounded-2xl text-xs sm:text-sm"><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    
                    {/* Auto-Routing Badge Indicator */}
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-xs text-primary font-bold">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        Auto-Routing to: {" "}
                        <strong className="text-foreground font-extrabold">
                          {(selectedIssues[0] || issueType).includes('Road') || (selectedIssues[0] || issueType).includes('Pothole') ? '🛣️ Roads & Infrastructure Dept'
                            : (selectedIssues[0] || issueType).includes('Garbage') || (selectedIssues[0] || issueType).includes('Waterlogging') || (selectedIssues[0] || issueType).includes('Dumping') ? '🗑️ Sanitation Dept'
                            : (selectedIssues[0] || issueType).includes('Light') ? '💡 Electricity Dept'
                            : '🏢 General Dept'}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Severity *</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-1.5 h-11 rounded-2xl text-xs sm:text-sm"><SelectValue placeholder="Select Severity" /></SelectTrigger>
                    <SelectContent>
                      {SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Description *</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Provide landmark details or specific instructions for the field worker..." className="mt-1.5 text-foreground rounded-2xl text-xs sm:text-sm p-3.5" />
                </div>

                <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface p-3.5 text-xs sm:text-sm text-foreground shadow-sm">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="break-words min-w-0 flex-1 text-xs sm:text-sm">{location.address}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
                <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full justify-center text-xs sm:text-sm py-3">← Back</Button>
                <Button size="lg" disabled={submitting || selectedIssues.length === 0 || !description} className="rounded-full font-bold shadow-elev py-6 px-8 text-xs sm:text-sm w-full sm:w-auto" onClick={() => handleSubmit()}>
                  {submitting 
                    ? 'Submitting...' 
                    : selectedIssues.length > 1 
                      ? `Submit ${selectedIssues.length} Complaints` 
                      : 'Submit Complaint'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-hero p-6 text-white">
            <div className="text-xs uppercase tracking-widest opacity-80">Pro tip</div>
            <div className="mt-2 font-display text-xl leading-snug">A clear daytime photo boosts AI accuracy from 78% → 94%.</div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">What happens next</div>
            <ol className="mt-4 space-y-3 text-sm">
              {["We route to the correct department", "A field worker is assigned", "You get live status updates", "Rate the resolution"].map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">{i + 1}</span>
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      {showDuplicateModal && duplicateComplaint && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="glass-panel p-8 rounded-3xl border border-border max-w-md w-full text-center shadow-2xl text-foreground bg-card">
            <AlertTriangle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Same Issue Exists Nearby</h3>
            <p className="text-muted-foreground text-sm mb-6">
              A similar active complaint exists nearby. Would you like to upvote it instead of filing a duplicate?
            </p>
            <div className="flex gap-4">
              <Button onClick={handleUpvoteDuplicate} className="flex-1 rounded-full py-2.5 font-bold">
                Yes, Upvote Instead
              </Button>
              <Button variant="outline" onClick={() => setShowDuplicateModal(false)} className="flex-1 rounded-full py-2.5">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
