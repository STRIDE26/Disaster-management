import React, { useState, useEffect } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  AlertOctagon,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Ambulance,
  Battery,
  Wifi,
  Users,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { DistressRequest } from '../types';
import { matchesIdOrText } from '../utils/searchUtils';

export const DistressRequestsView: React.FC = () => {
  const {
    distressRequests,
    rescueTeams,
    assignTeamToRequest,
    markRequestRescued,
    markRequestNotFound,
    selectedRequest,
    setSelectedRequest,
    globalSearchQuery,
  } = useDisaster();

  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>('R182');
  const [selectedTeamToAssign, setSelectedTeamToAssign] = useState<Record<string, string>>({});

  // Auto-expand and reveal if selectedRequest was set by global search
  useEffect(() => {
    if (selectedRequest) {
      setExpandedRequestId(selectedRequest.id);
      if (selectedRequest.status === 'RESCUED' && statusFilter === 'ACTIVE') {
        setStatusFilter('ALL');
      }
    }
  }, [selectedRequest]);

  const activeQuery = searchQuery.trim() || globalSearchQuery.trim();

  const filteredRequests = distressRequests.filter((req) => {
    // If user is searching a specific ID or term, don't hide matches by default status filter unless explicitly on RESCUED/CRITICAL
    if (activeQuery) {
      const matches =
        matchesIdOrText(req.id, activeQuery) ||
        matchesIdOrText(req.personId, activeQuery) ||
        matchesIdOrText(req.householdId, activeQuery) ||
        matchesIdOrText(req.reporterName, activeQuery) ||
        matchesIdOrText(req.locationName, activeQuery) ||
        matchesIdOrText(req.buildingId, activeQuery) ||
        matchesIdOrText(req.assignedTeamId, activeQuery);

      if (!matches) return false;
      if (statusFilter === 'CRITICAL' && req.status !== 'CRITICAL') return false;
      if (statusFilter === 'RESCUED' && req.status !== 'RESCUED') return false;
      return true;
    }

    // Status filter for normal browsing
    if (statusFilter === 'ACTIVE' && req.status === 'RESCUED') return false;
    if (statusFilter === 'CRITICAL' && req.status !== 'CRITICAL') return false;
    if (statusFilter === 'RESCUED' && req.status !== 'RESCUED') return false;
    if (statusFilter === 'NOT_FOUND' && req.status !== 'NOT_FOUND') return false;

    return true;
  });

  return (
    <div className="space-y-4 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1322] border border-slate-800 rounded-xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-base font-bold text-white font-mono">
              DISTRESS SOS QUEUE & SITUATIONAL TRIAGE
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time emergency signals received via Citizen Mobile SOS, BT Mesh relay packets, and field telephone dispatch.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-red-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search SOS #ID (e.g. 182, R182, HH-402)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs rounded-lg pl-8 pr-7 py-1.5 text-slate-200 focus:outline-none focus:border-red-500 w-64"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex rounded-lg bg-slate-900 border border-slate-700 p-0.5 text-xs font-mono">
            {['ACTIVE', 'CRITICAL', 'RESCUED', 'NOT_FOUND', 'ALL'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === tab
                    ? 'bg-red-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
            No distress requests matching current criteria.
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isExpanded = expandedRequestId === req.id;
            const b = req.scoreBreakdown;
            const availableTeams = rescueTeams.filter((t) => t.status === 'AVAILABLE');

            return (
              <div
                key={req.id}
                className={`bg-[#0d1424] border rounded-xl overflow-hidden transition-all shadow-lg ${
                  req.status === 'CRITICAL'
                    ? 'border-red-500/40 hover:border-red-500/80'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Main Card Header Bar */}
                <div
                  className="p-4 cursor-pointer flex flex-wrap items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                  onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        req.status === 'CRITICAL'
                          ? 'bg-red-500 animate-pulse'
                          : req.status === 'RESCUED'
                          ? 'bg-emerald-500'
                          : req.status === 'TEAM_ASSIGNED'
                          ? 'bg-cyan-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-white text-sm">
                          REQ #{req.id}
                        </span>
                        <span className="text-sm font-semibold text-slate-200">
                          {req.reporterName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({req.peopleCount} {req.peopleCount === 1 ? 'person' : 'people'})
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-400" />
                        <span className="text-slate-300 font-medium">{req.locationName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score, Waiting Time & Expand Arrow */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-red-950 text-red-400 border border-red-800">
                        PRIORITY SCORE {req.calculatedScore}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        Waiting {req.waitingMinutes} min
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase ${
                        req.status === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : req.status === 'RESCUED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : req.status === 'TEAM_ASSIGNED'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950/70 border-t border-slate-800 space-y-4 text-xs">
                    {/* Transparent Score Calculation Breakdown (Section 15) */}
                    <div className="bg-[#0c1424] border border-red-900/40 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-slate-300 font-mono font-bold">
                        <span className="flex items-center gap-1.5 text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          TRANSPARENT PRIORITY SCORING BREAKDOWN:
                        </span>
                        <span className="text-white text-sm">TOTAL: {req.calculatedScore} POINTS</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[11px] font-mono">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">Water Rising:</span>
                          <strong className="text-blue-400">{b.waterRising ? '+30' : '0'}</strong>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">Active Fire:</span>
                          <strong className="text-amber-400">{b.fire ? '+30' : '0'}</strong>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">Trapped:</span>
                          <strong className="text-red-400">{b.trapped ? '+20' : '0'}</strong>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">Children ({req.situations.childrenCount}):</span>
                          <strong className="text-purple-400">+{b.children}</strong>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">Disabled ({req.situations.disabledCount}):</span>
                          <strong className="text-purple-400">+{b.disabled}</strong>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">Heavily Injured ({req.situations.heavilyInjuredCount}):</span>
                          <strong className="text-rose-400">+{b.injured}</strong>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">Seriously Unwell ({req.situations.seriouslyUnwellCount}):</span>
                          <strong className="text-rose-400">+{b.unwell}</strong>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">Occupants ({req.peopleCount} × 10):</span>
                          <strong className="text-slate-200">+{b.peopleCount}</strong>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">Rescue Required:</span>
                          <strong className="text-emerald-400">+{b.needRescue}</strong>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">Wait Time ({req.waitingMinutes}m):</span>
                          <strong className="text-amber-400">+{b.waitingTime}</strong>
                        </div>
                      </div>

                      {req.situations.otherNotes && (
                        <p className="text-slate-300 text-xs italic bg-slate-900 p-2 rounded border border-slate-800">
                          Occupant Message: "{req.situations.otherNotes}"
                        </p>
                      )}
                    </div>

                    {/* Telemetry & Assignment Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Telemetry metadata */}
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-300">
                        <div className="text-slate-400 font-bold uppercase text-[10px]">DEVICE TELEMETRY:</div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Battery Level:</span>
                          <span className="text-emerald-400 font-bold">{req.deviceInfo.batteryLevel}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Connectivity:</span>
                          <span className="text-cyan-400 font-bold">{req.deviceInfo.connectivity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">GPS Accuracy:</span>
                          <span>±{req.deviceInfo.gpsAccuracyMeters} meters</span>
                        </div>
                        {req.deviceInfo.isRelayed && (
                          <div className="text-amber-300 text-[10px]">
                            Relayed via BT Mesh ({req.deviceInfo.relayHops || 1} hops)
                          </div>
                        )}
                      </div>

                      {/* Team Assignment & Action Controls */}
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="text-slate-400 font-bold uppercase text-[10px] font-mono">
                          RESCUE ACTIONS & DISPATCH:
                        </div>

                        {req.status === 'TEAM_ASSIGNED' ? (
                          <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 font-mono flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Ambulance className="w-4 h-4 text-cyan-400" />
                              Assigned: {req.assignedTeamId} (ETA {req.etaMinutes} mins)
                            </span>
                            <span className="text-[10px] text-slate-400">Assigned at {req.assignedAt}</span>
                          </div>
                        ) : req.status !== 'RESCUED' ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedTeamToAssign[req.id] || ''}
                              onChange={(e) =>
                                setSelectedTeamToAssign((prev) => ({
                                  ...prev,
                                  [req.id]: e.target.value,
                                }))
                              }
                              className="bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200 flex-1 font-mono focus:outline-none"
                            >
                              <option value="">Select Available Rescue Team...</option>
                              {availableTeams.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} ({t.membersCount} members, {t.currentLocation})
                                </option>
                              ))}
                            </select>

                            <button
                              disabled={!selectedTeamToAssign[req.id]}
                              onClick={() => {
                                if (selectedTeamToAssign[req.id]) {
                                  assignTeamToRequest(req.id, selectedTeamToAssign[req.id]);
                                }
                              }}
                              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold rounded-lg font-mono transition-colors shrink-0"
                            >
                              DISPATCH SQUAD
                            </button>
                          </div>
                        ) : null}

                        {/* Status Change Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => markRequestRescued(req.id)}
                            className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            CONFIRM RESCUED
                          </button>
                          <button
                            onClick={() => markRequestNotFound(req.id)}
                            className="py-2 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            MARK NOT FOUND
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Operational History Log */}
                    <div className="pt-2 border-t border-slate-800 font-mono text-[11px] text-slate-400">
                      <div className="font-bold text-slate-500 mb-1">TASK CHRONOLOGY:</div>
                      <div className="space-y-1">
                        {req.history.map((h, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-cyan-400">{h.time} IST</span>
                            <span className="text-slate-600">&rarr;</span>
                            <span className="text-slate-300">{h.event}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
