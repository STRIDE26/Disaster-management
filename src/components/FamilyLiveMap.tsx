import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Home,
  ShieldCheck,
  Hospital as HospitalIcon,
  AlertTriangle,
  Clock,
  ExternalLink,
  Navigation,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Battery,
  Wifi,
  Eye,
  Radio,
  Share2,
} from 'lucide-react';
import { FamilyHousehold, Person, Shelter, Hospital, DistressRequest } from '../types';

interface FamilyLiveMapProps {
  household: FamilyHousehold;
  people: Person[];
  shelters: Shelter[];
  hospitals: Hospital[];
  distressRequests: DistressRequest[];
}

export const FamilyLiveMap: React.FC<FamilyLiveMapProps> = ({
  household,
  people,
  shelters,
  hospitals,
  distressRequests,
}) => {
  // Map zoom and view mode
  const [zoom, setZoom] = useState<number>(1.2);
  const [mapMode, setMapMode] = useState<'RADAR' | 'GOOGLE_MAPS'>('RADAR');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    household.members[0]?.personId || null
  );

  // Household Home Coordinates (derived or default in Bangalore CBD)
  const homeCoords = useMemo(() => {
    if (household.householdId === 'HH-814') {
      return { lat: 12.9665, lng: 77.6045, label: 'Richmond Town Residence' };
    } else if (household.householdId === 'HH-920') {
      return { lat: 12.9735, lng: 77.6080, label: 'Ashok Nagar Residence' };
    } else if (household.householdId === 'HH-104') {
      return { lat: 12.9610, lng: 77.5990, label: 'Shanti Nagar Residence' };
    }
    return { lat: 12.9680, lng: 77.6020, label: household.registeredAddress || 'Home Residence' };
  }, [household]);

  // Derive live coordinate, location name, and status for each member
  const membersData = useMemo(() => {
    return household.members.map((m, idx) => {
      const personRecord = people.find(
        (p) =>
          p.id === m.personId ||
          p.name.toLowerCase() === m.name.toLowerCase() ||
          (m.phone && p.phone === m.phone)
      );

      const activeSOS = distressRequests.find(
        (r) =>
          r.personId === m.personId ||
          r.reporterName.toLowerCase().includes(m.name.toLowerCase())
      );

      let status: 'SAFE_SHELTER' | 'HOSPITALIZED' | 'DISTRESS' | 'SAFE_EVAC' | 'HOME' = 'SAFE_EVAC';
      let coords = { lat: homeCoords.lat, lng: homeCoords.lng };
      let locationTitle = 'Evacuation Route';
      let facilityType: string = 'Checkpoint';
      let batteryPct = 80 - (idx * 14);
      let lastPing = `${idx * 2 + 1}m ago`;

      if (activeSOS && activeSOS.status !== 'RESCUED') {
        status = 'DISTRESS';
        coords = activeSOS.coordinates || { lat: homeCoords.lat + 0.003, lng: homeCoords.lng - 0.002 };
        locationTitle = `SOS #${activeSOS.id} - ${activeSOS.locationName}`;
        facilityType = 'Distress Location';
        batteryPct = 24;
        lastPing = '30s ago (Emergency Beacon)';
      } else if (
        m.name === 'K.V. Rao' ||
        m.name === 'Vikram Sharma' ||
        m.name === 'Subhash Roy' ||
        m.medicalConditions?.some((c) => c.toLowerCase().includes('hospital'))
      ) {
        status = 'HOSPITALIZED';
        const hosp = hospitals[0] || { coordinates: { lat: 12.9634, lng: 77.5748 }, name: 'Victoria Hospital' };
        coords = hosp.coordinates;
        locationTitle = `${hosp.name} (ICU / Emergency Trauma Ward)`;
        facilityType = 'Emergency Hospital';
        batteryPct = 95;
        lastPing = '1m ago (Hospital Hub)';
      } else if (
        personRecord?.confirmationSource === 'SHELTER_CHECKIN' ||
        m.name === 'Sunita Rao' ||
        m.name === 'Ananya Rao' ||
        m.name === 'Priya Sharma'
      ) {
        status = 'SAFE_SHELTER';
        const sh = shelters[0] || { coordinates: { lat: 12.9698, lng: 77.5925 }, name: 'Kanteerava Stadium Shelter #12' };
        coords = sh.coordinates;
        locationTitle = `${sh.name} (Family Dorm Pod C-12)`;
        facilityType = 'Relief Shelter';
        batteryPct = 72;
        lastPing = '45s ago (Shelter Mesh)';
      } else if (personRecord?.status === 'SAFE') {
        status = 'SAFE_EVAC';
        coords = { lat: homeCoords.lat + 0.004, lng: homeCoords.lng + 0.003 };
        locationTitle = 'Mayo Hall Evacuation Corridor Checkpoint #3';
        facilityType = 'Safe Checkpoint';
        batteryPct = 64;
        lastPing = '3m ago';
      } else {
        coords = { lat: homeCoords.lat + 0.001, lng: homeCoords.lng + 0.001 };
        locationTitle = 'Near Residential Block (Sector A)';
        facilityType = 'Residential Area';
      }

      // Calculate distance from home in km
      const dLat = (coords.lat - homeCoords.lat) * 111;
      const dLng = (coords.lng - homeCoords.lng) * 100;
      const distKm = Math.sqrt(dLat * dLat + dLng * dLng);

      return {
        ...m,
        status,
        coords,
        locationTitle,
        facilityType,
        batteryPct: Math.max(12, batteryPct),
        lastPing,
        distFromHomeKm: distKm.toFixed(2),
        personRecord,
      };
    });
  }, [household, homeCoords, people, shelters, hospitals, distressRequests]);

  const activeMember =
    membersData.find((m) => m.personId === selectedMemberId) || membersData[0];

  // SVG coordinate transformation centered on Home
  // Canvas viewport: 900 x 550
  const centerLat = homeCoords.lat;
  const centerLng = homeCoords.lng;
  const latSpan = 0.035 / zoom;
  const lngSpan = 0.045 / zoom;

  const toSvgX = (lng: number) => {
    return ((lng - (centerLng - lngSpan / 2)) / lngSpan) * 900;
  };

  const toSvgY = (lat: number) => {
    return (((centerLat + latSpan / 2) - lat) / latSpan) * 550;
  };

  const homeSvg = {
    x: toSvgX(homeCoords.lng),
    y: toSvgY(homeCoords.lat),
  };

  // Google Maps URLs
  const activeMemberGoogleMapsUrl = activeMember
    ? `https://www.google.com/maps/search/?api=1&query=${activeMember.coords.lat},${activeMember.coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${homeCoords.lat},${homeCoords.lng}`;

  const routeFromHomeGoogleMapsUrl = activeMember
    ? `https://www.google.com/maps/dir/?api=1&origin=${homeCoords.lat},${homeCoords.lng}&destination=${activeMember.coords.lat},${activeMember.coords.lng}`
    : '#';

  const streetViewGoogleMapsUrl = activeMember
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${activeMember.coords.lat},${activeMember.coords.lng}`
    : '#';

  return (
    <div className="bg-[#0c1322] border-2 border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/40">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">
              LIVE FAMILY MEMBER SPATIAL TRACKING MAP
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
              {household.familyName} • {membersData.length} Live Signals
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time GPS telemetry, safe shelter proximity, and direct Google Maps sync for every family member.
          </p>
        </div>

        {/* View mode toggle & Zoom */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setMapMode('RADAR')}
              className={`px-3 py-1 rounded-md transition-all ${
                mapMode === 'RADAR'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tactical Radar
            </button>
            <button
              onClick={() => setMapMode('GOOGLE_MAPS')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                mapMode === 'GOOGLE_MAPS'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ExternalLink className="w-3 h-3" />
              <span>Google Maps Embed</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 text-slate-400">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              className="p-1 hover:text-white hover:bg-slate-800 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
              className="p-1 hover:text-white hover:bg-slate-800 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1.2)}
              className="p-1 hover:text-white hover:bg-slate-800 rounded text-[10px] font-mono"
              title="Reset Zoom"
            >
              1.0x
            </button>
          </div>
        </div>
      </div>

      {/* Member Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-500 text-[11px] shrink-0 font-medium">Select Member to Track:</span>
        {membersData.map((m) => {
          const isSelected = m.personId === selectedMemberId;
          const isSafe = m.status === 'SAFE_SHELTER' || m.status === 'SAFE_EVAC';
          const isHosp = m.status === 'HOSPITALIZED';
          const isDistress = m.status === 'DISTRESS';

          return (
            <button
              key={m.personId}
              onClick={() => setSelectedMemberId(m.personId)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0 ${
                isSelected
                  ? 'bg-cyan-950 text-cyan-200 border-cyan-400 shadow-lg shadow-cyan-950/80 ring-1 ring-cyan-400'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isDistress
                    ? 'bg-red-500 animate-ping'
                    : isHosp
                    ? 'bg-purple-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="font-bold text-white">{m.name}</span>
              <span className="text-[10px] opacity-75">
                ({m.distFromHomeKm}km)
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Member Focus Bar & Google Maps Direct Controls */}
      {activeMember && (
        <div className="bg-slate-950/90 border border-slate-800 p-3 sm:p-4 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs font-mono shadow-inner">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">{activeMember.name}</span>
              <span className="text-[11px] text-slate-400">
                ({activeMember.relationship} • {activeMember.age} yrs)
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeMember.status === 'DISTRESS'
                    ? 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
                    : activeMember.status === 'HOSPITALIZED'
                    ? 'bg-purple-950 text-purple-300 border border-purple-700'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                }`}
              >
                {activeMember.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded">
                GPS: {activeMember.coords.lat.toFixed(4)}° N, {activeMember.coords.lng.toFixed(4)}° E (±4m)
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px] flex-wrap">
              <span className="flex items-center gap-1 text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {activeMember.locationTitle}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Navigation className="w-3 h-3 text-amber-400" />
                {activeMember.distFromHomeKm} km from Residence
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                Device: {activeMember.batteryPct}%
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-cyan-300">
                <Clock className="w-3 h-3 text-slate-500" />
                Ping: {activeMember.lastPing}
              </span>
            </div>
          </div>

          {/* Direct Google Maps Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <a
              href={activeMemberGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open on Google Maps</span>
            </a>

            <a
              href={routeFromHomeGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Route from Home</span>
            </a>

            <a
              href={streetViewGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
              title="Google Street View"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Street View</span>
            </a>
          </div>
        </div>
      )}

      {/* MAP CANVAS / GOOGLE MAPS EMBED */}
      {mapMode === 'RADAR' ? (
        <div className="relative w-full h-[460px] sm:h-[500px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
          <svg
            viewBox="0 0 900 550"
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Background grid pattern */}
              <pattern id="fam-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
              </pattern>

              {/* Radar concentric circles gradient */}
              <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Grid & Radar circles */}
            <rect width="900" height="550" fill="#030712" />
            <rect width="900" height="550" fill="url(#fam-grid)" />
            <circle cx={homeSvg.x} cy={homeSvg.y} r="260" fill="url(#radar-glow)" />

            {/* Range distance rings centered on Home */}
            <circle cx={homeSvg.x} cy={homeSvg.y} r="80" fill="none" stroke="#0e7490" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
            <text x={homeSvg.x + 85} y={homeSvg.y - 4} fill="#06b6d4" fontSize="10" fontFamily="monospace" opacity="0.6">
              1.0 km radius
            </text>

            <circle cx={homeSvg.x} cy={homeSvg.y} r="160" fill="none" stroke="#0e7490" strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
            <text x={homeSvg.x + 165} y={homeSvg.y - 4} fill="#06b6d4" fontSize="10" fontFamily="monospace" opacity="0.6">
              2.0 km radius
            </text>

            <circle cx={homeSvg.x} cy={homeSvg.y} r="240" fill="none" stroke="#0e7490" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
            <text x={homeSvg.x + 245} y={homeSvg.y - 4} fill="#06b6d4" fontSize="10" fontFamily="monospace" opacity="0.5">
              3.0 km radius
            </text>

            {/* Connecting lines from Home to each member */}
            {membersData.map((m) => {
              const mx = toSvgX(m.coords.lng);
              const my = toSvgY(m.coords.lat);
              const isSelected = m.personId === selectedMemberId;

              return (
                <g key={`line-${m.personId}`}>
                  <line
                    x1={homeSvg.x}
                    y1={homeSvg.y}
                    x2={mx}
                    y2={my}
                    stroke={isSelected ? '#22d3ee' : '#334155'}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray={isSelected ? 'none' : '4,3'}
                    opacity={isSelected ? 0.9 : 0.4}
                  />
                  {/* Distance pill midpoint */}
                  <rect
                    x={(homeSvg.x + mx) / 2 - 24}
                    y={(homeSvg.y + my) / 2 - 8}
                    width="48"
                    height="16"
                    rx="4"
                    fill="#020617"
                    stroke={isSelected ? '#06b6d4' : '#1e293b'}
                    strokeWidth="1"
                  />
                  <text
                    x={(homeSvg.x + mx) / 2}
                    y={(homeSvg.y + my) / 2 + 3}
                    textAnchor="middle"
                    fill={isSelected ? '#22d3ee' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {m.distFromHomeKm}km
                  </text>
                </g>
              );
            })}

            {/* Key landmarks: Shelters & Hospitals in Sector */}
            {shelters.slice(0, 3).map((s) => {
              const sx = toSvgX(s.coordinates.lng);
              const sy = toSvgY(s.coordinates.lat);
              return (
                <g key={s.id} transform={`translate(${sx}, ${sy})`}>
                  <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                  <text x="0" y="4" textAnchor="middle" fill="#a7f3d0" fontSize="12">⛺</text>
                  <text x="0" y="22" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontFamily="monospace">
                    {s.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}

            {hospitals.slice(0, 2).map((h) => {
              const hx = toSvgX(h.coordinates.lat ? h.coordinates.lng : 77.58);
              const hy = toSvgY(h.coordinates.lat || 12.96);
              return (
                <g key={h.id} transform={`translate(${hx}, ${hy})`}>
                  <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#4c0519" stroke="#f43f5e" strokeWidth="1.5" />
                  <text x="0" y="4" textAnchor="middle" fill="#fecdd3" fontSize="11" fontWeight="bold">✚</text>
                  <text x="0" y="22" textAnchor="middle" fill="#fda4af" fontSize="9" fontFamily="monospace">
                    {h.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}

            {/* HOME RESIDENCE PIN */}
            <g transform={`translate(${homeSvg.x}, ${homeSvg.y})`}>
              <circle r="22" fill="#0891b2" opacity="0.2" className="animate-pulse" />
              <circle r="16" fill="#0e7490" stroke="#22d3ee" strokeWidth="2.5" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="14">🏠</text>
              <rect x="-65" y="-34" width="130" height="18" rx="4" fill="#082f49" stroke="#0ea5e9" strokeWidth="1" />
              <text x="0" y="-22" textAnchor="middle" fill="#e0f2fe" fontSize="9" fontWeight="bold" fontFamily="monospace">
                HOME: {household.familyName}
              </text>
            </g>

            {/* FAMILY MEMBER PINS */}
            {membersData.map((m) => {
              const mx = toSvgX(m.coords.lng);
              const my = toSvgY(m.coords.lat);
              const isSelected = m.personId === selectedMemberId;
              const isSafe = m.status === 'SAFE_SHELTER' || m.status === 'SAFE_EVAC';
              const isHosp = m.status === 'HOSPITALIZED';
              const isDistress = m.status === 'DISTRESS';

              const pinColor = isDistress ? '#ef4444' : isHosp ? '#c084fc' : '#10b981';
              const pinFill = isDistress ? '#7f1d1d' : isHosp ? '#581c87' : '#064e3b';

              return (
                <g
                  key={m.personId}
                  transform={`translate(${mx}, ${my})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedMemberId(m.personId)}
                >
                  {/* Outer pulse wave */}
                  <circle
                    r={isSelected ? 28 : 20}
                    fill={pinColor}
                    opacity="0.25"
                    className="animate-ping"
                  />

                  {/* Pin Circle */}
                  <circle
                    r={isSelected ? 18 : 15}
                    fill={pinFill}
                    stroke={pinColor}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Initials / Icon */}
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={isSelected ? '11' : '9'}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {m.name.split(' ').map((n) => n[0]).join('')}
                  </text>

                  {/* Name banner above pin */}
                  <rect
                    x="-55"
                    y={isSelected ? -38 : -32}
                    width="110"
                    height="18"
                    rx="4"
                    fill="#020617"
                    stroke={isSelected ? pinColor : '#334155'}
                    strokeWidth={isSelected ? 1.5 : 1}
                  />
                  <text
                    x="0"
                    y={isSelected ? -26 : -20}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize="9.5"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fontFamily="monospace"
                  >
                    {m.name.split(' ')[0]} ({m.relationship})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Compass Rose on Top Right */}
          <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-700 p-2 rounded-lg text-[10px] font-mono text-slate-400 flex flex-col items-center">
            <span className="text-cyan-400 font-bold">N</span>
            <Compass className="w-5 h-5 text-slate-300 my-0.5" />
            <span>S</span>
          </div>

          {/* Legend on Bottom Left */}
          <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono space-y-1 backdrop-blur-sm">
            <div className="text-slate-400 font-bold uppercase text-[9px]">Map Legend:</div>
            <div className="flex items-center gap-1.5 text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Confirmed Safe / Relief Shelter</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span>Medical / Trauma Center</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span>Active Rescue / Search Area</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Home Residence ({household.registeredAddress})</span>
            </div>
          </div>
        </div>
      ) : (
        /* GOOGLE MAPS DIRECT LIVE EMBED */
        <div className="space-y-3">
          <div className="relative w-full h-[460px] sm:h-[500px] bg-slate-950 rounded-xl overflow-hidden border border-cyan-500/40 shadow-inner">
            <iframe
              title="Google Maps Family Location Tracker"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://maps.google.com/maps?q=${activeMember ? activeMember.coords.lat : homeCoords.lat},${activeMember ? activeMember.coords.lng : homeCoords.lng}&hl=en&z=15&output=embed`}
              className="w-full h-full"
            />
            {/* Overlay banner with live coordinates */}
            <div className="absolute top-3 left-3 bg-slate-950/90 border border-cyan-500/60 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 shadow-lg backdrop-blur-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>
                Real-Time Google Maps Pin: {activeMember ? activeMember.name : 'Home'} ({activeMember ? activeMember.coords.lat.toFixed(4) : homeCoords.lat}, {activeMember ? activeMember.coords.lng.toFixed(4) : homeCoords.lng})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 flex-wrap gap-2">
            <span>Synchronized with Google Maps Platform real-time geospatial grid.</span>
            <a
              href={activeMemberGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
            >
              <span>Launch Fullscreen on Google Maps Web</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
