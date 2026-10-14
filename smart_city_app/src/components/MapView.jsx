import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Flame, Layers, Eye, RefreshCw, ZoomIn, ZoomOut, CheckCircle2, Clock, AlertTriangle, Image as ImageIcon } from 'lucide-react';

// Custom Pin Icon Generator
const createMarkerIcon = (priority, status) => {
  const isResolved = status === 'Resolved';
  const isCritical = priority === 'Critical';
  const isHigh = priority === 'High';

  const bgColor = isResolved 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
    : isCritical 
    ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' 
    : isHigh 
    ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';

  const shadowColor = isResolved 
    ? 'rgba(16, 185, 129, 0.4)' 
    : isCritical 
    ? 'rgba(239, 68, 68, 0.5)' 
    : 'rgba(245, 158, 11, 0.4)';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        <div style="
          background: ${bgColor};
          color: white;
          width: 34px;
          height: 34px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px ${shadowColor}, 0 2px 6px rgba(0,0,0,0.3);
          border: 2.5px solid #ffffff;
        ">
          <svg style="transform: rotate(45deg); width: 16px; height: 16px;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
          </svg>
        </div>
        <div style="
          width: 10px;
          height: 4px;
          background: rgba(0, 0, 0, 0.35);
          border-radius: 50%;
          filter: blur(1px);
          margin-top: -2px;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -34]
  });
};

// Component to dynamically fit map bounds to complaints
function AutoFitBounds({ points, defaultCenter }) {
  const map = useMap();
  const hasFitRef = useRef(false);

  useEffect(() => {
    if (points.length > 0 && !hasFitRef.current) {
      const bounds = L.latLngBounds(points);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        hasFitRef.current = true;
      }
    } else if (points.length === 0 && !hasFitRef.current) {
      map.setView(defaultCenter, 12);
      hasFitRef.current = true;
    }
  }, [points, map, defaultCenter]);

  return null;
}

// Controller to trigger programmatic re-centering
function RecenterController({ center, trigger }) {
  const map = useMap();
  useEffect(() => {
    if (trigger) {
      map.flyTo(center, 13, { duration: 0.8 });
    }
  }, [trigger, center, map]);
  return null;
}

export function MapView({ complaints = [], height = "520px", onPointClick }) {
  const [mapLayer, setMapLayer] = useState('heatmap'); // 'heatmap' | 'markers'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'resolved'
  const [recenterCount, setRecenterCount] = useState(0);

  // Navi Mumbai municipal civic center (Vashi / Belapur corridor)
  const defaultCenter = [19.0330, 73.0297];

  // Helper to reliably extract coordinates from complaints
  const extractCoords = (c, index) => {
    // 1. GeoJSON coordinates: [longitude, latitude]
    if (Array.isArray(c.location?.coordinates) && c.location.coordinates.length >= 2) {
      const lng = Number(c.location.coordinates[0]);
      const lat = Number(c.location.coordinates[1]);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return [lat, lng];
      }
    }
    // 2. Direct lat/lng properties
    const lat = Number(c.location?.lat || c.lat);
    const lng = Number(c.location?.lng || c.lng);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return [lat, lng];
    }
    // 3. Fallback: Distribute points across recognizable Navi Mumbai nodes
    const knownCenters = [
      [19.0745, 72.9978], // Vashi
      [19.0330, 73.0169], // Nerul
      [19.0473, 73.0699], // Kharghar
      [19.0178, 73.0422], // Belapur
      [18.9894, 73.1175], // Panvel
      [19.0062, 73.0084], // Seawoods
      [19.0968, 73.0033], // Kopar Khairane
      [19.1175, 72.9998], // Ghansoli
      [19.1554, 72.9935], // Airoli
    ];
    const base = knownCenters[index % knownCenters.length];
    const jitterLat = ((index * 37) % 100 - 50) * 0.0008;
    const jitterLng = ((index * 53) % 100 - 50) * 0.0008;
    return [base[0] + jitterLat, base[1] + jitterLng];
  };

  // Process complaints with coordinates
  const processedComplaints = useMemo(() => {
    return complaints.map((c, i) => {
      const coords = extractCoords(c, i);
      const address = c.location?.address || c.address || 'Navi Mumbai Ward';
      const isCritical = c.priority === 'Critical';
      const isHigh = c.priority === 'High';
      const isResolved = c.status === 'Resolved';

      // Circle weight and radius for heat layer
      const radius = isCritical ? 28 : isHigh ? 22 : isResolved ? 16 : 18;
      const heatColor = isResolved 
        ? '#10b981' 
        : isCritical 
        ? '#ef4444' 
        : isHigh 
        ? '#f97316' 
        : '#eab308';

      return {
        ...c,
        coords,
        address,
        isCritical,
        isHigh,
        isResolved,
        radius,
        heatColor
      };
    });
  }, [complaints]);

  // Filter complaints based on status filter
  const filteredComplaints = useMemo(() => {
    if (statusFilter === 'active') {
      return processedComplaints.filter(c => c.status !== 'Resolved');
    }
    if (statusFilter === 'resolved') {
      return processedComplaints.filter(c => c.status === 'Resolved');
    }
    return processedComplaints;
  }, [processedComplaints, statusFilter]);

  const allPoints = useMemo(() => {
    return filteredComplaints.map(c => c.coords);
  }, [filteredComplaints]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl isolate" style={{ height }}>
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Mode Toggle */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-card/90 p-1.5 backdrop-blur-md shadow-lg pointer-events-auto">
          <button
            type="button"
            onClick={() => setMapLayer('heatmap')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              mapLayer === 'heatmap'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>Heatmap Overlay</span>
          </button>

          <button
            type="button"
            onClick={() => setMapLayer('markers')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              mapLayer === 'markers'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapPin className="h-3.5 w-3.5 text-sky-500" />
            <span>Pin Markers</span>
          </button>
        </div>

        {/* Status Filters & Recenter */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="hidden sm:flex items-center gap-1 rounded-2xl border border-border/80 bg-card/90 p-1 backdrop-blur-md shadow-lg text-xs font-semibold">
            {['all', 'active', 'resolved'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`rounded-xl px-2.5 py-1 capitalize transition ${
                  statusFilter === f
                    ? "bg-secondary text-foreground font-bold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setRecenterCount(c => c + 1)}
            className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-card/90 px-3 py-2 text-xs font-bold text-foreground shadow-lg backdrop-blur-md hover:bg-secondary transition"
            title="Recenter Map View"
          >
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Recenter</span>
          </button>
        </div>
      </div>

      {/* Real Interactive Leaflet Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoFitBounds points={allPoints} defaultCenter={defaultCenter} />
        <RecenterController center={defaultCenter} trigger={recenterCount} />

        {/* HEATMAP LAYER: Concentric Radial Glow Spheres */}
        {mapLayer === 'heatmap' && (
          <>
            {filteredComplaints.map((c) => (
              <React.Fragment key={c._id || c.id}>
                {/* Outer Heat Aura */}
                <CircleMarker
                  center={c.coords}
                  radius={c.radius * 1.5}
                  pathOptions={{
                    fillColor: c.heatColor,
                    fillOpacity: 0.22,
                    stroke: false
                  }}
                  eventHandlers={{
                    click: () => onPointClick && onPointClick(c)
                  }}
                />
                {/* Core Heat Center */}
                <CircleMarker
                  center={c.coords}
                  radius={c.radius * 0.75}
                  pathOptions={{
                    fillColor: c.heatColor,
                    fillOpacity: 0.85,
                    color: '#ffffff',
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => onPointClick && onPointClick(c)
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 space-y-2 text-xs min-w-[210px] text-foreground">
                      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5">
                        <span className="font-bold text-foreground text-sm">{c.issueType}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.isResolved 
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                            : c.isCritical 
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' 
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 leading-relaxed">{c.description}</p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-1">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span className="truncate">{c.address}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-muted-foreground border-t border-border/40">
                        <span>Severity: <strong className="text-foreground">{c.priority}</strong></span>
                        <span>🔥 {c.upvoteCount || 0} upvotes</span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            ))}
          </>
        )}

        {/* PIN MARKERS LAYER */}
        {mapLayer === 'markers' && (
          <>
            {filteredComplaints.map((c) => (
              <Marker
                key={c._id || c.id}
                position={c.coords}
                icon={createMarkerIcon(c.priority, c.status)}
                eventHandlers={{
                  click: () => onPointClick && onPointClick(c)
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 space-y-2 text-xs min-w-[220px] text-foreground">
                    <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5">
                      <span className="font-bold text-foreground text-sm">{c.issueType}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.isResolved 
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                          : c.isCritical 
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' 
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    {c.photo && (
                      <div className="h-20 w-full rounded-xl overflow-hidden border border-border/60 bg-muted/30">
                        <img src={c.photo} alt="Issue" className="h-full w-full object-cover" />
                      </div>
                    )}

                    <p className="text-muted-foreground line-clamp-2 leading-relaxed">{c.description}</p>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-muted-foreground border-t border-border/40">
                      <span>Severity: <strong className="text-foreground">{c.priority}</strong></span>
                      <span>🔥 {c.upvoteCount || 0} upvotes</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>

      {/* Floating Bottom Legend Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/90 px-3.5 py-1.5 backdrop-blur-md shadow-lg text-[11px] font-bold text-foreground pointer-events-auto">
          <span className="text-muted-foreground">Heat Density:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span className="text-xs font-semibold">Elevated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="text-xs font-semibold text-destructive">Critical Cluster</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/90 px-3.5 py-1.5 backdrop-blur-md shadow-lg text-[11px] font-semibold text-muted-foreground pointer-events-auto">
          Plotted: <strong className="text-foreground">{filteredComplaints.length}</strong> complaints
        </div>
      </div>
    </div>
  );
}
