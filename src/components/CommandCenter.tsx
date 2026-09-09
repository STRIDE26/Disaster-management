import React from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Users,
  UserCheck,
  UserX,
  AlertOctagon,
  LifeBuoy,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Ambulance,
  TrendingUp,
  MapPin,
  HelpCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Compass,
  Radio,
} from 'lucide-react';
import { LiveMap } from './LiveMap';

export const CommandCenter: React.FC = () => {
  const {
    eventInfo,
    distressRequests,
    buildings,
    rescueTeams,
    timeline,
    setActiveTab,
    assignTeamToRequest,
    markRequestRescued,
    markRequestNotFound,
    setSelectedRequest,
    setSelectedBuilding,
  } = useDisaster();

  // Top critical requests sorted by score descending
  const sortedRequests = [...distressRequests]
    .filter((r) => r.status !== 'RESCUED')
    .sort((a, b) => b.calculatedScore - a.calculatedScore);

  const criticalQueue = sortedRequests.slice(0, 4);

  // Accountability formula calculation for affected area:
  // Unaccounted = Expected - Confirmed Safe - Known Absent - Distress
  const totalExpected = eventInfo?.expectedInAffectedArea || 1;
  const safePercent = Math.round(((eventInfo?.confirmedSafe || 0) / totalExpected) * 100);
  const unaccountedPercent = Math.round(((eventInfo?.unaccounted || 0) / totalExpected) * 100);
  const distressPercent = Math.round(((eventInfo?.inDistress || 0) / totalExpected) * 100);
  const absentPercent = Math.round(((eventInfo?.knownElsewhere || 0) / totalExpected) * 100);

  return (
    <div className="space-y-4 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto">
      {/* 1. Large Top Emergency Status Banner */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border border-red-500/40 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500/60 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-950">
            <ShieldAlert className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-red-500 text-white tracking-wider animate-pulse">
                🔴 DURING MODE ACTIVE
              </span>
              <span className="text-xs text-red-300 font-mono">SEVERITY LEVEL 4 (MASS CASUALTY PROTOCOL)</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white mt-1">
              {eventInfo.name} — BENGALURU METRO
            </h2>
            <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5 flex-wrap">
              <span>Magnitude: <strong className="text-slate-200">{eventInfo.magnitude}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Started: <strong className="text-slate-200">{eventInfo.detectedAt}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Telemetry Sync: <strong className="text-cyan-300">{eventInfo.lastUpdated}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">{eventInfo.epicenter}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('map')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>FULL GIS MAP VIEW</span>
          </button>
          <button
            onClick={() => setActiveTab('priority')}
            className="px-3.5 py-2 bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/50 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-red-400" />
            <span>RESCUE QUEUE</span>
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Registered */}
        <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">TOTAL REGISTERED</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5 font-mono">
            {(eventInfo?.totalRegistered ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Pre-disaster baseline registry</span>
          </div>
        </div>

        {/* Expected in Affected Area */}
        <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">EXPECTED IN AREA</span>
            <MapPin className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-1.5 font-mono">
            {(eventInfo?.expectedInAffectedArea ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
            <span>Inside shake radius</span>
          </div>
        </div>

        {/* Confirmed Safe */}
        <div className="bg-[#0e1626] border border-emerald-900/40 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono text-emerald-400">CONFIRMED SAFE</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5 font-mono">
            {(eventInfo?.confirmedSafe ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
            <span>{safePercent}% accounted & verified</span>
          </div>
        </div>

        {/* Unaccounted */}
        <div className="bg-[#0e1626] border border-amber-900/40 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono text-amber-400">UNACCOUNTED</span>
            <UserX className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1.5 font-mono">
            {(eventInfo?.unaccounted ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
            <span>Pending check-in response</span>
          </div>
        </div>

        {/* In Distress */}
        <div className="bg-[#0e1626] border border-red-900/50 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono text-red-400">IN DISTRESS (SOS)</span>
            <AlertOctagon className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-400 mt-1.5 font-mono">
            {(eventInfo?.inDistress ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-red-400/80 mt-1 flex items-center gap-1">
            <span>Active emergency calls</span>
          </div>
        </div>

        {/* Total Rescued */}
        <div className="bg-[#0e1626] border border-cyan-900/40 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono text-cyan-400">SAFELY RESCUED</span>
            <LifeBuoy className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 mt-1.5 font-mono">
            {eventInfo.totalRescuedToday}
          </div>
          <div className="text-[11px] text-cyan-400/80 mt-1 flex items-center gap-1">
            <span>Extracted today</span>
          </div>
        </div>
      </div>

      {/* 3. Second Row: Mini Live Map + Critical Requests Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Tactical Live Map Overview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <h3 className="font-bold text-white text-sm font-mono tracking-wide">
                TACTICAL SITUATION MAP (LIVE CBD CORRIDOR)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              <span>Expand & Layer Controls</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-800">
            <LiveMap isMini={true} />
          </div>
        </div>

        {/* Right: Critical Distress Requests Queue (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <h3 className="font-bold text-white text-sm font-mono tracking-wide">
                CRITICAL DISTRESS QUEUE ({sortedRequests.length} ACTIVE)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('distress')}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-mono"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {criticalQueue.map((req, idx) => {
              const isAssigned = !!req.assignedTeamId;
              return (
                <div
                  key={req.id}
                  className="bg-[#0d1424] border border-slate-800 hover:border-slate-700 rounded-xl p-3 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          #{idx + 1} • REQ #{req.id}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{req.reporterName}</span>
                        <span className="text-[11px] text-slate-400">({req.peopleCount} occupants)</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate">{req.locationName}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                        SCORE {req.calculatedScore}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Waiting {req.waitingMinutes}m
                      </div>
                    </div>
                  </div>

                  {/* Situation badges */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {req.situations.waterRising && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        Water Rising (+30)
                      </span>
                    )}
                    {req.situations.fire && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        Fire (+30)
                      </span>
                    )}
                    {req.situations.trapped && (
                      <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                        Trapped (+20)
                      </span>
                    )}
                    {req.situations.heavilyInjuredCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        Injured ({req.situations.heavilyInjuredCount})
                      </span>
                    )}
                    {req.situations.childrenCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        Child ({req.situations.childrenCount})
                      </span>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      {isAssigned ? (
                        <span className="text-cyan-400 flex items-center gap-1">
                          <Ambulance className="w-3.5 h-3.5" />
                          <span>Assigned to {req.assignedTeamId} (ETA {req.etaMinutes}m)</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting Squad Assignment</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => markRequestRescued(req.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[11px] transition-colors"
                      >
                        Safely Rescued
                      </button>
                      <button
                        onClick={() => markRequestNotFound(req.id)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium text-[11px] transition-colors"
                      >
                        Not Found
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Third Row: Accountability Breakdown & Rescue Order */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Section 7 Accountability Overview (6 cols) */}
        <div className="lg:col-span-6 bg-[#0c1322] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm font-mono">
                ACCOUNTABILITY DISAGGREGATION (FORMULA MODEL)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Expected: {(totalExpected ?? 0).toLocaleString()}
            </span>
          </div>

          {/* Important UI Principle Notice */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-2.5 text-[11px] text-slate-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Critical Operational Principle:</strong> Expected location does NOT mean confirmed presence. The system strictly separates Expected, Confirmed Safe, Known Absent, In Distress, and Unaccounted.
            </div>
          </div>

          {/* Stacked Horizontal Bar Visualization */}
          <div className="space-y-1.5 pt-1">
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${safePercent}%` }}
                className="bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer"
                title={`Confirmed Safe: ${eventInfo?.confirmedSafe || 0} (${safePercent}%)`}
              />
              <div
                style={{ width: `${absentPercent}%` }}
                className="bg-blue-500 hover:bg-blue-400 transition-all cursor-pointer"
                title={`Known Absent: ${eventInfo?.knownElsewhere || 0} (${absentPercent}%)`}
              />
              <div
                style={{ width: `${distressPercent}%` }}
                className="bg-red-500 hover:bg-red-400 transition-all cursor-pointer"
                title={`In Distress: ${eventInfo?.inDistress || 0} (${distressPercent}%)`}
              />
              <div
                style={{ width: `${unaccountedPercent}%` }}
                className="bg-amber-500 hover:bg-amber-400 transition-all cursor-pointer"
                title={`Unaccounted: ${eventInfo?.unaccounted || 0} (${unaccountedPercent}%)`}
              />
            </div>

            {/* Legend & Breakdown stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
              <div className="p-2 rounded bg-slate-900 border border-emerald-950">
                <div className="text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  CONFIRMED SAFE
                </div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {(eventInfo?.confirmedSafe ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400">{safePercent}% of expected</div>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-blue-950">
                <div className="text-blue-400 text-[10px] font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  KNOWN ABSENT
                </div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {eventInfo?.knownElsewhere ?? 0}
                </div>
                <div className="text-[10px] text-slate-400">Safe outside zone</div>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-red-950">
                <div className="text-red-400 text-[10px] font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  IN DISTRESS
                </div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {eventInfo?.inDistress ?? 0}
                </div>
                <div className="text-[10px] text-slate-400">SOS transmitted</div>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-amber-950">
                <div className="text-amber-400 text-[10px] font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  UNACCOUNTED
                </div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {(eventInfo?.unaccounted ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400">Formula remainder</div>
              </div>
            </div>
          </div>

          {/* Formula Callout */}
          <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <span className="text-amber-400 font-mono font-semibold">FORMULA: </span>
              <span className="font-mono text-[11px] text-slate-300">
                Unaccounted ({eventInfo.unaccounted}) = Expected ({totalExpected}) − Safe ({eventInfo.confirmedSafe}) − Absent ({eventInfo.knownElsewhere}) − Distress ({eventInfo.inDistress})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Section 23 Rescue Order List (6 cols) */}
        <div className="lg:col-span-6 bg-[#0c1322] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <h3 className="font-bold text-white text-sm font-mono">
                RESCUE ORDER (PRIORITY-RANKED TASKS)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('priority')}
              className="text-xs text-cyan-400 hover:underline font-mono"
            >
              Priority Engine &rarr;
            </button>
          </div>

          <div className="text-[11px] text-slate-400 leading-tight">
            Ranked by multi-factor hazard scoring. Lower-priority requests remain continuously monitored and score automatically increases with waiting time.
          </div>

          {/* Ranked table preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] font-mono text-slate-400 bg-slate-900/60 border-b border-slate-800 uppercase">
                <tr>
                  <th className="py-2 px-2">Rank</th>
                  <th className="py-2 px-2">Req ID</th>
                  <th className="py-2 px-2">Location</th>
                  <th className="py-2 px-1">People</th>
                  <th className="py-2 px-2">Score</th>
                  <th className="py-2 px-2">Assigned Team</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {sortedRequests.slice(0, 5).map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-2 font-bold text-white">#{i + 1}</td>
                    <td className="py-2 px-2 text-cyan-400 font-semibold">#{r.id}</td>
                    <td className="py-2 px-2 text-slate-300 truncate max-w-[120px] font-sans">
                      {r.locationName.split(',')[0]}
                    </td>
                    <td className="py-2 px-1 text-slate-300">{r.peopleCount}</td>
                    <td className="py-2 px-2 text-red-400 font-bold">{r.calculatedScore}</td>
                    <td className="py-2 px-2 text-slate-300">
                      {r.assignedTeamId ? (
                        <span className="text-cyan-300">{r.assignedTeamId} ({r.etaMinutes}m)</span>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          r.status === 'CRITICAL'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : r.status === 'TEAM_ASSIGNED'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: Section 29 Live Incident Timeline */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="font-bold text-white text-sm font-mono">
              REAL-TIME INCIDENT TIMELINE (BENGALURU EOC LOG)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Chronological event stream</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {timeline.slice(0, 8).map((ev) => (
            <div
              key={ev.id}
              className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-2.5 text-xs space-y-1 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-mono text-[11px] font-bold">{ev.time} IST</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                    ev.category === 'DETECTION'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : ev.category === 'RESCUE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : ev.category === 'DISTRESS'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {ev.category}
                </span>
              </div>
              <div className="font-semibold text-slate-200 line-clamp-1">{ev.title}</div>
              <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{ev.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
