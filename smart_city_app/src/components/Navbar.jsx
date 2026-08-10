import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Moon, Sun, Sparkles, Palette, Home, Camera, Search, Info, Mail,
  LogOut, LayoutDashboard, User, Shield, ChevronDown, ArrowRight, Activity
} from "lucide-react";
import { useTheme, PALETTES } from '../lib/theme';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { NotificationToggle } from './NotificationToggle';

const NAV = [
  { to: "/", label: "Home" },
  { to: "/report", label: "Report Issue" },
  { to: "/upvote", label: "Upvote Issues" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const { mode, palette, setMode, setPalette, toggleMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const isAdmin = currentUser?.role === "super_admin";

  const dashboardPath = currentUser?.role === 'worker' 
    ? '/worker' 
    : (currentUser?.role === 'dept_admin' || currentUser?.role === 'super_admin') 
    ? '/admin' 
    : '/dashboard';

  const userRoleLabel = currentUser?.role === 'super_admin'
    ? 'Super Admin'
    : currentUser?.role === 'dept_admin'
    ? 'Dept Admin'
    : currentUser?.role === 'worker'
    ? 'Field Worker'
    : 'Citizen';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-2xl transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-hero text-white shadow-glow transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold tracking-tight text-foreground">Nagarik</span>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success border border-success/30">
                • Live Grid
              </span>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground block -mt-0.5">Navi Mumbai Portal</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-3 py-1.5 backdrop-blur-md shadow-sm">
          {NAV.map((n) => {
            const act = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  act
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 text-foreground">
          
          {/* Notification Toggle (Web Push Alerts) */}
          <NotificationToggle />

          {/* Light/Dark Toggle */}
          <button
            onClick={toggleMode}
            aria-label="Toggle theme mode"
            className="grid h-9 w-9 place-items-center rounded-full border border-border/80 bg-card text-foreground transition hover:bg-secondary hover:border-primary/40 shadow-sm"
          >
            {mode === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
          </button>

          {/* Palette Picker (Super Admin Only) */}
          {isAdmin && (
            <Sheet open={themeOpen} onOpenChange={setThemeOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="Theme palette"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border/80 bg-card text-foreground transition hover:bg-secondary hover:border-primary/40 shadow-sm"
                >
                  <Palette className="h-4 w-4 text-primary" />
                </button>
              </SheetTrigger>
              <SheetContent className="w-[380px] sm:max-w-[400px]">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl">Theme Customizer</SheetTitle>
                  <p className="text-sm text-muted-foreground">Select color themes for the smart city portal.</p>
                </SheetHeader>

                <div className="mt-6">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Appearance Mode</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {["light", "dark"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                          mode === m
                            ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20"
                            : "border-border hover:bg-secondary text-foreground"
                        }`}
                      >
                        {m === "light" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                        <span className="capitalize">{m} Mode</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Color Palettes</div>
                  <div className="mt-3 space-y-3">
                    {PALETTES.map((p) => {
                      const active = palette === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setPalette(p.id)}
                          className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-primary bg-primary/5 shadow-elev ring-2 ring-primary/20"
                              : "border-border hover:bg-secondary"
                          }`}
                        >
                          <div className="flex -space-x-2">
                            {p.swatch.map((s, i) => (
                              <div
                                key={i}
                                className="h-8 w-8 rounded-full border-2 border-background shadow-sm"
                                style={{ backgroundColor: s }}
                              />
                            ))}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-foreground">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.tagline}</div>
                          </div>
                          {active && (
                            <div className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                              Active
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* User Auth Menu / Actions */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border/80 bg-card p-1.5 pr-3 transition hover:bg-secondary shadow-sm">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-hero font-display text-xs text-white font-bold shrink-0">
                    {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : "U"}
                  </div>
                  <div className="hidden sm:flex flex-col text-left min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[100px] leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-none">
                      {userRoleLabel}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border">
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="font-semibold text-sm text-foreground truncate">{currentUser.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{currentUser.email}</div>
                  <div className="mt-1.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {userRoleLabel}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(dashboardPath)} className="rounded-xl cursor-pointer py-2 gap-2">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <span>My Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="rounded-xl cursor-pointer py-2 gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/login')} variant="outline" size="sm" className="hidden sm:inline-flex rounded-full px-4 text-xs font-semibold">
                Sign In
              </Button>
              <Button onClick={() => navigate('/report')} size="sm" className="rounded-full px-5 text-xs font-semibold shadow-elev gap-1.5">
                <span>Report Issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-border md:hidden bg-card text-foreground"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {open && (
        <div className="border-t border-border/80 bg-background/95 p-4 shadow-2xl backdrop-blur-2xl md:hidden animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1">
            {NAV.map((n) => {
              const active = path === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>

          {currentUser ? (
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
              <Button onClick={() => { navigate(dashboardPath); setOpen(false); }} className="w-full rounded-2xl gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </Button>
              <Button onClick={() => { logout(); setOpen(false); }} variant="outline" className="w-full rounded-2xl gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
              <Button onClick={() => { navigate('/report'); setOpen(false); }} className="w-full rounded-2xl gap-2">
                <Camera className="h-4 w-4" />
                Report an Issue
              </Button>
              <Button onClick={() => { navigate('/login'); setOpen(false); }} variant="outline" className="w-full rounded-2xl gap-2">
                <User className="h-4 w-4" />
                Sign In / Register
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
