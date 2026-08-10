import React, { useState } from 'react';
import { MapPin, Flame, Zap, CheckCircle2, AlertTriangle, Layers, Info } from 'lucide-react';

export function MapView({ complaints = [], height = "480px", onPointClick }) {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [mapLayer, setMapLayer] = useState('heatmap'); // 'heatmap' | 'markers'

  const handlePinClick = (c) => {
    setSelectedPoint(c);
    if (onPointClick) onPointClick(c);
  };

  // Navi Mumbai default center coordinates & ward bounding box mock calculations
  const centerLat = 19.0330;
  const centerLng = 73.0297;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-slate-950 shadow-2xl" style={{ height }}>
      
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/80 p-1.5 backdrop-blur-md shadow-lg">
        <button
          type="button"
          onClick={() => setMapLayer('heatmap')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
            mapLayer === 'heatmap'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span>Heatmap Overlay</span>
        </button>

        <button
          type="button"
          onClick={() => setMapLayer('markers')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
            mapLayer === 'markers'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <MapPin className="h-3.5 w-3.5 text-sky-400" />
          <span>Geo Pins Layer</span>
        </button>
      </div>

      {/* Map Legend Scale */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/80 px-3 py-1.5 text-[11px] font-bold text-slate-200 backdrop-blur-md">
        <span>Heat Density:</span>
        <div className="h-2.5 w-20 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 border border-white/20" />
        <span className="text-rose-400">Critical</span>
      </div>

      {/* Dark Mode Map Canvas Layer */}
      <div className="absolute inset-0 bg-slate-950">
        {/* Simulated CartoDB Dark Matter Tile Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-indigo-950/40 to-slate-900 opacity-90" />
        
        {/* Simulated Road Grid Lines */}
        <svg className="absolute inset-0 h-full w-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="30%" x2="100%" y2="35%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6,6" />
          <line x1="0" y1="70%" x2="100%" y2="65%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6,6" />
          <line x1="40%" y1="0" x2="45%" y2="100%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6,6" />
          <line x1="75%" y1="0" x2="70%" y2="100%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6,6" />
        </svg>
      </div>

      {/* Interactive Map Points */}
      {complaints.map((c, i) => {
        const coords = c.location?.coordinates || [73.0297, 19.0330];
        // Calculate relative position inside map canvas container
        const lngNorm = ((coords[0] - 72.95) / (73.15 - 72.95)) * 100;
        const latNorm = (1 - ((coords[1] - 18.95) / (19.10 - 18.95))) * 100;
        
        const mockTop = Math.max(10, Math.min(85, isNaN(latNorm) ? (20 + (i * 19) % 65) : latNorm));
        const mockLeft = Math.max(10, Math.min(85, isNaN(lngNorm) ? (15 + (i * 27) % 70) : lngNorm));

        const isCritical = c.priority === 'Critical' || (c.upvoteCount && c.upvoteCount >= 5);
        const isResolved = c.status === 'Resolved';

        if (mapLayer === 'heatmap') {
          return (
            <div
              key={c._id || c.id || i}
              onClick={() => handlePinClick(c)}
              style={{ top: `${mockTop}%`, left: `${mockLeft}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
            >
              {/* Heatmap Radial Glow Sphere */}
              <div className={`rounded-full transition-transform duration-300 group-hover:scale-125 ${
                isResolved
                  ? "h-10 w-10 bg-emerald-500/30 blur-md"
                  : isCritical
                  ? "h-16 w-16 bg-rose-600/50 blur-lg animate-pulse"
                  : "h-12 w-12 bg-amber-500/40 blur-md"
              }`} />
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border border-white/60 shadow-lg ${
                isResolved ? "bg-emerald-400" : isCritical ? "bg-rose-500" : "bg-amber-400"
              }`} />
            </div>
          );
        }

        // Marker Pin Layer
        return (
          <div
            key={c._id || c.id || i}
            onClick={() => handlePinClick(c)}
            style={{ top: `${mockTop}%`, left: `${mockLeft}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
          >
            <div className={`grid h-8 w-8 place-items-center rounded-2xl border border-white/30 shadow-xl transition-transform duration-300 group-hover:scale-125 ${
              isResolved
                ? "bg-emerald-600 text-white"
                : isCritical
                ? "bg-rose-600 text-white animate-bounce"
                : "bg-amber-500 text-white"
            }`}>
              <MapPin className="h-4 w-4" />
            </div>
          </div>
        );
      })}

      {/* Selected Point Popup Card */}
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 sm:w-80 rounded-2xl border border-white/20 bg-slate-900/90 p-4 backdrop-blur-xl shadow-2xl space-y-3 text-white animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-primary/20 border border-primary/40 px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground uppercase">
              {selectedPoint.issueType}
            </span>
            <button
              onClick={() => setSelectedPoint(null)}
              className="text-xs text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-normal">
            {selectedPoint.description}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/10">
            <span>Status: <strong className="text-amber-300">{selectedPoint.status}</strong></span>
            <span>Upvotes: <strong className="text-amber-300">🔥 {selectedPoint.upvoteCount || 0}</strong></span>
          </div>
        </div>
      )}

    </div>
  );
}
