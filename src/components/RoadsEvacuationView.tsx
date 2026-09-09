import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Route,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Navigation,
  ShieldAlert,
  ArrowRight,
  Clock,
  Compass,
  Footprints,
} from 'lucide-react';
import { RoadStatus } from '../types';

export const RoadsEvacuationView: React.FC = () => {
  const { roads, blockedRoads: contextBlockedRoads, buildings, shelters, toggleRoadStatus } = useDisaster();

  const roadList = roads || contextBlockedRoads || [];
  const [fromBuildingId, setFromBuildingId] = useState<string>('BLD-01');
  const [toShelterId, setToShelterId] = useState<string>('SH-12');
  const [routeCalculated, setRouteCalculated] = useState<boolean>(true);

  const selectedBuilding = (buildings || []).find((b) => b.id === fromBuildingId) || (buildings || [])[0];
  const selectedShelter = (shelters || []).find((s) => s.id === toShelterId) || (shelters || [])[0];

  // Blocked roads count
  const blockedRoads = roadList.filter((r) => r.status === 'BLOCKED');

  return (
    <div className="space-y-6 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono">
              ROAD ACCESSIBILITY & SAFE EVACUATION CORRIDORS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic routing engine bypassing collapsed flyovers, live power lines, and flood zones.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-red-950/80 text-red-300 border border-red-800">
            ⛔ {blockedRoads.length} Critical Blockages
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            🟢 {roads.length - blockedRoads.length} Passable Roads
          </span>
        </div>
      </div>

      {/* Section 21: Interactive Evacuation Route Calculator */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Navigation className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base font-mono">
            SAFE EVACUATION PATHWAY GENERATOR
          </h3>
        </div>

        {/* Origin and Destination Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>Evacuation Origin (Building / Sector):</span>
            </label>
            <select
              value={fromBuildingId}
              onChange={(e) => setFromBuildingId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2.5 text-slate-200 focus:outline-none font-mono"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.damageLevel} Damage)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 text-center text-slate-500 font-mono text-xs flex justify-center items-center">
            <ArrowRight className="w-5 h-5 text-cyan-400 hidden sm:block" />
            <span className="sm:hidden">&darr;</span>
          </div>

          <div className="sm:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Evacuation Shelter:</span>
            </label>
            <select
              value={toShelterId}
              onChange={(e) => setToShelterId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2.5 text-slate-200 focus:outline-none font-mono"
            >
              {shelters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.availableBeds} beds available)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generated Safe Route Details */}
        {routeCalculated && (
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  SAFE CORRIDOR VERIFIED (HAZARDS BYPASSED)
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Est. Distance: <strong>2.8 km</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5 text-amber-400" />
                  <span>Walking Time: <strong>34 min</strong></span>
                </span>
              </div>
            </div>

            {/* Step-by-Step Directions avoiding hazards */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <span className="text-[11px] font-bold text-slate-400 font-mono uppercase">
                STEP-BY-STEP EVACUATION PROTOCOL:
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    1
                  </span>
                  <div>
                    <div className="text-white font-semibold">
                      Exit {selectedBuilding.name} via Southern Emergency Assembly Gate.
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Avoid main facade due to glass shatter hazard and fallen signboards.
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/40 flex items-start gap-2.5 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-red-950 border border-red-800 text-red-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <div>
                    <div className="text-red-300 font-semibold">
                      BYPASS MG Road Flyover Corridor (Road Blocked: Structural Debris).
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Divert left through Residency Road open alleyway towards Richmond Circle.
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    3
                  </span>
                  <div>
                    <div className="text-white font-semibold">
                      Proceed West on Richmond Road past St. Joseph's grounds.
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Wide clear road verified by Field Recon Squad RT-07. Free of electrical lines.
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/50 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    4
                  </span>
                  <div>
                    <div className="text-emerald-300 font-semibold">
                      Enter {selectedShelter.name} through West Reception Gate.
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Shelter intake checkpoint active. Medical triaging and clean water distribution available.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 19: Blocked Roads & Hazard Zones Management */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm font-mono tracking-wide">
              ROAD NETWORK STATUS & FIELD HAZARD MAPPING
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Operators can toggle status upon road clearance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roadList.map((road) => {
            const isBlocked = road.status === 'BLOCKED';
            const roadTitle = road.roadName || road.name || road.id;
            return (
              <div
                key={road.id}
                className={`bg-[#0c1322] border rounded-xl p-4 space-y-2.5 transition-colors ${
                  isBlocked ? 'border-red-900/60 bg-red-950/10' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {road.id}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-0.5">{roadTitle}</h4>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      isBlocked
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : road.status === 'CONGESTED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {road.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  <span className="text-slate-500 font-mono">Reason: </span>
                  <span>{road.reason || 'Normal conditions'}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">Updated: {road.reportedAt} IST</span>
                  <button
                    onClick={() => toggleRoadStatus(road.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                      isBlocked
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-red-900/80 hover:bg-red-800 text-red-200'
                    }`}
                  >
                    {isBlocked ? 'Mark Clear' : 'Mark Blocked'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
