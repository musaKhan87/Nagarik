import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, X, Loader2, MapPin, Navigation, CheckCircle2 } from 'lucide-react';

// Custom crisp SVG Pin Icon that does not depend on external image CDNs
const customPinIcon = L.divIcon({
  className: 'custom-leaflet-pin',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
      <div style="
        background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
        color: white;
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 16px rgba(239, 68, 68, 0.4), 0 2px 6px rgba(0,0,0,0.3);
        border: 3px solid #ffffff;
      ">
        <svg style="transform: rotate(45deg); width: 18px; height: 18px;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
        </svg>
      </div>
      <div style="
        width: 12px;
        height: 5px;
        background: rgba(0, 0, 0, 0.35);
        border-radius: 50%;
        filter: blur(1.5px);
        margin-top: -2px;
      "></div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
  popupAnchor: [0, -38]
});

// Component to handle map click events
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to smoothly recenter map when coordinates change
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { duration: 0.8 });
    }
  }, [lat, lng, map]);
  return null;
}

/**
 * LocationPicker — Interactive Leaflet Map with:
 *  - Click on map to place pin & auto reverse-geocode address
 *  - Drag marker to refine location
 *  - Type address to search with autocomplete & auto-pin
 *  - "Locate Me" button to pin current device GPS
 */
export function LocationPicker({ location, onLocationChange, height = '340px' }) {
  const [searchQuery, setSearchQuery] = useState(location?.address || '');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [locatingDevice, setLocatingDevice] = useState(false);
  const searchTimeoutRef = useRef(null);

  const activeLat = Number(location?.lat) || 19.076;
  const activeLng = Number(location?.lng) || 72.877;

  // Reverse geocode coordinates -> readable street address
  const reverseGeocode = async (lat, lng) => {
    setReverseGeocoding(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.display_name) {
          const formattedAddress = data.display_name;
          onLocationChange({ lat, lng, address: formattedAddress });
          setSearchQuery(formattedAddress);
          return;
        }
      }
      throw new Error('Reverse geocode failed');
    } catch {
      const fallback = `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      onLocationChange({ lat, lng, address: fallback });
      setSearchQuery(fallback);
    } finally {
      setReverseGeocoding(false);
    }
  };

  // Search address -> geocode
  const handleSearch = async (query) => {
    const trimmed = (query || '').trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        setSearchResults(data || []);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search as user types
  const handleSearchInput = (value) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.trim().length >= 3) {
      searchTimeoutRef.current = setTimeout(() => handleSearch(value), 450);
    } else {
      setSearchResults([]);
    }
  };

  // Select a search result
  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onLocationChange({
      lat,
      lng,
      address: result.display_name
    });
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  // Trigger search on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      handleSearch(searchQuery);
    }
  };

  // Locate current device GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingDevice(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        reverseGeocode(lat, lng);
        setLocatingDevice(false);
      },
      (err) => {
        console.error('GPS error:', err);
        setLocatingDevice(false);
        alert('Could not retrieve current device location. Please click on map or search address.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Address Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition">
          <Search className="h-4 w-4 text-primary shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type address, landmark, or street name..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {searching && <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />}
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="p-1 text-muted-foreground hover:text-foreground transition rounded-full hover:bg-muted"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSearch(searchQuery)}
            className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition shrink-0"
          >
            Search
          </button>
        </div>

        {/* Search Results Dropdown with high z-index over Leaflet */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-[1100] mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-lg">
            {searchResults.map((result, i) => (
              <button
                key={result.place_id || i}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-primary/10 transition border-b border-border/50 last:border-b-0"
              >
                <MapPin className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                    {result.display_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-border shadow-md isolate" style={{ height }}>
        <MapContainer
          center={[activeLat, activeLng]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 10 }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={reverseGeocode} />
          <RecenterMap lat={activeLat} lng={activeLng} />
          <Marker
            position={[activeLat, activeLng]}
            icon={customPinIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                reverseGeocode(pos.lat, pos.lng);
              }
            }}
          />
        </MapContainer>

        {/* Floating Quick Action: "Use My GPS" Button on top of map */}
        <div className="absolute top-3 right-3 z-30">
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingDevice}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card/90 px-3 py-1.5 text-xs font-bold text-foreground shadow-lg backdrop-blur-md hover:bg-primary hover:text-primary-foreground transition disabled:opacity-50"
            title="Locate my device position"
          >
            <Navigation className={`h-3.5 w-3.5 ${locatingDevice ? 'animate-spin' : ''}`} />
            <span>{locatingDevice ? 'Locating...' : 'Locate Me'}</span>
          </button>
        </div>

        {/* Floating Instructions Banner at bottom of map */}
        <div className="absolute bottom-2 left-2 right-2 z-30 pointer-events-none">
          <div className="mx-auto max-w-fit rounded-full bg-slate-900/85 px-3 py-1 text-[11px] font-medium text-white shadow-md backdrop-blur-sm flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span>Click map or drag pin to select exact spot</span>
          </div>
        </div>
      </div>

      {/* Selected Location Confirmation Card */}
      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-3.5 transition">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary shrink-0">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Selected Location</span>
              {reverseGeocoding && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" /> Fetching address...
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-foreground break-words mt-0.5 leading-snug">
              {location?.address || 'No address selected'}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-muted-foreground">
              <span>LAT: {activeLat.toFixed(6)}</span>
              <span>•</span>
              <span>LNG: {activeLng.toFixed(6)}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-sans font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
