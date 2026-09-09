import React, { useState, useRef } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Search,
  Filter,
  Shield,
  Ambulance,
  AlertTriangle,
  Users,
  Tent,
  CheckCircle2,
  Navigation,
  X,
  Compass,
  Eye,
  Info,
  Building,
  Check,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { Building as BuildingType, DistressRequest, RescueTeam, Shelter, BlockedRoad } from '../types';
import { matchesIdOrText } from '../utils/searchUtils';

interface MapLayerState {
  people: boolean;
  distress: boolean;
  unaccounted: boolean;
  rescueTeams: boolean;
  shelters: boolean;
  hospitals: boolean;
  blockedRoads: boolean;
  evacuationRoutes: boolean;
  damageZones: boolean;
  searchAreas: boolean;
}

export const LiveMap: React.FC<{ isMini?: boolean }> = ({ isMini = false }) => {
  const {
    buildings,
    distressRequests,
    rescueTeams,
    shelters,
    hospitals,
    blockedRoads,
    people,
    assignTeamToRequest,
    markRequestRescued,
    markRequestNotFound,
    setSelectedPerson,
    setActiveTab,
  } = useDisaster();

  // Map viewport state (zoom and pan offsets)
  const [zoom, setZoom] = useState<number>(isMini ? 1.0 : 1.15);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layers toggle
  const [layers, setLayers] = useState<MapLayerState>({
    people: true,
    distress: true,
    unaccounted: true,
    rescueTeams: true,
    shelters: true,
    hospitals: true,
    blockedRoads: true,
    evacuationRoutes: true,
    damageZones: true,
    searchAreas: true,
  });

  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<'TACTICAL_DARK' | 'SATELLITE_OVERLAY'>('TACTICAL_DARK');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [mapPlatformMode, setMapPlatformMode] = useState<'VECTOR' | 'GOOGLE_MAPS'>('VECTOR');
  const [selectedGMapTarget, setSelectedGMapTarget] = useState<{
    name: string;
    lat: number;
    lng: number;
    type: string;
    zone?: string;
  } | null>(null);

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'DISTRESS' | 'BUILDING' | 'TEAM' | 'SHELTER' | 'ROAD' | 'AI_ZONE' | 'HOSPITAL';
    data: any;
  } | null>(null);

  // AI Search Area decision-support state
  const [aiSearchDecision, setAiSearchDecision] = useState<'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'REJECTED'>('PENDING');

  // Map search matches
  const mapMatches = React.useMemo(() => {
    const q = searchFilter.trim();
    if (!q) return null;
    const reqs = distressRequests.filter(
      (r) =>
        matchesIdOrText(r.id, q) ||
        matchesIdOrText(r.reporterName, q) ||
        matchesIdOrText(r.locationName, q) ||
        matchesIdOrText(r.personId, q)
    );
    const blds = buildings.filter(
      (b) => matchesIdOrText(b.id, q) || matchesIdOrText(b.name, q) || matchesIdOrText(b.areaZone, q)
    );
    const tms = rescueTeams.filter(
      (t) => matchesIdOrText(t.id, q) || matchesIdOrText(t.name, q) || matchesIdOrText(t.leader, q)
    );
    const shs = shelters.filter(
      (s) => matchesIdOrText(s.id, q) || matchesIdOrText(s.name, q) || matchesIdOrText(s.location, q)
    );
    const rds = blockedRoads.filter(
      (r) => matchesIdOrText(r.id, q) || matchesIdOrText(r.roadName, q) || matchesIdOrText(r.reason, q)
    );
    return {
      reqs,
      blds,
      tms,
      shs,
      rds,
      total: reqs.length + blds.length + tms.length + shs.length + rds.length,
    };
  }, [searchFilter, distressRequests, buildings, rescueTeams, shelters, blockedRoads]);

  const centerOnEntity = (lat: number, lng: number, entity: any, type: any) => {
    setSelectedEntity({ type, data: entity });
    const pt = toSvgCoords(lat, lng);
    setPan({ x: 500 - pt.x, y: 350 - pt.y });
    setZoom(1.5);
  };

  // Map coordinate conversion helpers (Bengaluru CBD centered around 12.972, 77.608)
  // Map dimensions: 1000 x 700 viewBox
  const mapCenter = { lat: 12.972, lng: 77.608 };
  const latSpan = 0.05; // ~5.5 km
  const lngSpan = 0.07; // ~7.5 km

  const toSvgCoords = (lat: number, lng: number) => {
    // Mercator-like projection to SVG viewBox
    const x = ((lng - (mapCenter.lng - lngSpan / 2)) / lngSpan) * 1000;
    const y = (((mapCenter.lat + latSpan / 2) - lat) / latSpan) * 700;
    return { x, y };
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // AI Probable Search Area coordinates (Centered around Person #182 last ping)
  const aiSearchCenter = toSvgCoords(12.9752, 77.6095);

  return (
    <div className={`relative bg-[#070b14] rounded-xl border border-slate-800 overflow-hidden select-none flex flex-col ${isMini ? 'h-[360px]' : 'h-[calc(100vh-135px)] min-h-[520px]'}`}>
      {/* Top Floating Map Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Map title & style switcher */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/95 border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-mono">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span className="text-white font-bold">GIS TACTICAL GRID: BENGALURU CBD</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-400">12.97°N, 77.60°E</span>
          </div>

          <button
            onClick={() => setMapStyle(mapStyle === 'TACTICAL_DARK' ? 'SATELLITE_OVERLAY' : 'TACTICAL_DARK')}
            className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg shadow-lg text-[11px] font-mono text-slate-300 transition-colors backdrop-blur-md"
          >
            {mapStyle === 'TACTICAL_DARK' ? '🛰️ SATELLITE' : '🗺️ VECTOR'}
          </button>
        </div>

        {/* Right: Layer filter, Search & Zoom Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Search */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search #ID or marker..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-slate-900/95 border border-slate-700 text-xs px-2.5 py-1.5 pl-7 pr-7 rounded-lg text-slate-200 placeholder-slate-500 w-44 lg:w-56 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-3 h-3 text-cyan-400 absolute left-2.5 top-2.5" />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Quick Map Search Matches Popover */}
            {searchFilter && mapMatches && (
              <div className="absolute top-full right-0 mt-1.5 w-64 bg-[#0a1120] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 max-h-64 overflow-y-auto text-xs space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 border-b border-slate-800 flex justify-between">
                  <span>Found {mapMatches.total} map marker{mapMatches.total !== 1 ? 's' : ''}</span>
                  <span className="text-cyan-400">Click to jump</span>
                </div>
                {mapMatches.total === 0 && (
                  <div className="p-3 text-center text-slate-500 text-[11px]">
                    No markers matching &ldquo;{searchFilter}&rdquo;
                  </div>
                )}
                {mapMatches.reqs.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => centerOnEntity(r.coordinates.lat, r.coordinates.lng, r, 'DISTRESS')}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between group"
                  >
                    <div className="truncate">
                      <span className="font-mono text-red-400 font-bold mr-1.5">#{r.id}</span>
                      <span className="text-slate-200">{r.reporterName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-red-400 shrink-0 ml-1">SOS</span>
                  </button>
                ))}
                {mapMatches.blds.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => centerOnEntity(b.coordinates.lat, b.coordinates.lng, b, 'BUILDING')}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between group"
                  >
                    <div className="truncate">
                      <span className="font-mono text-amber-300 font-bold mr-1.5">{b.id}</span>
                      <span className="text-slate-200">{b.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 shrink-0 ml-1">BLD</span>
                  </button>
                ))}
                {mapMatches.tms.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => centerOnEntity(t.coordinates.lat, t.coordinates.lng, t, 'TEAM')}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between group"
                  >
                    <div className="truncate">
                      <span className="font-mono text-cyan-300 font-bold mr-1.5">{t.id}</span>
                      <span className="text-slate-200">{t.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 shrink-0 ml-1">TEAM</span>
                  </button>
                ))}
                {mapMatches.shs.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => centerOnEntity(s.coordinates.lat, s.coordinates.lng, s, 'SHELTER')}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between group"
                  >
                    <div className="truncate">
                      <span className="font-mono text-emerald-400 font-bold mr-1.5">{s.id}</span>
                      <span className="text-slate-200">{s.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 shrink-0 ml-1">SHELTER</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Google Maps Platform Toggle */}
          <button
            onClick={() => setMapPlatformMode(mapPlatformMode === 'VECTOR' ? 'GOOGLE_MAPS' : 'VECTOR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono shadow-xl backdrop-blur-md transition-all ${
              mapPlatformMode === 'GOOGLE_MAPS'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-slate-700'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {mapPlatformMode === 'GOOGLE_MAPS' ? 'TACTICAL RADAR' : 'GOOGLE MAPS'}
            </span>
          </button>

          {/* Layer Panel Button */}
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono shadow-xl backdrop-blur-md transition-colors ${
              showLayerPanel
                ? 'bg-cyan-600 text-white border-cyan-500'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LAYERS</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border-r border-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border-r border-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(1.15);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs font-mono"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Layer Toggle Floating Drawer */}
      {showLayerPanel && (
        <div className="absolute top-14 right-3 z-30 w-64 bg-slate-900/95 border border-slate-700/90 rounded-xl shadow-2xl p-3 backdrop-blur-lg text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>MAP LAYERS</span>
            </div>
            <button
              onClick={() => setShowLayerPanel(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {[
              { key: 'distress', label: '🔴 Distress Requests', color: 'text-red-400' },
              { key: 'unaccounted', label: '🟡 Unaccounted Citizens', color: 'text-amber-400' },
              { key: 'rescueTeams', label: '🔵 Rescue Teams', color: 'text-cyan-400' },
              { key: 'shelters', label: '🏕️ Shelters & Evac Hubs', color: 'text-emerald-400' },
              { key: 'hospitals', label: '🏥 Hospitals & Trauma', color: 'text-blue-400' },
              { key: 'blockedRoads', label: '🚧 Blocked Roads', color: 'text-rose-400' },
              { key: 'evacuationRoutes', label: '🟢 Evacuation Routes', color: 'text-emerald-300' },
              { key: 'damageZones', label: '⚠️ Structural Damage Zones', color: 'text-amber-300' },
              { key: 'searchAreas', label: '🎯 AI Search Areas', color: 'text-purple-400' },
            ].map((layer) => (
              <label
                key={layer.key}
                className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer text-slate-300"
              >
                <span className={`flex items-center gap-2 ${layer.color}`}>{layer.label}</span>
                <input
                  type="checkbox"
                  checked={layers[layer.key as keyof MapLayerState]}
                  onChange={(e) =>
                    setLayers((prev) => ({
                      ...prev,
                      [layer.key]: e.target.checked,
                    }))
                  }
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Google Maps Platform Live Mode */}
      {mapPlatformMode === 'GOOGLE_MAPS' ? (
        <div className="w-full h-full bg-slate-950 flex flex-col relative overflow-hidden">
          {/* Quick Select Bar for Buildings, Shelters, and Hospitals */}
          <div className="bg-slate-900/95 border-b border-slate-800 p-2.5 flex items-center gap-2 overflow-x-auto text-xs font-mono shrink-0 z-20">
            <span className="text-slate-400 font-bold shrink-0 text-[11px] uppercase">
              Jump to Real-Time Google Map Pin:
            </span>

            <button
              onClick={() => setSelectedGMapTarget(null)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all border ${
                selectedGMapTarget === null
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              📍 Sector Overview (12.9716, 77.5946)
            </button>

            {buildings.map((b) => (
              <button
                key={b.id}
                onClick={() =>
                  setSelectedGMapTarget({
                    name: b.name,
                    lat: b.coordinates.lat,
                    lng: b.coordinates.lng,
                    type: 'BUILDING',
                    zone: b.areaZone,
                  })
                }
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all border ${
                  selectedGMapTarget?.name === b.name
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow'
                    : 'bg-slate-800 text-cyan-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                🏢 {b.id} ({b.areaZone.split(' ')[0]})
              </button>
            ))}

            {shelters.map((s) => (
              <button
                key={s.id}
                onClick={() =>
                  setSelectedGMapTarget({
                    name: s.name,
                    lat: s.coordinates.lat,
                    lng: s.coordinates.lng,
                    type: 'SHELTER',
                    zone: s.location,
                  })
                }
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all border ${
                  selectedGMapTarget?.name === s.name
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow'
                    : 'bg-slate-800 text-emerald-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                ⛺ {s.id} ({s.name.split(' ')[0]})
              </button>
            ))}

            {hospitals.map((h) => (
              <button
                key={h.id}
                onClick={() =>
                  setSelectedGMapTarget({
                    name: h.name,
                    lat: h.coordinates.lat,
                    lng: h.coordinates.lng,
                    type: 'HOSPITAL',
                    zone: h.address,
                  })
                }
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all border ${
                  selectedGMapTarget?.name === h.name
                    ? 'bg-rose-500 text-slate-950 font-bold border-rose-400 shadow'
                    : 'bg-slate-800 text-rose-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                🏥 {h.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Embedded Google Maps Frame */}
          <div className="flex-1 relative w-full h-full bg-slate-950">
            {(() => {
              const activeLat = selectedGMapTarget ? selectedGMapTarget.lat : 12.9716;
              const activeLng = selectedGMapTarget ? selectedGMapTarget.lng : 77.5946;
              const activeTitle = selectedGMapTarget ? selectedGMapTarget.name : 'Bengaluru Central Incident Command Zone';
              const activeGMapUrl = `https://www.google.com/maps/search/?api=1&query=${activeLat},${activeLng}`;
              const activeDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${activeLat},${activeLng}`;
              const activeStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${activeLat},${activeLng}`;

              return (
                <>
                  <iframe
                    title="Real-Time Google Maps Platform View"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${activeLat},${activeLng}&hl=en&z=${selectedGMapTarget ? 17 : 14}&output=embed`}
                    className="w-full h-full"
                  />

                  {/* Top Floating Telemetry Card */}
                  <div className="absolute top-4 left-4 z-10 bg-slate-950/90 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-sm space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white text-sm truncate">{activeTitle}</span>
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                        {selectedGMapTarget?.type || 'INCIDENT HUB'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Coordinates: <strong className="text-cyan-300">{activeLat.toFixed(4)}° N, {activeLng.toFixed(4)}° E</strong>
                      {selectedGMapTarget?.zone && ` • ${selectedGMapTarget.zone}`}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2 flex-wrap">
                      <a
                        href={activeGMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px] transition-all"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open on Google Maps</span>
                      </a>
                      <a
                        href={activeDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-2 py-1 rounded text-[11px] transition-colors"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Directions</span>
                      </a>
                      <a
                        href={activeStreetViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-1 rounded text-[11px] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Street View</span>
                      </a>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ) : (
        /* SVG Canvas Tactical Map Body */
        <div
          className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full object-cover transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
          }}
        >
          {/* Map Background Grids */}
          <rect width="1000" height="700" fill={mapStyle === 'TACTICAL_DARK' ? '#070c18' : '#0a101d'} />

          <defs>
            {/* Grid Pattern */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#131d31" strokeWidth="0.75" />
            </pattern>
            {/* Fine Subgrid */}
            <pattern id="subGridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#0e1726" strokeWidth="0.4" />
            </pattern>
            {/* Blocked Road Striped Pattern */}
            <pattern id="blockedStripe" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#ef4444" strokeWidth="3" />
            </pattern>
            {/* Radial glow for critical distress */}
            <radialGradient id="pulseGlowRed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="aiSearchGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Render background grid patterns */}
          <rect width="1000" height="700" fill="url(#subGridPattern)" />
          <rect width="1000" height="700" fill="url(#gridPattern)" />

          {/* Tactical Coordinate Axis Labels */}
          <g opacity="0.3" fill="#64748b" fontSize="9" fontFamily="monospace">
            <text x="10" y="25">77°35'E</text>
            <text x="320" y="25">77°36'E (MG Road)</text>
            <text x="640" y="25">77°37'E (Trinity)</text>
            <text x="920" y="25">77°38'E</text>
            <text x="15" y="180">12°59'N</text>
            <text x="15" y="380">12°58'N (CBD)</text>
            <text x="15" y="580">12°57'N</text>
          </g>

          {/* City Arterial Streets & Roads (Dark Gray Lines) */}
          <g stroke="#1a253b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
            {/* MG Road Arterial */}
            <path d="M 120 280 L 350 290 L 520 295 L 750 310 L 920 320" />
            {/* Brigade Road */}
            <path d="M 460 160 L 470 292 L 485 450 L 510 620" />
            {/* Residency Road / Kasturba Road */}
            <path d="M 160 380 L 340 370 L 500 380 L 780 400" />
            {/* Commercial Street Corridor */}
            <path d="M 400 170 L 620 180 L 780 190" />
            {/* Richmond Circle & Hosur Road Connector */}
            <path d="M 320 480 L 490 460 L 700 480" />
            {/* Sampangi Rama Nagar link to Kanteerava */}
            <path d="M 220 320 L 250 420 L 320 480" />
          </g>

          {/* Secondary road network */}
          <g stroke="#131e33" strokeWidth="2.5" strokeLinecap="round">
            <path d="M 280 200 L 290 370" />
            <path d="M 600 220 L 610 420" />
            <path d="M 380 420 L 390 560" />
            <path d="M 670 320 L 680 540" />
            <path d="M 150 250 L 850 270" strokeDasharray="3 4" opacity="0.4" />
          </g>

          {/* Zone Boundaries & Hazard Polygons */}
          {layers.damageZones && (
            <g>
              {/* Zone 1 Epicenter Hazard Polygon (Red High Risk) */}
              <polygon
                points="340,160 620,170 660,340 460,370 360,260"
                fill="#ef4444"
                fillOpacity="0.08"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text x="370" y="210" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold" opacity="0.7">
                ZONE 1: HIGH STRUCTURAL DAMAGE (SHAKE INTENSITY VIII)
              </text>

              {/* Zone 2 Moderate Damage Polygon (Amber) */}
              <polygon
                points="280,380 680,390 620,560 300,540"
                fill="#f59e0b"
                fillOpacity="0.05"
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text x="310" y="525" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold" opacity="0.6">
                ZONE 2: MODERATE DAMAGE
              </text>
            </g>
          )}

          {/* AI Search Area Overlays (Section 13) */}
          {layers.searchAreas && (
            <g>
              {/* Probable Search Zone (1.8 km²) - Amber/Purple Ring */}
              <circle
                cx={aiSearchCenter.x}
                cy={aiSearchCenter.y}
                r="110"
                fill="url(#aiSearchGlow)"
                stroke="#a855f7"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                className="animate-pulse"
              />

              {/* High-Probability Core Search Zone (0.42 km²) - Red Inner Circle */}
              <circle
                cx={aiSearchCenter.x + 10}
                cy={aiSearchCenter.y - 12}
                r="48"
                fill="#ef4444"
                fillOpacity="0.18"
                stroke="#ef4444"
                strokeWidth="2"
              />

              <g
                className="cursor-pointer"
                onClick={() =>
                  setSelectedEntity({
                    type: 'AI_ZONE',
                    data: {
                      person: 'Rahul Verma (Person #182)',
                      confidence: 72,
                      probableZone: '1.8 km²',
                      highProbZone: '0.42 km²',
                      lastContact: '14:03 IST',
                      latestReport: '15:00 IST — Point B',
                    },
                  })
                }
              >
                <circle cx={aiSearchCenter.x + 10} cy={aiSearchCenter.y - 12} r="6" fill="#a855f7" />
                <text
                  x={aiSearchCenter.x + 22}
                  y={aiSearchCenter.y - 10}
                  fill="#c084fc"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  AI SEARCH CORE: P#182 (Conf. 72%)
                </text>
              </g>
            </g>
          )}

          {/* Evacuation Route Polylines (Section 21) */}
          {layers.evacuationRoutes && (
            <g>
              {/* Recommended Route: Building A -> Shelter #12 (Kanteerava Stadium) */}
              <path
                d="M 520 260 L 460 292 L 340 370 L 250 420 L 210 460"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeDasharray="6 3"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <text x="320" y="415" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">
                EVAC ROUTE: BLD-A &rarr; SH-12 (4.2 km • 11 min)
              </text>
            </g>
          )}

          {/* Blocked Roads Overlays (Section 19) */}
          {layers.blockedRoads &&
            blockedRoads.map((road) => {
              const fromCoords = toSvgCoords(road.coordinates.from.lat, road.coordinates.from.lng);
              const toCoords = toSvgCoords(road.coordinates.to.lat, road.coordinates.to.lng);
              const isBlocked = road.status === 'BLOCKED';

              return (
                <g
                  key={road.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedEntity({ type: 'ROAD', data: road })}
                >
                  {/* Road line with red crosshatches or solid warning stroke */}
                  <line
                    x1={fromCoords.x}
                    y1={fromCoords.y}
                    x2={toCoords.x}
                    y2={toCoords.y}
                    stroke={isBlocked ? '#ef4444' : '#f59e0b'}
                    strokeWidth="6"
                    strokeLinecap="square"
                    strokeDasharray={isBlocked ? '6 4' : '8 3'}
                  />
                  {/* Road blockage marker icon in center */}
                  <circle
                    cx={(fromCoords.x + toCoords.x) / 2}
                    cy={(fromCoords.y + toCoords.y) / 2}
                    r="8"
                    fill="#1e1b2e"
                    stroke={isBlocked ? '#ef4444' : '#f59e0b'}
                    strokeWidth="1.5"
                  />
                  <text
                    x={(fromCoords.x + toCoords.x) / 2}
                    y={(fromCoords.y + toCoords.y) / 2 + 3}
                    textAnchor="middle"
                    fill={isBlocked ? '#ef4444' : '#f59e0b'}
                    fontSize="9"
                    fontWeight="bold"
                  >
                    ✕
                  </text>
                </g>
              );
            })}

          {/* Hospitals */}
          {layers.hospitals &&
            hospitals.map((hosp) => {
              const pt = toSvgCoords(hosp.coordinates.lat, hosp.coordinates.lng);
              const isLowBeds = hosp.bedAvailabilityIndex < 40;
              return (
                <g
                  key={hosp.id}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedEntity({ type: 'HOSPITAL', data: hosp })}
                >
                  <circle
                    r="12"
                    fill={isLowBeds ? '#4c0519' : '#1e293b'}
                    stroke={isLowBeds ? '#f43f5e' : '#38bdf8'}
                    strokeWidth="2"
                    className="group-hover:scale-110 transition-transform"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={isLowBeds ? '#fda4af' : '#7dd3fc'}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    H
                  </text>
                  <text
                    x="15"
                    y="3"
                    fill={isLowBeds ? '#fb7185' : '#bae6fd'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {hosp.name.split(' ')[0]} ({hosp.beds.available} beds • BAI {hosp.bedAvailabilityIndex})
                  </text>
                </g>
              );
            })}

          {/* Shelters */}
          {layers.shelters &&
            shelters.map((sh) => {
              const pt = toSvgCoords(sh.coordinates.lat, sh.coordinates.lng);
              return (
                <g
                  key={sh.id}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedEntity({ type: 'SHELTER', data: sh })}
                >
                  <circle r="12" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                  <text x="0" y="3.5" textAnchor="middle" fill="#a7f3d0" fontSize="10">
                    🏕️
                  </text>
                  <text x="15" y="3" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {sh.name.split(' ')[0]} #{sh.id.split('-')[1]} ({sh.availableBeds} beds left)
                  </text>
                </g>
              );
            })}

          {/* Buildings */}
          {buildings.map((bld) => {
            const pt = toSvgCoords(bld.coordinates.lat, bld.coordinates.lng);
            const isSevere = bld.damageLevel === 'SEVERE';
            return (
              <g
                key={bld.id}
                transform={`translate(${pt.x}, ${pt.y})`}
                className="cursor-pointer group"
                onClick={() => setSelectedEntity({ type: 'BUILDING', data: bld })}
              >
                {/* Building Footprint Card */}
                <rect
                  x="-16"
                  y="-16"
                  width="32"
                  height="32"
                  rx="4"
                  fill="#0f172a"
                  stroke={isSevere ? '#ef4444' : '#f59e0b'}
                  strokeWidth="2"
                />
                <text x="0" y="4" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold">
                  {bld.id.replace('BLD-', '')}
                </text>

                {/* Score Pill on top */}
                <rect x="-14" y="-27" width="28" height="10" rx="3" fill="#1e293b" stroke="#334155" />
                <text x="0" y="-19.5" textAnchor="middle" fill="#f87171" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  {bld.finalPriorityScore}
                </text>

                {/* Sub-label */}
                <text x="0" y="26" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  {bld.name.split(' ')[0]} ({bld.unaccountedCount} unacc.)
                </text>
              </g>
            );
          })}

          {/* Rescue Teams */}
          {layers.rescueTeams &&
            rescueTeams.map((team) => {
              const pt = toSvgCoords(team.coordinates.lat, team.coordinates.lng);
              const isAssigned = team.status === 'ASSIGNED';

              return (
                <g
                  key={team.id}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedEntity({ type: 'TEAM', data: team })}
                >
                  {/* Heading vector arrow if assigned */}
                  {isAssigned && (
                    <line x1="0" y1="0" x2="25" y2="-15" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 2" />
                  )}

                  {/* Pulsing ring */}
                  <circle r="14" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
                  <circle r="10" fill="#083344" stroke="#06b6d4" strokeWidth="2" />
                  <text x="0" y="3.5" textAnchor="middle" fill="#67e8f9" fontSize="8.5" fontWeight="bold">
                    🚑
                  </text>
                  <text x="13" y="3" fill="#22d3ee" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    {team.id} ({team.status})
                  </text>
                </g>
              );
            })}

          {/* Distress Request Markers (Red/Orange with pulsing rings) */}
          {layers.distress &&
            distressRequests
              .filter((r) => r.status !== 'RESCUED')
              .map((req) => {
                const pt = toSvgCoords(req.coordinates.lat, req.coordinates.lng);
                const isCritical = req.status === 'CRITICAL';

                return (
                  <g
                    key={req.id}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    className="cursor-pointer group"
                    onClick={() => setSelectedEntity({ type: 'DISTRESS', data: req })}
                  >
                    {/* Glowing pulse */}
                    <circle r="20" fill="url(#pulseGlowRed)" className="animate-pulse" />
                    <circle
                      r="10"
                      fill={isCritical ? '#dc2626' : '#ea580c'}
                      stroke="#fecaca"
                      strokeWidth="2"
                    />
                    <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                      SOS
                    </text>

                    {/* Label Badge */}
                    <g transform="translate(12, -8)">
                      <rect width="64" height="16" rx="3" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
                      <text x="4" y="11" fill="#f87171" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        #{req.id} • {req.calculatedScore}pt
                      </text>
                    </g>
                  </g>
                );
              })}
        </svg>

        {/* Tactical Legend Box (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 border border-slate-700/80 rounded-lg p-2.5 shadow-xl backdrop-blur-md text-[10px] font-mono text-slate-300 space-y-1 hidden sm:block">
          <div className="text-[11px] font-bold text-white border-b border-slate-800 pb-1 mb-1">
            GIS MAP SYMBOLS
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical Distress</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Rescue Team</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Unaccounted</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Shelter Open</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-red-500"></span> Blocked Road</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-emerald-400 border border-emerald-300"></span> Evac Corridor</span>
          </div>
        </div>
      </div>
      )}

      {/* Slide-out Entity Inspector Panel */}
      {selectedEntity && (
        <div className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-[#0a101d] border-l border-slate-700 shadow-2xl p-4 z-40 overflow-y-auto font-sans flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div>
            {/* Header with close */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-semibold">
                  {selectedEntity.type} INSPECTOR
                </span>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content per entity type */}
            <div className="mt-4 space-y-4">
              {selectedEntity.type === 'DISTRESS' && (
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">
                      Request #{selectedEntity.data.id}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                      SCORE {selectedEntity.data.calculatedScore}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mt-1">
                    Reporter: <strong className="text-slate-200">{selectedEntity.data.reporterName}</strong> ({selectedEntity.data.peopleCount} people)
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                    <div className="text-slate-400">Location:</div>
                    <div className="text-slate-200 font-medium">{selectedEntity.data.locationName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      GPS Accuracy: ±{selectedEntity.data.deviceInfo.gpsAccuracyMeters}m • Battery: {selectedEntity.data.deviceInfo.batteryLevel}% • Connectivity: {selectedEntity.data.deviceInfo.connectivity}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs font-bold text-slate-300 mb-1.5">Reported Situations:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEntity.data.situations.trapped && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-red-950 text-red-300 border border-red-800 font-medium">
                          Trapped (+20)
                        </span>
                      )}
                      {selectedEntity.data.situations.waterRising && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-blue-950 text-blue-300 border border-blue-800 font-medium">
                          Water Rising (+30)
                        </span>
                      )}
                      {selectedEntity.data.situations.fire && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-amber-950 text-amber-300 border border-amber-800 font-medium">
                          Fire (+30)
                        </span>
                      )}
                      {selectedEntity.data.situations.childrenCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-purple-950 text-purple-300 border border-purple-800 font-medium">
                          {selectedEntity.data.situations.childrenCount} Child (+{selectedEntity.data.situations.childrenCount * 20})
                        </span>
                      )}
                      {selectedEntity.data.situations.heavilyInjuredCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-rose-950 text-rose-300 border border-rose-800 font-medium">
                          {selectedEntity.data.situations.heavilyInjuredCount} Injured (+{selectedEntity.data.situations.heavilyInjuredCount * 30})
                        </span>
                      )}
                    </div>
                    {selectedEntity.data.situations.otherNotes && (
                      <p className="text-xs text-slate-300 italic mt-2 bg-slate-900/60 p-2 rounded border border-slate-800">
                        "{selectedEntity.data.situations.otherNotes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-300">Operational Actions:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          markRequestRescued(selectedEntity.data.id);
                          setSelectedEntity(null);
                        }}
                        className="w-full py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        SAFELY RESCUED
                      </button>
                      <button
                        onClick={() => {
                          markRequestNotFound(selectedEntity.data.id);
                          setSelectedEntity(null);
                        }}
                        className="w-full py-2 px-2 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors"
                      >
                        NOT FOUND
                      </button>
                    </div>

                    <div className="pt-2">
                      <div className="text-[11px] text-slate-400 mb-1">Dispatch Rescue Squad:</div>
                      <div className="space-y-1">
                        {(rescueTeams || [])
                          .filter((t) => t.status === 'AVAILABLE')
                          .map((team) => (
                            <button
                              key={team.id}
                              onClick={() => {
                                assignTeamToRequest(selectedEntity.data.id, team.id);
                                setSelectedEntity(null);
                              }}
                              className="w-full text-left p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 flex items-center justify-between border border-slate-700"
                            >
                              <span>{team.name}</span>
                              <span className="font-mono text-[10px] text-emerald-400">DISPATCH &rarr;</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedEntity.type === 'BUILDING' && (
                <div>
                  <h3 className="font-bold text-white text-base">{selectedEntity.data.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{selectedEntity.data.areaZone}</div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">REGISTERED</div>
                      <div className="text-base font-bold text-white">{selectedEntity.data.registeredCount}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">EXPECTED</div>
                      <div className="text-base font-bold text-amber-400">{selectedEntity.data.expectedCount}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">CONFIRMED SAFE</div>
                      <div className="text-base font-bold text-emerald-400">{selectedEntity.data.confirmedSafeCount}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">UNACCOUNTED</div>
                      <div className="text-base font-bold text-red-400">{selectedEntity.data.unaccountedCount}</div>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Composite Priority:</span>
                      <span className="font-mono font-bold text-red-400 text-sm">{selectedEntity.data.finalPriorityScore}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Formula: (0.50 × {selectedEntity.data.distressScore}) + (0.30 × {selectedEntity.data.unaccountedScore}) + (0.20 × {selectedEntity.data.hazardScore})
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab('accountability');
                        setSelectedEntity(null);
                      }}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-xs font-mono font-semibold"
                    >
                      View Detailed Building Accountability &rarr;
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedEntity.data.coordinates.lat},${selectedEntity.data.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-colors text-center"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Google Maps</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEntity.data.coordinates.lat},${selectedEntity.data.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 rounded text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-colors text-center"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {selectedEntity.type === 'SHELTER' && (
                <div>
                  <h3 className="font-bold text-white text-base">{selectedEntity.data.name}</h3>
                  <div className="text-xs text-slate-400">{selectedEntity.data.location}</div>

                  <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Capacity:</span>
                      <strong className="text-white">{selectedEntity.data.capacity}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Occupancy:</span>
                      <strong className="text-amber-400">{selectedEntity.data.currentOccupancy}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Available Beds:</span>
                      <strong className="text-emerald-400 font-mono text-sm">{selectedEntity.data.availableBeds}</strong>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${(selectedEntity.data.currentOccupancy / selectedEntity.data.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs">
                    <div className="font-bold text-slate-300 mb-1.5">Facilities:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedEntity.data?.facilities || []).map((fac: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab('shelters');
                        setSelectedEntity(null);
                      }}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded text-xs font-mono font-semibold"
                    >
                      Open Shelter Operations &rarr;
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedEntity.data.coordinates.lat},${selectedEntity.data.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-colors text-center"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Google Maps</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEntity.data.coordinates.lat},${selectedEntity.data.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 rounded text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-colors text-center"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {selectedEntity.type === 'HOSPITAL' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold">
                        H
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{selectedEntity.data.name}</h3>
                        <div className="text-[11px] text-rose-300 font-mono">
                          {selectedEntity.data.type} • {selectedEntity.data.distanceKm} km away
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      BAI {selectedEntity.data.bedAvailabilityIndex}/100
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Address:</span>
                      <span className="text-slate-200 text-right max-w-[200px]">{selectedEntity.data.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Available Beds:</span>
                      <strong className="text-emerald-400 font-mono text-sm">{selectedEntity.data.beds.available} / {selectedEntity.data.beds.total}</strong>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">ICU</div>
                        <div className="font-bold text-amber-400 font-mono">{selectedEntity.data.beds.icuAvailable}</div>
                      </div>
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">VENTILATORS</div>
                        <div className="font-bold text-cyan-400 font-mono">{selectedEntity.data.beds.ventilatorAvailable}</div>
                      </div>
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">TRAUMA SURGEONS</div>
                        <div className="font-bold text-emerald-400 font-mono">{selectedEntity.data.availableTraumaSurgeons}</div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Estimated Wait Time:</span>
                      <strong className="text-amber-300 font-mono">{selectedEntity.data.waitTimeMinutes} mins</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800">
                      <span className="text-amber-400 font-semibold">Triage Reason: </span>
                      {selectedEntity.data.waitTimeReason}
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab('hospitals');
                        setSelectedEntity(null);
                      }}
                      className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs font-mono transition-colors text-center"
                    >
                      OPEN HOSPITAL & BEDS DIRECTORY &rarr;
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedEntity.data.coordinates.lat},${selectedEntity.data.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-colors text-center"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Google Maps</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEntity.data.coordinates.lat},${selectedEntity.data.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 rounded text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-colors text-center"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {selectedEntity.type === 'AI_ZONE' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                      🎯
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">AI SEARCH ANALYSIS</h3>
                      <div className="text-[11px] text-purple-300 font-mono">Decision-Support Perimeter</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Subject:</span>
                      <strong className="text-white">{selectedEntity.data.person}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence Rating:</span>
                      <span className="font-mono text-purple-400 font-bold">{selectedEntity.data.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Probable Search Zone:</span>
                      <strong className="text-amber-400 font-mono">{selectedEntity.data.probableZone}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">High-Probability Core:</span>
                      <strong className="text-red-400 font-mono">{selectedEntity.data.highProbZone}</strong>
                    </div>
                  </div>

                  {/* Mandated AI disclaimer */}
                  <div className="p-2.5 rounded bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-300 leading-relaxed">
                    <strong>Notice:</strong> AI-generated search areas are decision-support estimates based on last GPS ping, time elapsed, and citizen reports. They should not replace field intelligence or professional judgment.
                  </div>

                  <div className="pt-2">
                    <div className="text-xs font-bold text-slate-300 mb-2">Commander Validation:</div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setAiSearchDecision('ACCEPTED')}
                        className={`py-1.5 px-2 rounded text-xs font-bold transition-colors ${
                          aiSearchDecision === 'ACCEPTED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-600/50'
                        }`}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setAiSearchDecision('MODIFIED')}
                        className={`py-1.5 px-2 rounded text-xs font-bold transition-colors ${
                          aiSearchDecision === 'MODIFIED'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-600/50'
                        }`}
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => setAiSearchDecision('REJECTED')}
                        className={`py-1.5 px-2 rounded text-xs font-bold transition-colors ${
                          aiSearchDecision === 'REJECTED'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-600/50'
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                    {aiSearchDecision !== 'PENDING' && (
                      <div className="mt-2 text-[11px] text-slate-400 font-mono text-center">
                        Status: Commander marked <strong>{aiSearchDecision}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedEntity.type === 'ROAD' && (
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedEntity.data.roadName}</h3>
                  <div className="mt-2 inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-950 text-red-400 border border-red-800">
                    {selectedEntity.data.status}
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                    <div className="text-slate-400">Reported Cause:</div>
                    <div className="text-slate-200">{selectedEntity.data.reason}</div>
                    <div className="text-slate-400 pt-1">Reporting Source:</div>
                    <div className="text-cyan-300 font-mono">{selectedEntity.data.source} ({selectedEntity.data.reportedAt})</div>
                  </div>
                </div>
              )}

              {selectedEntity.type === 'TEAM' && (
                <div>
                  <h3 className="font-bold text-white text-base">{selectedEntity.data.name}</h3>
                  <div className="text-xs text-cyan-400 font-mono mt-0.5">Leader: {selectedEntity.data.leader}</div>

                  <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Operational Status:</span>
                      <strong className="text-emerald-400 font-mono">{selectedEntity.data.status}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Squad Members:</span>
                      <strong className="text-white">{selectedEntity.data.membersCount} operators</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Staging:</span>
                      <strong className="text-slate-200">{selectedEntity.data.currentLocation}</strong>
                    </div>
                    {selectedEntity.data.currentAssignment && (
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-amber-400 font-semibold">Active Assignment:</span>
                        <div className="text-slate-200 mt-0.5">{selectedEntity.data.currentAssignment.targetLocation}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ETA: {selectedEntity.data.currentAssignment.etaMinutes} mins (Assigned {selectedEntity.data.currentAssignment.assignedAt})
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs">
                    <div className="font-bold text-slate-300 mb-1.5">Equipment Loadout:</div>
                    <div className="flex flex-wrap gap-1">
                      {(selectedEntity.data?.specializedEquipment || selectedEntity.data?.equipment || []).map((eq: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-right">
            <button
              onClick={() => setSelectedEntity(null)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
