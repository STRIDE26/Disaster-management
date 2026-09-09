import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Ambulance,
  Users,
  MapPin,
  Clock,
  Wrench,
  Shield,
  CheckCircle2,
  AlertOctagon,
  Radio,
  Search,
  X,
} from 'lucide-react';
import { RescueTeam, RescueTeamStatus } from '../types';
import { matchesIdOrText } from '../utils/searchUtils';

export const RescueTeamsView: React.FC = () => {
  const { rescueTeams, distressRequests, assignTeamToRequest, globalSearchQuery } = useDisaster();
  const [selectedIncidentForTeam, setSelectedIncidentForTeam] = useState<Record<string, string>>({});
  const [search, setSearch] = useState<string>('');

  const activeQuery = search.trim() || globalSearchQuery.trim();

  const filteredTeams = rescueTeams.filter((t) => {
    if (activeQuery) {
      return (
        matchesIdOrText(t.id, activeQuery) ||
        matchesIdOrText(t.name, activeQuery) ||
        matchesIdOrText(t.leader, activeQuery) ||
        matchesIdOrText(t.currentLocation, activeQuery) ||
        matchesIdOrText(t.vehicleType, activeQuery) ||
        matchesIdOrText(t.status, activeQuery)
      );
    }
    return true;
  });

  const unassignedRequests = distressRequests.filter(
    (r) => r.status !== 'RESCUED' && !r.assignedTeamId
  );

  const getStatusBadge = (status: RescueTeamStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'ASSIGNED':
      case 'EN_ROUTE':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'ON_SCENE':
        return 'bg-red-950 text-red-300 border-red-800 animate-pulse';
      case 'RETURNING':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-4 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono">
              FIELD RESCUE SQUADS & TACTICAL DEPLOYMENTS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Emergency Response Squads, NDRF specialized units, specialized rescue gear, and deployment telemetry.
          </p>
        </div>

        {/* Search & Global Summary */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search squad #ID (e.g. RT-01)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs rounded-lg pl-8 pr-7 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 w-56"
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

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
              Total Squads: <strong className="text-white">{rescueTeams.length}</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              Available:{' '}
              <strong className="text-emerald-300">
                {(rescueTeams || []).filter((t) => t.status === 'AVAILABLE').length}
              </strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800">
              Deployed:{' '}
              <strong className="text-cyan-300">
                {(rescueTeams || []).filter((t) => t.status !== 'AVAILABLE').length}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
            No rescue squads matching &ldquo;{activeQuery}&rdquo;.
          </div>
        ) : (
          filteredTeams.map((team) => (
          <div
            key={team.id}
            className="bg-[#0c1322] border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3.5 transition-colors shadow-lg"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-white border border-slate-700">
                    {team.id}
                  </span>
                  <h3 className="font-bold text-white text-base">{team.name}</h3>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{team.membersCount} Operators</span>
                  <span className="text-slate-600">•</span>
                  <span>Lead: {team.leadContact}</span>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${getStatusBadge(
                  team.status
                )}`}
              >
                {team.status.replace('_', ' ')}
              </span>
            </div>

            {/* Current Position & Mission */}
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>Location:</span>
                </span>
                <span className="text-white font-semibold truncate max-w-[150px]">
                  {team.currentLocation}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Assigned Task:</span>
                </span>
                <span className="text-cyan-300 font-bold">
                  {team.currentAssignmentRequestId
                    ? `Incident #${team.currentAssignmentRequestId}`
                    : 'Standing By (None)'}
                </span>
              </div>

              {team.etaMinutes !== undefined && team.etaMinutes > 0 && (
                <div className="flex items-center justify-between text-amber-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>ETA to Target:</span>
                  </span>
                  <span className="font-bold">{team.etaMinutes} minutes</span>
                </div>
              )}
            </div>

            {/* Specialized Equipment */}
            <div className="space-y-1 text-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px] font-mono flex items-center gap-1">
                <Wrench className="w-3 h-3 text-slate-500" />
                <span>SPECIALIZED SQUAD GEAR:</span>
              </div>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {(team.specializedEquipment || team.equipment || []).map((eq, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-950 text-slate-300 border border-slate-800"
                  >
                    • {eq}
                  </span>
                ))}
              </div>
            </div>

            {/* Dispatch Action */}
            <div className="pt-2 border-t border-slate-800 text-xs font-mono">
              {team.status === 'AVAILABLE' ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedIncidentForTeam[team.id] || ''}
                      onChange={(e) =>
                        setSelectedIncidentForTeam((prev) => ({
                          ...prev,
                          [team.id]: e.target.value,
                        }))
                      }
                      className="bg-slate-950 border border-slate-700 text-xs rounded px-2 py-1.5 text-slate-200 flex-1 focus:outline-none"
                    >
                      <option value="">Dispatch to Incident...</option>
                      {(unassignedRequests || []).map((r) => (
                        <option key={r.id} value={r.id}>
                          #{r.id} ({r.peopleCount} ppl, Score {r.calculatedScore})
                        </option>
                      ))}
                    </select>

                    <button
                      disabled={!selectedIncidentForTeam[team.id]}
                      onClick={() => {
                        if (selectedIncidentForTeam[team.id]) {
                          assignTeamToRequest(selectedIncidentForTeam[team.id], team.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold rounded transition-colors shrink-0"
                    >
                      DISPATCH
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Radio Comm: ACTIVE CH-4</span>
                  <span className="text-cyan-400">Live GPS tracking</span>
                </div>
              )}
            </div>
          </div>
        )))}
      </div>
    </div>
  );
};
