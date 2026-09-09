import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Users,
  UserCheck,
  UserX,
  HelpCircle,
  Building,
  Shield,
  Search,
  CheckCircle2,
  Tent,
  Ambulance,
  Smartphone,
  Info,
  MapPin,
  Clock,
} from 'lucide-react';
import { ConfirmationSource } from '../types';

export const AccountabilityView: React.FC = () => {
  const { buildings, people, eventInfo, confirmPersonSafe, checkInPersonToShelter, shelters, setSelectedPerson } = useDisaster();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  // Filtered buildings
  const displayedBuildings =
    selectedBuildingId === 'ALL'
      ? buildings
      : buildings.filter((b) => b.id === selectedBuildingId);

  // Confirmed safe records with sources (Section 8)
  const safePeople = people.filter((p) => p.status === 'SAFE');
  const filteredSafePeople = safePeople.filter((p) => {
    if (sourceFilter === 'ALL') return true;
    return p.confirmationSource === sourceFilter;
  });

  const getSourceBadge = (source: ConfirmationSource) => {
    switch (source) {
      case 'SELF_CONFIRMATION':
        return {
          label: "🟢 SELF-CONFIRMATION (I'M SAFE)",
          icon: Smartphone,
          classes: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
        };
      case 'SHELTER_CHECKIN':
        return {
          label: '🏕️ SHELTER CHECK-IN',
          icon: Tent,
          classes: 'bg-blue-950/80 text-blue-300 border-blue-800',
        };
      case 'CHECKPOINT_RECORD':
        return {
          label: '🛂 CHECKPOINT EVACUATION',
          icon: CheckCircle2,
          classes: 'bg-purple-950/80 text-purple-300 border-purple-800',
        };
      case 'RESCUE_TEAM':
        return {
          label: '🚑 RESCUE TEAM CONFIRMATION',
          icon: Ambulance,
          classes: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
        };
      default:
        return {
          label: 'UNSPECIFIED SOURCE',
          icon: Shield,
          classes: 'bg-slate-800 text-slate-400 border-slate-700',
        };
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto">
      {/* Top Banner with Core Rule */}
      <div className="bg-[#0b121e] border border-slate-800 rounded-xl p-4 flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white font-mono">
            DISASTER ACCOUNTABILITY SYSTEM
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            <strong>Critical Boundary:</strong> Expected location does <span className="text-amber-300 font-semibold underline">NOT</span> mean confirmed presence.
            Unaccounted people represent individuals who have not yet checked in via automated SMS, shelter scanner, checkpoint, or field team — <span className="italic text-slate-400">“Unaccounted does not necessarily mean the person is in danger.”</span>
          </p>
        </div>
      </div>

      {/* Building-by-Building Accountability Cards (Section 7) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm font-mono tracking-wide">
              BUILDING-LEVEL ACCOUNTABILITY BREAKDOWN
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Structure:</span>
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none font-mono"
            >
              <option value="ALL">All Monitored Buildings ({buildings.length})</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedBuildings.map((bld) => {
            // Expected breakdown
            const safe = bld.confirmedSafeCount;
            const absent = bld.knownAbsentCount;
            const distress = bld.distressCount;
            // Formula: Unaccounted = Expected - Confirmed Safe - Known Absent - Distress
            const unaccounted = Math.max(0, bld.expectedCount - safe - absent - distress);

            const totalExpected = bld.expectedCount || 1;
            const safePct = Math.min(100, Math.round((safe / totalExpected) * 100));
            const absentPct = Math.min(100, Math.round((absent / totalExpected) * 100));
            const distressPct = Math.min(100, Math.round((distress / totalExpected) * 100));
            const unaccPct = Math.max(0, 100 - (safePct + absentPct + distressPct));

            return (
              <div
                key={bld.id}
                className="bg-[#0c1322] border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-colors shadow-lg"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{bld.name}</h4>
                    <div className="text-[11px] text-slate-400 mt-0.5">{bld.areaZone}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      bld.damageLevel === 'SEVERE'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    DAMAGE: {bld.damageLevel}
                  </span>
                </div>

                {/* Expected Population Summary */}
                <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Total Registered:</span>
                    <strong className="text-white">{bld.registeredCount} people</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-amber-400">Expected During Disaster:</span>
                    <strong className="text-amber-300 font-bold">{bld.expectedCount} people</strong>
                  </div>
                </div>

                {/* Stacked Horizontal Bar */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                    <span>STATUS RATIO</span>
                    <span>Expected: {bld.expectedCount}</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${safePct}%` }}
                      className="bg-emerald-500 transition-all"
                      title={`Safe: ${safe}`}
                    />
                    <div
                      style={{ width: `${absentPct}%` }}
                      className="bg-blue-500 transition-all"
                      title={`Known Absent: ${absent}`}
                    />
                    <div
                      style={{ width: `${distressPct}%` }}
                      className="bg-red-500 transition-all"
                      title={`Distress: ${distress}`}
                    />
                    <div
                      style={{ width: `${unaccPct}%` }}
                      className="bg-amber-500 transition-all"
                      title={`Unaccounted: ${unaccounted}`}
                    />
                  </div>
                </div>

                {/* Metric Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-emerald-950/60">
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      SAFE
                    </div>
                    <div className="text-lg font-bold text-white mt-0.5">{safe}</div>
                  </div>

                  <div className="p-2 rounded bg-slate-900 border border-blue-950/60">
                    <div className="text-[10px] text-blue-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      ABSENT
                    </div>
                    <div className="text-lg font-bold text-white mt-0.5">{absent}</div>
                  </div>

                  <div className="p-2 rounded bg-slate-900 border border-red-950/60">
                    <div className="text-[10px] text-red-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      DISTRESS
                    </div>
                    <div className="text-lg font-bold text-white mt-0.5">{distress}</div>
                  </div>

                  <div className="p-2 rounded bg-slate-900 border border-amber-950/60">
                    <div className="text-[10px] text-amber-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      UNACCOUNTED
                    </div>
                    <div className="text-lg font-bold text-amber-300 mt-0.5">{unaccounted}</div>
                  </div>
                </div>

                {/* Callout */}
                <div className="flex items-center justify-between text-[11px] font-mono p-2 rounded bg-amber-950/30 border border-amber-800/40 text-amber-300">
                  <span>🟡 {unaccounted} UNACCOUNTED</span>
                  <span className="text-[10px] text-slate-400">Search: {bld.searchStatus.replace('_', ' ')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmed Safe System with Verified Sources (Section 8) */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 lg:p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base font-mono">
                CONFIRMED SAFE VERIFICATION REGISTRY
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Every status update is logged with exact confirmation source, timestamp, location, and reporting authority.
            </p>
          </div>

          {/* Filter by Confirmation Source */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Source:</span>
            <div className="flex flex-wrap gap-1 text-xs">
              {[
                { key: 'ALL', label: 'All Sources' },
                { key: 'SELF_CONFIRMATION', label: "Self (I'm Safe)" },
                { key: 'SHELTER_CHECKIN', label: 'Shelter QR' },
                { key: 'CHECKPOINT_RECORD', label: 'Checkpoint' },
                { key: 'RESCUE_TEAM', label: 'Rescue Squad' },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setSourceFilter(btn.key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                    sourceFilter === btn.key
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmed Safe Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSafePeople.map((person) => {
            const badge = getSourceBadge(person.confirmationSource);
            const Icon = badge.icon;
            return (
              <div
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-3.5 space-y-2 cursor-pointer transition-all hover:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        #{person.id}
                      </span>
                      <h4 className="font-bold text-white text-sm">{person.name}</h4>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Household: <span className="text-slate-300 font-mono">{person.householdId}</span> • Age: {person.age}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    SAFE
                  </span>
                </div>

                {/* Source Badge */}
                <div className={`p-2 rounded-lg border text-xs font-mono flex items-center gap-2 ${badge.classes}`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <div className="text-[10px] uppercase font-bold">{badge.label}</div>
                    <div className="text-[11px] opacity-90 truncate">{person.confirmationDetails || 'Confirmed safe in database'}</div>
                  </div>
                </div>

                {/* Location & Time footer */}
                <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1 truncate max-w-[170px]">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{person.lastKnownLocation}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {person.confirmationTimestamp || person.lastUpdate} IST
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
