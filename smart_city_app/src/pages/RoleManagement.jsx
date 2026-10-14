import React, { useEffect, useState } from 'react';
import { 
  Users, UserPlus, Search, Edit2, Trash2, Key, ShieldCheck, 
  Building2, Phone, Mail, CheckCircle2, AlertCircle, X, ShieldAlert,
  Activity, CheckCircle, Clock, Award, Briefcase, Eye, ExternalLink,
  MapPin, Calendar, FileText, Zap, Heart
} from 'lucide-react';
import api from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PageHeader } from '../components/admin/admin-shell';

const DEPARTMENTS = [
  "Roads & Infrastructure Dept",
  "Sanitation Dept",
  "Electricity Dept",
  "Water Supply Dept"
];

export function RoleManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [viewingWorkUser, setViewingWorkUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'dept_admin',
    department: 'Roads & Infrastructure Dept'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      // Ensure only staff credentials (dept_admin, worker, super_admin) are shown
      const staffOnly = (response.data || []).filter(u => u.role !== 'citizen');
      setUsers(staffOnly);
    } catch (error) {
      console.error('Failed to query users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'dept_admin',
      department: 'Roads & Infrastructure Dept'
    });
    setErrorMsg('');
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      password: '', // blank unless updating
      role: user.role || 'dept_admin',
      department: user.department || 'Roads & Infrastructure Dept'
    });
    setErrorMsg('');
  };

  // Submit Create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) {
      setErrorMsg('Name, phone number, and initial password are required.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/admin/users', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        password: formData.password.trim(),
        role: formData.role,
        department: ['dept_admin', 'worker'].includes(formData.role) ? formData.department : null
      });
      setShowCreateModal(false);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create staff account');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit / Update Credentials
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        role: formData.role,
        department: ['dept_admin', 'worker'].includes(formData.role) ? formData.department : null
      };
      if (formData.password && formData.password.trim().length > 0) {
        payload.password = formData.password.trim();
      }

      await api.put(`/admin/users/${editingUser._id}`, payload);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update user credentials');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/users/${deletingUser._id}`);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic (Citizens excluded)
  const filteredUsers = users
    .filter(u => u.role !== 'citizen')
    .filter(u => {
      if (roleFilter === 'All') return true;
      if (roleFilter === 'Dept Admins') return u.role === 'dept_admin';
      if (roleFilter === 'Workers') return u.role === 'worker';
      if (roleFilter === 'Super Admins') return u.role === 'super_admin';
      return true;
    })
    .filter(u => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q)
      );
    });

  // Badge helpers
  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return <span className="rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 text-[11px] font-bold">Super Admin</span>;
      case 'dept_admin':
        return <span className="rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 px-2.5 py-0.5 text-[11px] font-bold">Dept Admin</span>;
      case 'worker':
        return <span className="rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-[11px] font-bold">Field Worker</span>;
      default:
        return <span className="rounded-full bg-muted border border-border text-muted-foreground px-2.5 py-0.5 text-[11px] font-medium">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow="Staff & Credential Administration"
        title="Admin & Worker Management"
        subtitle="Manage credentials, passwords, and review live work activity for Department Admins and Field Workers."
      >
        <Button onClick={handleOpenCreate} className="gap-2 font-bold rounded-xl shadow-sm text-xs sm:text-sm">
          <UserPlus className="h-4 w-4" />
          <span>Create Staff / Admin</span>
        </Button>
      </PageHeader>

      {/* Controls: Search & Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search staff by name, phone, email, or department..."
              className="pl-10 h-11 rounded-2xl text-xs sm:text-sm bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Role Filter Tabs (No citizens) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'All', label: 'All Staff', count: users.length },
            { id: 'Dept Admins', label: 'Dept Admins', count: users.filter(u => u.role === 'dept_admin').length },
            { id: 'Workers', label: 'Field Workers', count: users.filter(u => u.role === 'worker').length },
            { id: 'Super Admins', label: 'Super Admins', count: users.filter(u => u.role === 'super_admin').length },
          ].map(tab => {
            const isSelected = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MOBILE CARDS VIEW (< 768px)                                */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="space-y-3.5 md:hidden">
        {filteredUsers.map(u => {
          const ws = u.workSummary;
          return (
            <div key={u._id} className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-hero font-bold text-xs text-white shrink-0">
                    {u.name ? u.name.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-foreground truncate">{u.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">{u.phone}</div>
                  </div>
                </div>
                <div>{getRoleBadge(u.role)}</div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground border-t border-border/50 pt-2">
                {u.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>
                )}
                {['dept_admin', 'worker'].includes(u.role) && (
                  <div className="flex items-center gap-1.5 text-foreground font-medium truncate">
                    <Building2 className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">{u.department || 'General Department'}</span>
                  </div>
                )}
              </div>

              {/* Work Activity Section */}
              <div className="rounded-xl border border-border/70 bg-surface/60 p-2.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <Activity className="h-3 w-3 text-primary" /> Work Handled
                  </span>
                  <button 
                    onClick={() => setViewingWorkUser(u)} 
                    className="text-[11px] text-primary font-bold hover:underline flex items-center gap-0.5"
                  >
                    View Details <Eye className="h-3 w-3" />
                  </button>
                </div>

                {u.role === 'worker' && (
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="rounded-lg bg-background p-1.5 border border-border/40">
                      <div className="text-[10px] text-muted-foreground">Assigned</div>
                      <div className="font-bold text-foreground text-xs">{ws?.totalAssigned || 0}</div>
                    </div>
                    <div className="rounded-lg bg-background p-1.5 border border-border/40">
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Resolved</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{ws?.resolvedCount || 0}</div>
                    </div>
                    <div className="rounded-lg bg-background p-1.5 border border-border/40">
                      <div className="text-[10px] text-amber-600 dark:text-amber-400">In Progress</div>
                      <div className="font-bold text-amber-600 dark:text-amber-400 text-xs">{ws?.inProgressCount || 0}</div>
                    </div>
                  </div>
                )}

                {u.role === 'dept_admin' && (
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="rounded-lg bg-background p-1.5 border border-border/40">
                      <div className="text-[10px] text-muted-foreground">Total Issues</div>
                      <div className="font-bold text-foreground text-xs">{ws?.totalDepartmentComplaints || 0}</div>
                    </div>
                    <div className="rounded-lg bg-background p-1.5 border border-border/40">
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Resolved</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{ws?.resolvedCount || 0}</div>
                    </div>
                    <div className="rounded-lg bg-background p-1.5 border border-border/40">
                      <div className="text-[10px] text-primary">Workers</div>
                      <div className="font-bold text-primary text-xs">{ws?.activeWorkersCount || 0}</div>
                    </div>
                  </div>
                )}

                {u.role === 'super_admin' && (
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between px-1">
                    <span>City Oversight: <strong>{ws?.cityTotalComplaints || 0}</strong> complaints</span>
                    <span className="text-emerald-600 font-bold">{ws?.cityResolvedCount || 0} resolved</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-border/50 pt-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(u)}
                  className="flex-1 rounded-xl text-xs h-9 gap-1 font-semibold"
                >
                  <Edit2 className="h-3.5 w-3.5 text-primary" />
                  <span>Edit Credentials</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeletingUser(u)}
                  className="rounded-xl text-xs h-9 px-3"
                  title="Delete Staff"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && !loading && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground">
            No staff accounts found.
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* DESKTOP TABLE VIEW (>= 768px)                               */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-surface/80 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="py-4 px-6 font-bold">Staff Member</th>
                <th className="py-4 px-6 font-bold">Contact & Login</th>
                <th className="py-4 px-6 font-bold">Role</th>
                <th className="py-4 px-6 font-bold">Department</th>
                <th className="py-4 px-6 font-bold min-w-[340px]">Work Done & Performance</th>
                <th className="py-4 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map(u => {
                const ws = u.workSummary;
                return (
                  <tr key={u._id} className="hover:bg-secondary/30 transition group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 font-bold text-xs text-white shadow-sm shrink-0">
                          {u.name ? u.name.slice(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-sm group-hover:text-primary transition">{u.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">ID: #{u._id?.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-mono font-semibold text-foreground flex items-center gap-1.5">
                        <span>📞</span> {u.phone}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[190px] mt-0.5">
                        {u.email ? `✉️ ${u.email}` : '—'}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="py-4 px-6 text-xs text-foreground whitespace-nowrap">
                      {['dept_admin', 'worker'].includes(u.role) ? (
                        <div className="inline-flex items-center gap-1.5 font-medium text-foreground bg-surface/70 px-2.5 py-1 rounded-xl border border-border/80">
                          <Building2 className="h-3 w-3 text-primary" />
                          <span>{u.department || 'General Duty'}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/20 font-semibold">
                          <ShieldCheck className="h-3 w-3" />
                          <span>City-Wide Oversight</span>
                        </span>
                      )}
                    </td>
                    {/* What work they did */}
                    <td className="py-4 px-6">
                      {u.role === 'worker' && (
                        <div className="flex items-center justify-between gap-3 min-w-[320px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border text-[11px] font-semibold text-foreground shadow-2xs">
                              <Briefcase className="h-3 w-3 text-primary" />
                              <span>{ws?.totalAssigned || 0} Assigned</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{ws?.resolvedCount || 0} Resolved</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                              <Clock className="h-3 w-3" />
                              <span>{ws?.inProgressCount || 0} Active</span>
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setViewingWorkUser(u)}
                            className="h-8 px-3 rounded-xl text-xs gap-1.5 font-semibold hover:border-primary hover:bg-primary/5 shrink-0 transition"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            <span>Work Log</span>
                          </Button>
                        </div>
                      )}

                      {u.role === 'dept_admin' && (
                        <div className="flex items-center justify-between gap-3 min-w-[320px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border text-[11px] font-semibold text-foreground shadow-2xs">
                              <FileText className="h-3 w-3 text-primary" />
                              <span>{ws?.totalDepartmentComplaints || 0} Cases</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{ws?.resolvedCount || 0} Resolved</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                              <Users className="h-3 w-3" />
                              <span>{ws?.activeWorkersCount || 0} Workers</span>
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setViewingWorkUser(u)}
                            className="h-8 px-3 rounded-xl text-xs gap-1.5 font-semibold hover:border-primary hover:bg-primary/5 shrink-0 transition"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            <span>Dept Log</span>
                          </Button>
                        </div>
                      )}

                      {u.role === 'super_admin' && (
                        <div className="flex items-center justify-between gap-3 min-w-[320px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                              <ShieldCheck className="h-3 w-3" />
                              <span>{ws?.cityTotalComplaints || 0} City Cases</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{ws?.cityResolvedCount || 0} Resolved</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border text-[11px] font-semibold text-foreground shadow-2xs">
                              <Building2 className="h-3 w-3 text-primary" />
                              <span>4 Depts</span>
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setViewingWorkUser(u)}
                            className="h-8 px-3 rounded-xl text-xs gap-1.5 font-semibold hover:border-primary hover:bg-primary/5 shrink-0 transition"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            <span>Overview</span>
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(u)}
                          className="rounded-xl text-xs gap-1.5 font-semibold hover:border-primary"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-primary" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingUser(u)}
                          className="rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-sm text-muted-foreground">
                    No staff accounts match your selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL: CREATE STAFF / DEPT ADMIN / WORKER                   */}
      {/* ──────────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm overflow-y-auto">
          <form 
            onSubmit={handleCreateSubmit}
            autoComplete="off"
            className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-border max-w-md w-full shadow-2xl space-y-4 bg-card my-auto"
          >
            {/* Hidden dummy inputs to consume browser password autofill */}
            <input type="text" name="chrome_dummy_username_staff" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input type="password" name="chrome_dummy_password_staff" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">Create Staff Account</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Register a new Department Admin or Field Worker with login credentials.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground uppercase mb-1">Full Name *</label>
                <Input
                  name="staff_new_fullname"
                  autoComplete="off"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Ramesh Patil"
                  className="rounded-xl h-10 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground uppercase mb-1">Phone Number (Login Username) *</label>
                <Input
                  type="tel"
                  name="staff_new_contact_phone"
                  autoComplete="new-off"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="e.g. 9876543210"
                  className="rounded-xl h-10 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground uppercase mb-1">Email Address</label>
                <Input
                  type="email"
                  name="staff_new_contact_email"
                  autoComplete="off"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. ramesh@smartcity.gov"
                  className="rounded-xl h-10 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground uppercase mb-1">Initial Password *</label>
                <Input
                  type="password"
                  name="staff_new_temp_password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="Create initial login password"
                  className="rounded-xl h-10 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground uppercase mb-1">System Role *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="dept_admin">Department Admin (Municipal Admin)</option>
                  <option value="worker">Field Worker (Resolution Worker)</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {['dept_admin', 'worker'].includes(formData.role) && (
                <div>
                  <label className="block font-semibold text-muted-foreground uppercase mb-1">Assigned Department *</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-xl text-xs h-10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting} 
                className="flex-1 rounded-xl text-xs h-10 font-bold"
              >
                {submitting ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL: EDIT USER & CREDENTIALS                              */}
      {/* ──────────────────────────────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm overflow-y-auto">
          <form 
            onSubmit={handleEditSubmit}
            autoComplete="off"
            className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-border max-w-md w-full shadow-2xl space-y-4 bg-card my-auto"
          >
            <input type="text" name="chrome_dummy_username_edit" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input type="password" name="chrome_dummy_password_edit" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">Edit Staff Credentials</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Update credentials, reset password, or change assigned department.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingUser(null)}
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground uppercase mb-1">Full Name</label>
                <Input
                  name="staff_edit_fullname"
                  autoComplete="off"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-xl h-10 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground uppercase mb-1">Phone Number (Login Username)</label>
                <Input
                  type="tel"
                  name="staff_edit_contact_phone"
                  autoComplete="new-off"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="rounded-xl h-10 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground uppercase mb-1">Email Address</label>
                <Input
                  type="email"
                  name="staff_edit_contact_email"
                  autoComplete="off"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@smartcity.gov"
                  className="rounded-xl h-10 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground uppercase mb-1">Reset Password</label>
                <Input
                  type="password"
                  name="staff_edit_new_pwd"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep existing password"
                  className="rounded-xl h-10 text-xs sm:text-sm"
                />
                <p className="text-[11px] text-muted-foreground mt-0.5">Only enter text if you wish to reset their password.</p>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground uppercase mb-1">System Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="dept_admin">Department Admin (Municipal Admin)</option>
                  <option value="worker">Field Worker (Resolution Worker)</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {['dept_admin', 'worker'].includes(formData.role) && (
                <div>
                  <label className="block font-semibold text-muted-foreground uppercase mb-1">Assigned Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingUser(null)}
                className="flex-1 rounded-xl text-xs h-10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting} 
                className="flex-1 rounded-xl text-xs h-10 font-bold"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL: VIEW WORK DONE / WORK LOG                            */}
      {/* ──────────────────────────────────────────────────────────── */}
      {viewingWorkUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 lg:p-8 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 lg:p-10 rounded-3xl border border-border max-w-3xl lg:max-w-5xl w-full shadow-2xl space-y-6 bg-card my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-5">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 font-bold text-white text-xl shrink-0 shadow-md">
                  {viewingWorkUser.name ? viewingWorkUser.name.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{viewingWorkUser.name}</h3>
                    {getRoleBadge(viewingWorkUser.role)}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ● Active Account
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="font-mono bg-surface px-2.5 py-0.5 rounded-md border border-border/60">📞 {viewingWorkUser.phone}</span>
                    <span>·</span>
                    <span>✉️ {viewingWorkUser.email || 'No email registered'}</span>
                    <span>·</span>
                    <span className="font-semibold text-foreground">🏢 {viewingWorkUser.department || 'City-wide Administration'}</span>
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setViewingWorkUser(null)}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Work Performance Summary KPI Cards */}
            <div className={`grid gap-3.5 sm:gap-4 ${viewingWorkUser.role === 'worker' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 lg:grid-cols-4'}`}>
              {viewingWorkUser.role === 'worker' ? (
                <>
                  <div className="p-4 sm:p-5 rounded-2xl border border-border bg-surface/70 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Assigned Tasks</div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground font-sans leading-none">{viewingWorkUser.workSummary?.totalAssigned || 0}</div>
                    <div className="mt-2 text-[11px] text-muted-foreground truncate">All time complaints</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resolved</div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-sans leading-none">{viewingWorkUser.workSummary?.resolvedCount || 0}</div>
                    <div className="mt-2 text-[11px] text-emerald-600/80 truncate">Completed fixes</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">In Progress</div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-sans leading-none">{viewingWorkUser.workSummary?.inProgressCount || 0}</div>
                    <div className="mt-2 text-[11px] text-amber-600/80 truncate">Active complaints</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-primary">SLA Score</div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-primary font-sans leading-none">{viewingWorkUser.workSummary?.resolutionRate || 0}%</div>
                    <div className="mt-2 text-[11px] text-primary/80 truncate">On-time SLA</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Zap className="h-3 w-3 fill-amber-500 text-amber-500" /> Early Resolves
                    </div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-sans leading-none">
                      {viewingWorkUser.workSummary?.earlyResolutions || 0}
                    </div>
                    <div className="mt-2 text-[11px] text-amber-600/80 truncate">Ahead of SLA deadline</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> Citizen Kudos
                    </div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-sans leading-none">
                      {viewingWorkUser.workSummary?.totalKudos || 0}
                    </div>
                    <div className="mt-2 text-[11px] text-rose-600/80 truncate">Citizen appreciations</div>
                  </div>
                </>
              ) : viewingWorkUser.role === 'dept_admin' ? (
                <>
                  <div className="p-4 sm:p-5 rounded-2xl border border-border bg-surface/70 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Dept Complaints</div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground font-sans leading-none">{viewingWorkUser.workSummary?.totalDepartmentComplaints || 0}</div>
                    <div className="mt-2 text-[11px] text-muted-foreground truncate">Department total volume</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resolved</div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-sans leading-none">{viewingWorkUser.workSummary?.resolvedCount || 0}</div>
                    <div className="mt-2 text-[11px] text-emerald-600/80 truncate">Closed cases</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Active Issues</div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-sans leading-none">{viewingWorkUser.workSummary?.activeCount || 0}</div>
                    <div className="mt-2 text-[11px] text-amber-600/80 truncate">Under review & active</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Field Workers</div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-sans leading-none">{viewingWorkUser.workSummary?.activeWorkersCount || 0}</div>
                    <div className="mt-2 text-[11px] text-blue-600/80 truncate">Assigned department crew</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 sm:p-5 rounded-2xl border border-border bg-surface/70 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">City Total Volume</div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground font-sans leading-none">{viewingWorkUser.workSummary?.cityTotalComplaints || 0}</div>
                    <div className="mt-2 text-[11px] text-muted-foreground truncate">All civic complaints</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">City Resolved</div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-sans leading-none">{viewingWorkUser.workSummary?.cityResolvedCount || 0}</div>
                    <div className="mt-2 text-[11px] text-emerald-600/80 truncate">Resolved city-wide</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Departments</div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-sans leading-none">4</div>
                    <div className="mt-2 text-[11px] text-purple-600/80 truncate">Active municipal wings</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col justify-between min-h-[110px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Access Level</div>
                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-sans leading-none">Full Root</div>
                    <div className="mt-2 text-[11px] text-indigo-600/80 truncate">Master platform admin</div>
                  </div>
                </>
              )}
            </div>

            {/* Details Section by Role */}
            {viewingWorkUser.role === 'super_admin' ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>Municipal Department Oversight & Status</span>
                  </h4>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    All 4 Departments Active
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: 'Roads & Infrastructure Dept', icon: '🛣️', desc: 'Potholes, broken asphalt, sidewalks, and traffic signal issues.', scope: 'City-wide Engineering' },
                    { name: 'Water Supply & Sewage Dept', icon: '💧', desc: 'Water pipeline bursts, contaminated supply, drainage, and manhole fixes.', scope: 'Hydraulic Department' },
                    { name: 'Sanitation & Waste Management', icon: '🗑️', desc: 'Garbage heaps, overflowing public bins, daily trash collection.', scope: 'Health & Cleanliness' },
                    { name: 'Electricity & Lighting Dept', icon: '💡', desc: 'Dark streetlights, electrical faults, wire hazards, and substation issues.', scope: 'Electrical Engineering' }
                  ].map((dept, idx) => (
                    <div key={idx} className="rounded-2xl border border-border bg-surface/50 p-4 space-y-2 hover:border-primary/40 transition">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground flex items-center gap-2">
                          <span className="text-base">{dept.icon}</span>
                          <span>{dept.name}</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Operational
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{dept.desc}</p>
                      <div className="text-[11px] text-primary font-medium pt-2 border-t border-border/40 flex items-center justify-between">
                        <span>{dept.scope}</span>
                        <span className="text-muted-foreground text-[10px]">Super Admin Oversight</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* City Grievances List if any */}
                {viewingWorkUser.workSummary?.recentTasks && viewingWorkUser.workSummary.recentTasks.length > 0 && (
                  <div className="pt-2 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Latest City Grievances (Live Stream)</span>
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {viewingWorkUser.workSummary.recentTasks.map((task) => (
                        <div key={task.id} className="rounded-2xl border border-border bg-surface/50 p-4 space-y-2 text-xs hover:border-primary/40 transition">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-foreground text-sm">{task.issueType}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              task.status === 'Resolved' 
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : task.status === 'In Progress'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                            <span className="flex items-center gap-1.5 truncate max-w-[210px]">
                              <MapPin className="h-3 w-3 text-primary shrink-0" />
                              <span className="truncate">{task.address}</span>
                            </span>
                            <span className="font-mono text-[10px]">{new Date(task.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>{viewingWorkUser.role === 'worker' ? 'Assigned Field Complaints & Tasks' : `${viewingWorkUser.department || 'Department'} Cases`}</span>
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  {viewingWorkUser.workSummary?.recentTasks?.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-border bg-surface/50 p-4 space-y-2 text-xs hover:border-primary/40 transition">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-foreground text-sm">{task.issueType}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            task.status === 'Resolved' 
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : task.status === 'In Progress'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>

                      {/* Speed Badge & Appreciation Chits */}
                      {task.status === 'Resolved' && (task.speedBadge || task.aheadOfTimeHours > 0 || task.citizenKudosCount > 0) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {task.speedBadge && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                              <span>{task.speedBadge}</span>
                            </span>
                          )}
                          {task.aheadOfTimeHours > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              +{task.aheadOfTimeHours}h Ahead
                            </span>
                          )}
                          {task.citizenKudosCount > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                              <Heart className="h-2.5 w-2.5 fill-rose-500 text-rose-500" />
                              <span>{task.citizenKudosCount} Kudos</span>
                            </span>
                          )}
                        </div>
                      )}

                      {task.description && (
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                        <span className="flex items-center gap-1.5 truncate max-w-[210px]">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{task.address}</span>
                        </span>
                        <span className="font-mono text-[10px]">{new Date(task.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {(!viewingWorkUser.workSummary?.recentTasks || viewingWorkUser.workSummary?.recentTasks.length === 0) && (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground bg-surface/30">
                    <div className="mx-auto h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground mb-2">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="font-medium text-foreground">No individual tasks logged for this staff member yet</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Tasks will appear here once civic complaints are assigned or addressed.</p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-border/60">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setViewingWorkUser(null)}
                className="w-full rounded-2xl text-xs h-11 font-semibold hover:border-primary transition"
              >
                Close Work Log
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL: DELETE CONFIRMATION                                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm overflow-y-auto">
          <div className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-destructive/30 max-w-md w-full shadow-2xl space-y-4 bg-card my-auto">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Delete Staff Account?</h3>
                <p className="text-xs text-muted-foreground">This user account and credentials will be permanently removed.</p>
              </div>
            </div>

            <div className="rounded-xl bg-destructive/5 border border-destructive/15 p-3 text-xs text-muted-foreground space-y-1">
              <div><strong className="text-foreground">Name:</strong> {deletingUser.name}</div>
              <div><strong className="text-foreground">Phone:</strong> {deletingUser.phone}</div>
              <div><strong className="text-foreground">Role:</strong> {deletingUser.role}</div>
              {deletingUser.department && (
                <div><strong className="text-foreground">Department:</strong> {deletingUser.department}</div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDeletingUser(null)}
                className="flex-1 rounded-xl text-xs h-10"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="flex-1 rounded-xl text-xs h-10 font-bold"
              >
                {submitting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
