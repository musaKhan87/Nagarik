import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export const ROLE_META = {
  super_admin: { name: "Super Admin", short: "SA", badge: "Full access" },
  dept_admin:  { name: "Dept Admin",  short: "DA", badge: "Dept scope", dept: "Roads" },
  field_worker:{ name: "Field Worker",short: "FW", badge: "Assigned only" },
  citizen:     { name: "Citizen",     short: "CT", badge: "No admin access" },
};

const MATRIX = {
  super_admin: [
    "admin.overview","admin.complaints","admin.heatmap","admin.workers",
    "admin.analytics","admin.settings","admin.users","admin.system",
  ],
  dept_admin: [
    "admin.overview","admin.complaints","admin.workers","admin.analytics","admin.settings",
  ],
  field_worker: [],
  citizen: [],
};

const Ctx = createContext(null);

export function AdminRoleProvider({ children }) {
  const { currentUser } = useAuth();
  const [role, setRoleState] = useState("super_admin");

  useEffect(() => {
    if (currentUser?.role) {
      setRoleState(currentUser.role);
    } else {
      const r = localStorage.getItem("nagarik-admin-role") || "super_admin";
      setRoleState(r);
    }
  }, [currentUser]);

  const effectiveRole = currentUser?.role || role;

  const setRole = (r) => {
    setRoleState(r);
    localStorage.setItem("nagarik-admin-role", r);
  };

  const can = (p) => MATRIX[effectiveRole]?.includes(p) || false;

  return <Ctx.Provider value={{ role: effectiveRole, setRole, can }}>{children}</Ctx.Provider>;
}

export function useAdminRole() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdminRole must be inside AdminRoleProvider");
  return c;
}
