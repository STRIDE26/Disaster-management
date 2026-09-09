import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Building2,
  AlertTriangle,
  Users,
  MapPin,
  Ambulance,
  TrendingUp,
  Shield,
  Search,
  CheckCircle,
  X,
  ExternalLink,
  Navigation,
  Eye,
  Layers,
} from 'lucide-react';
import { HazardLevel, Building } from '../types';
import { matchesIdOrText } from '../utils/searchUtils';

export const BuildingsView: React.FC = () => {
  const { buildings, updateBuildingDamage, setActiveTab, setSelectedBuilding, globalSearchQuery } = useDisaster();

  const [search, setSearch] = useState<string>('');
  const [previewBuilding, setPreviewBuilding] = useState<Building | null>(null);
  const activeQuery = search.trim() || globalSearchQuery.trim();

  const filteredBuildings = buildings.filter((bld) => {
    if (activeQuery) {
      return (
        matchesIdOrText(bld.id, activeQuery) ||
        matchesIdOrText(bld.name, activeQuery) ||
        matchesIdOrText(bld.areaZone, activeQuery) ||
        matchesIdOrText(bld.damageLevel, activeQuery)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono">
              BUILDINGS & GEOGRAPHIC SECTOR INTELLIGENCE
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Structural hazard index, occupant density, Google Maps platform spatial tracking, and priority scoring.
          </p>
        </div>

        {/* Search & Priority Formula */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search building #ID (e.g. BLD-A, 01)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs rounded-lg pl-8 pr-7 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 w-64"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs font-mono text-slate-300">
            <span className="text-red-400 font-bold">COMPOSITE FORMULA: </span>
            <span>(0.50 × Distress) + (0.30 × Unaccounted) + (0.20 × Hazard)</span>
          </div>
        </div>
      </div>

      {/* Embedded Real-Time Google Maps Viewer for Selected Building/Area */}
      {previewBuilding && (
        <div className="bg-[#0c1322] border-2 border-cyan-500/50 rounded-2xl p-4 space-y-3 shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm font-mono">
                REAL-TIME GOOGLE MAPS: {previewBuilding.name} ({previewBuilding.id})
              </h3>
              <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                {previewBuilding.coordinates.lat.toFixed(4)}° N, {previewBuilding.coordinates.lng.toFixed(4)}° E
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${previewBuilding.coordinates.lat},${previewBuilding.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-2.5 py-1 rounded text-xs font-mono transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open in Google Maps App</span>
              </a>
              <button
                onClick={() => setPreviewBuilding(null)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embedded Google Maps Frame */}
          <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
            <iframe
              title={`Google Map - ${previewBuilding.name}`}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://maps.google.com/maps?q=${previewBuilding.coordinates.lat},${previewBuilding.coordinates.lng}&hl=en&z=17&output=embed`}
              className="w-full h-full"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Area: {previewBuilding.areaZone} • Structural Damage: {previewBuilding.damageLevel}</span>
            <div className="flex gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${previewBuilding.coordinates.lat},${previewBuilding.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                <span>Get Driving Directions</span>
              </a>
              <span>•</span>
              <a
                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${previewBuilding.coordinates.lat},${previewBuilding.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>Street View</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Buildings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuildings.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
            No buildings matching search query &ldquo;{activeQuery}&rdquo;.
          </div>
        ) : (
          filteredBuildings.map((bld) => {
            const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${bld.coordinates.lat},${bld.coordinates.lng}`;
            const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${bld.coordinates.lat},${bld.coordinates.lng}`;

            return (
              <div
                key={bld.id}
                className="bg-[#0c1322] border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3.5 transition-colors shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {bld.id}
                        </span>
                        <h3 className="font-bold text-white text-sm">{bld.name}</h3>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{bld.areaZone}</span>
                      </div>
                      <div className="text-[11px] font-mono text-cyan-400/90 mt-0.5">
                        GPS: {bld.coordinates.lat.toFixed(4)}° N, {bld.coordinates.lng.toFixed(4)}° E
                      </div>
                    </div>

                    {/* Final Priority Pill */}
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                        SCORE {bld.finalPriorityScore}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">EXPECTED</span>
                      <strong className="text-white text-sm">{bld.expectedCount}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">SAFE</span>
                      <strong className="text-emerald-400 text-sm">{bld.confirmedSafeCount}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">UNACCOUNTED</span>
                      <strong className="text-amber-400 text-sm">{bld.unaccountedCount}</strong>
                    </div>
                  </div>

                  {/* Score Calculation Breakdown */}
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-slate-400 font-bold text-[10px] uppercase">
                      SCORING CONTRIBUTION:
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Distress Score (50%):</span>
                      <span className="text-red-400">
                        {bld.distressScore} &rarr; {(0.5 * bld.distressScore).toFixed(0)} pts
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Unaccounted Score (30%):</span>
                      <span className="text-amber-400">
                        {bld.unaccountedScore} &rarr; {(0.3 * bld.unaccountedScore).toFixed(0)} pts
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Hazard Zone Score (20%):</span>
                      <span className="text-blue-400">
                        {bld.hazardScore} &rarr; {(0.2 * bld.hazardScore).toFixed(0)} pts
                      </span>
                    </div>
                  </div>

                  {/* Damage & Hazard Selector */}
                  <div className="pt-1 border-t border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-mono text-[11px]">Structural Damage:</span>
                      <select
                        value={bld.damageLevel}
                        onChange={(e) =>
                          updateBuildingDamage(bld.id, e.target.value as HazardLevel, bld.hazardZone)
                        }
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none"
                      >
                        <option value="SEVERE">🔴 SEVERE</option>
                        <option value="HIGH">🟠 HIGH</option>
                        <option value="MODERATE">🟡 MODERATE</option>
                        <option value="LOW">🟢 LOW</option>
                        <option value="UNASSESSED">⚪ UNASSESSED</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Nearby Squads:</span>
                      <span className="text-cyan-400">
                        {bld.nearbyTeamIds.length > 0 ? bld.nearbyTeamIds.join(', ') : 'None nearby'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Google Maps Real-Time Actions & Tactical Map Link */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      onClick={() => setPreviewBuilding(bld)}
                      className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Live Google Map</span>
                    </button>

                    <a
                      href={googleMapsSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      <span>Open on Maps</span>
                    </a>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('map')}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-mono font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>View on Tactical Map</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
