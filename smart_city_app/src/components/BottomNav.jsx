import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, PlusCircle, User, BarChart2, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function BottomNav() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-border bg-card/90 py-2 px-4 flex justify-around items-center z-40 text-foreground">
      <Link to="/" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground hover:text-primary">
        <Layers className="w-5 h-5" /> Home
      </Link>
      {currentUser.role === 'citizen' && (
        <>
          <Link to="/report" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground hover:text-primary">
            <PlusCircle className="w-5 h-5" /> Report
          </Link>
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground hover:text-primary">
            <User className="w-5 h-5" /> Citizen
          </Link>
        </>
      )}
      {(currentUser.role === 'dept_admin' || currentUser.role === 'super_admin') && (
        <Link to="/admin" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground hover:text-primary">
          <BarChart2 className="w-5 h-5" /> Admin
        </Link>
      )}
      {currentUser.role === 'worker' && (
        <Link to="/worker" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground hover:text-primary">
          <CheckSquare className="w-5 h-5" /> Task
        </Link>
      )}
    </div>
  );
}
