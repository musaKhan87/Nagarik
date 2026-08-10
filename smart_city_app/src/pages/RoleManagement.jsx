import React, { useEffect, useState } from 'react';
import api from '../api';
import { Button } from '../components/ui/button';
import { useComplaints } from '../context/ComplaintContext';

export function RoleManagement() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to query users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, role, department) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role, department });
      fetchUsers();
    } catch (error) {
      alert('Failed to update role');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 bg-background text-foreground">
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">User Access Control</h2>
      <p className="text-muted-foreground text-sm mb-8">Manage system roles, assign roles to department staff or field workers.</p>

      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        <table className="w-full text-left text-sm text-foreground">
          <thead>
            <tr className="bg-surface text-xs uppercase tracking-widest text-muted-foreground">
              <th className="py-3 px-4 font-semibold">Name</th>
              <th className="py-3 px-4 font-semibold">Email / Contact</th>
              <th className="py-3 px-4 font-semibold">System Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t border-border hover:bg-secondary/40 transition">
                <td className="py-3 px-4 font-semibold text-foreground">{u.name}</td>
                <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{u.email || u.phone}</td>
                <td className="py-3 px-4">
                  <select 
                    value={u.role} 
                    onChange={e => handleRoleChange(u._id, e.target.value, u.department)} 
                    className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="worker">Field Worker</option>
                    <option value="dept_admin">Dept Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
