import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  TrendingUp,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Ambulance,
  AlertTriangle,
  Info,
  Shield,
  HelpCircle,
  MapPin,
  Flame,
  Droplets,
  AlertOctagon,
} from 'lucide-react';
import { DistressRequest } from '../types';

export const RescuePriorityView: React.FC = () => {
  const {
    distressRequests,
    rescueTeams,
    assignTeamToRequest,
    markRequestRescued,
    markRequestNotFound,
    setSelectedRequest,
  } = useDisaster();

  type SortKey = 'score' | 'waiting' | 'people' | 'location' | 'status';
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [inspectBreakdownId, setInspectBreakdownId] = useState<string | null>(null);

  const sortedRequests = [...distressRequests].sort((a, b) => {
    let diff = 0;
    if (sortKey === 'score') diff = b.calculatedScore - a.calculatedScore;
    if (sortKey === 'waiting') diff = b.waitingMinutes - a.waitingMinutes;
    if (sortKey === 'people') diff = b.peopleCount - a.peopleCount;
    if (sortKey === 'location') diff = a.locationName.localeCompare(b.locationName);
    if (sortKey === 'status') diff = a.status.localeCompare(b.status);
    return sortAsc ? -diff : diff;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const inspectedRequest = distressRequests.find((r) => r.id === inspectBreakdownId);

  return (
    <div className="space-y-4 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto">
      {/* Header & Scoring Principle Callout */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold text-white font-mono">
              RESCUE PRIORITY ENGINE (DECISION-SUPPORT SCORING)
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
            {sortedRequests.length} Evaluated Emergency Incidents
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Operational triage ranks distress requests mathematically based on escalating danger factors, physiological vulnerability, occupant counts, and elapsed waiting intervals.
        </p>

        {/* Mandated Safety Principle */}
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-2.5 text-xs text-amber-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Operational Fairness Notice:</strong> Lower-priority requests remain continuously monitored and their priority score automatically increases by <strong>+15 points every 30 minutes</strong> of waiting time. Higher score = higher operational urgency.
          </div>
        </div>
      </div>

      {/* Transparent Scoring Formula Reference Card */}
      <div className="bg-[#0b101c] border border-slate-800/80 rounded-xl p-3.5 text-xs font-mono">
        <div className="text-slate-400 font-bold mb-2 flex items-center gap-1.5">
          <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
          <span>TRANSPARENT SCORING MATRIX WEIGHTS:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-[11px]">
          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400">🌊 Water Rising:</span> <strong className="text-blue-400">+30</strong>
          </div>
          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400">🔥 Fire / Smoke:</span> <strong className="text-amber-400">+30</strong>
          </div>
          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400">🏚️ Trapped:</span> <strong className="text-red-400">+20</strong>
          </div>
          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400">👶 Children:</span> <strong className="text-purple-400">+20 / ea</strong>
          </div>
          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400">♿ Disabled:</span> <strong className="text-purple-400">+20 / ea</strong>
          </div>
          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400">🩹 Heavy Injury:</span> <strong className="text-rose-400">+30 / ea</strong>
          </div>
          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400">👥 Per Occupant:</span> <strong className="text-white">+10</strong>
          </div>
          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400">⏱️ Wait (+30m):</span> <strong className="text-amber-400">+15</strong>
          </div>
        </div>
      </div>

      {/* Sortable Priority Request Table (Section 16) */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-mono text-slate-400 bg-slate-900/90 border-b border-slate-800 uppercase">
              <tr>
                <th className="py-3 px-3">
                  <button
                    onClick={() => toggleSort('score')}
                    className="flex items-center gap-1 text-slate-300 hover:text-white"
                  >
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">Request ID</th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => toggleSort('location')}
                    className="flex items-center gap-1 text-slate-300 hover:text-white"
                  >
                    <span>Location</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => toggleSort('people')}
                    className="flex items-center gap-1 text-slate-300 hover:text-white"
                  >
                    <span>People</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">Situation</th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => toggleSort('score')}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 font-bold"
                  >
                    <span>Score (Priority)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => toggleSort('waiting')}
                    className="flex items-center gap-1 text-slate-300 hover:text-white"
                  >
                    <span>Waiting</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => toggleSort('status')}
                    className="flex items-center gap-1 text-slate-300 hover:text-white"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">Assigned Squad</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {sortedRequests.map((req, idx) => {
                const isAssigned = !!req.assignedTeamId;
                const isCritical = req.calculatedScore >= 120;

                return (
                  <tr
                    key={req.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCritical ? 'bg-red-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-white">#{idx + 1}</td>
                    <td className="py-3 px-3 text-cyan-400 font-bold">
                      <button
                        onClick={() => setInspectBreakdownId(req.id)}
                        className="hover:underline flex items-center gap-1"
                        title="Click to view full scoring calculation"
                      >
                        <span>#{req.id}</span>
                        <Info className="w-3 h-3 opacity-60" />
                      </button>
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-sans truncate max-w-[180px]">
                      {req.locationName}
                    </td>
                    <td className="py-3 px-3 text-white font-bold">{req.peopleCount}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap font-sans">
                        {req.situations.waterRising && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
                            Water
                          </span>
                        )}
                        {req.situations.fire && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                            Fire
                          </span>
                        )}
                        {req.situations.trapped && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-950 text-red-300 border border-red-800">
                            Trapped
                          </span>
                        )}
                        {req.situations.heavilyInjuredCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                            Injury
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-bold text-sm bg-red-500/20 text-red-400 border border-red-500/40">
                        {req.calculatedScore}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{req.waitingMinutes} min</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          req.status === 'CRITICAL'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : req.status === 'TEAM_ASSIGNED'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : req.status === 'RESCUED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {isAssigned ? (
                        <span className="text-cyan-300 font-semibold flex items-center gap-1">
                          <Ambulance className="w-3.5 h-3.5" />
                          {req.assignedTeamId} (ETA {req.etaMinutes}m)
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {req.status !== 'RESCUED' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => markRequestRescued(req.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-sans font-medium transition-colors"
                          >
                            Rescued
                          </button>
                          <button
                            onClick={() => markRequestNotFound(req.id)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-sans font-medium transition-colors"
                          >
                            Not Found
                          </button>
                        </div>
                      ) : (
                        <span className="text-emerald-400 text-xs flex items-center justify-end gap-1 font-sans">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Rescued
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Scoring Breakdown Modal */}
      {inspectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">
                  Scoring Calculation: Request #{inspectedRequest.id}
                </h3>
                <div className="text-xs text-slate-400 font-mono">
                  Reporter: {inspectedRequest.reporterName} • {inspectedRequest.locationName}
                </div>
              </div>
              <button
                onClick={() => setInspectBreakdownId(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span>Water Rising:</span>
                  <strong className="text-blue-400">{inspectedRequest.scoreBreakdown.waterRising}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Fire / Smoke Hazard:</span>
                  <strong className="text-amber-400">{inspectedRequest.scoreBreakdown.fire}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Trapped under Debris:</span>
                  <strong className="text-red-400">{inspectedRequest.scoreBreakdown.trapped}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Children Vulnerability:</span>
                  <strong className="text-purple-400">{inspectedRequest.scoreBreakdown.children}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Disabled Vulnerability:</span>
                  <strong className="text-purple-400">{inspectedRequest.scoreBreakdown.disabled}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Heavily Injured:</span>
                  <strong className="text-rose-400">{inspectedRequest.scoreBreakdown.injured}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Seriously Unwell:</span>
                  <strong className="text-rose-400">{inspectedRequest.scoreBreakdown.unwell}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Occupants Base ({inspectedRequest.peopleCount} × 10):</span>
                  <strong className="text-slate-200">{inspectedRequest.scoreBreakdown.peopleCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Waiting Time Factor ({inspectedRequest.waitingMinutes}m):</span>
                  <strong className="text-amber-400">{inspectedRequest.scoreBreakdown.waitingTime}</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-white">
                  <span>TOTAL PRIORITY SCORE:</span>
                  <span className="text-red-400">{inspectedRequest.calculatedScore}</span>
                </div>
              </div>
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setInspectBreakdownId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
