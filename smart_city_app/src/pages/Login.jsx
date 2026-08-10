import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, ArrowRight, Phone, Shield, HardHat, Mail, Lock, User,
  Eye, EyeOff, CheckCircle2, Star, Zap, UserPlus, LogIn
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function LoginRegister() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success && res.user) {
      const role = res.user.role;
      if (role === 'citizen') navigate('/dashboard');
      else if (role === 'worker') navigate('/worker');
      else navigate('/admin');
    } else {
      setError(res.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    const res = await register(regName, regPhone, regEmail, regPassword);
    setSubmitting(false);

    if (res.success) {
      setMessage('Account created successfully! Please sign in with your credentials.');
      setIsRegisterMode(false);
      setEmail(regEmail);
      setPassword(regPassword);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background text-foreground flex items-center justify-center py-6 px-4 sm:p-8 overflow-hidden">
      {/* Background ambient lighting and grid */}
      <div className="absolute inset-0 grid-lines opacity-25 pointer-events-none" />
      <div className="absolute -left-48 top-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -right-48 bottom-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      {/* Main Glass Card Container */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card/80 shadow-2xl backdrop-blur-2xl grid lg:grid-cols-12">
        
        {/* Left Visual Hero Side (Desktop only) */}
        <div className="relative lg:col-span-5 hidden lg:flex flex-col justify-between bg-hero p-10 text-white overflow-hidden">
          <div className="absolute inset-0 grid-lines opacity-20" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent/30 blur-2xl" />

          {/* Logo Branding */}
          <div className="relative flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/20 backdrop-blur shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display text-xl font-semibold leading-none">Nagarik</div>
              <div className="text-[10px] uppercase tracking-widest opacity-80 mt-0.5">Smart City Portal</div>
            </div>
          </div>

          {/* Center Showcase Content */}
          <div className="relative my-auto py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur mb-6">
              <Zap className="h-3.5 w-3.5 text-warning" />
              <span>SLA On-Time Resolution · 83%</span>
            </div>

            <h1 className="font-display text-4xl leading-tight">
              {isRegisterMode ? (
                <>Join your city's <span className="italic">digital grid.</span></>
              ) : (
                <>The city works better <span className="italic">when you show up.</span></>
              )}
            </h1>

            <p className="mt-4 text-xs sm:text-sm opacity-85 leading-relaxed">
              {isRegisterMode
                ? "Register to file pothole, streetlight & garbage complaints. Track resolution live with SLA countdowns."
                : "Sign in to report new issues, upvote nearby complaints, and track resolutions in real time."}
            </p>
          </div>

          {/* Testimonial Quote */}
          <div className="relative rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur shadow-lg">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 font-display font-bold">
                AK
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-amber-300 text-xs mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <p className="text-xs italic opacity-90 line-clamp-2">
                  "Reported a pothole on Monday. Fixed by Wednesday. Amazing response!"
                </p>
                <div className="mt-1 text-[10px] opacity-75 font-medium">— Aariz K., Vashi Sector 15</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Side (Responsive for Mobile & Desktop) */}
        <div className="lg:col-span-7 p-5 sm:p-8 md:p-10 flex flex-col justify-center">
          
          {/* Header & Mode Switcher Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 pb-4 border-b border-border/70">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
                {isRegisterMode ? "Create Account" : "Sign In"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRegisterMode ? "Register to start reporting civic issues." : "Enter your email & password to access your account."}
              </p>
            </div>

            {/* Responsive Mode Switcher Pill */}
            <div className="flex w-full sm:w-auto rounded-full border border-border bg-secondary/80 p-1 shrink-0">
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setError(''); setMessage(''); }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-full px-4 py-2 sm:py-1.5 text-xs font-medium transition ${
                  !isRegisterMode
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegisterMode(true); setError(''); setMessage(''); }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-full px-4 py-2 sm:py-1.5 text-xs font-medium transition ${
                  isRegisterMode
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Register
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}
          {message && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-success/30 bg-success/10 p-3.5 text-xs text-success-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              <span>{message}</span>
            </div>
          )}

          {!isRegisterMode ? (
            /* ================= SIGN IN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="h-11 pl-10 border-border text-sm rounded-xl focus:ring-primary"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 pl-10 pr-10 border-border text-sm rounded-xl focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={submitting} size="lg" className="w-full h-11 rounded-full shadow-elev text-sm font-semibold gap-2 mt-3">
                {submitting ? "Signing in..." : "Sign In"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            /* ================= REGISTER FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="reg-name" className="text-xs font-medium text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="e.g. Aariz Khan"
                    className="h-11 pl-10 border-border text-sm rounded-xl focus:ring-primary"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <Label htmlFor="reg-phone" className="text-xs font-medium text-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reg-phone"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                    placeholder="9876543210"
                    className="h-11 pl-10 border-border text-sm rounded-xl focus:ring-primary"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <Label htmlFor="reg-email" className="text-xs font-medium text-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="aariz@example.com"
                    className="h-11 pl-10 border-border text-sm rounded-xl focus:ring-primary"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="reg-password" className="text-xs font-medium text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 pl-10 pr-10 border-border text-sm rounded-xl focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Register Submit Button */}
              <Button type="submit" disabled={submitting} size="lg" className="w-full h-11 rounded-full shadow-elev text-sm font-semibold gap-2 mt-3">
                {submitting ? "Creating Account..." : "Create Account"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
