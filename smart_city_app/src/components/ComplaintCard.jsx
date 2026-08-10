import React from 'react';
import { ThumbsUp } from 'lucide-react';

export function ComplaintCard({ complaint, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="glass-panel p-6 rounded-xl border border-white/5 flex gap-4 hover:border-primary/20 transition-all cursor-pointer"
    >
      <div className="w-24 h-24 rounded overflow-hidden bg-bg-input flex-shrink-0">
        <img src={complaint.photo} alt={complaint.issueType} className="w-full h-full object-cover" />
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-mono text-xs text-primary font-bold">{complaint.id || complaint._id}</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
            complaint.status === 'Resolved' ? 'bg-success/15 text-success' : 
            complaint.status === 'In Progress' ? 'bg-progress/15 text-progress' : 'bg-primary/15 text-primary'
          }`}>
            {complaint.status}
          </span>
        </div>
        <h4 className="text-base font-bold text-white mb-1 truncate">{complaint.issueType}</h4>
        <p className="text-text-secondary text-xs mb-3 line-clamp-2">{complaint.description}</p>
        <div className="flex items-center justify-between text-[11px] text-text-secondary">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5 text-primary" /> {complaint.upvoteCount || 0} upvotes
          </span>
          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
