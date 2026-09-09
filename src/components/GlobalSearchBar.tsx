import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Search,
  X,
  User,
  AlertOctagon,
  Building2,
  Ambulance,
  Tent,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { matchesIdOrText } from '../utils/searchUtils';
import { Person, DistressRequest, Building, RescueTeam, Shelter, BlockedRoad } from '../types';

export const GlobalSearchBar: React.FC = () => {
  const {
    people,
    distressRequests,
    buildings,
    rescueTeams,
    shelters,
    blockedRoads,
    globalSearchQuery,
    setGlobalSearchQuery,
    setSelectedPerson,
    setSelectedRequest,
    setSelectedBuilding,
    setActiveTab,
  } = useDisaster();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut '/' or 'Cmd/Ctrl+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const query = globalSearchQuery.trim();

  // Filter entities across all collections
  const results = useMemo(() => {
    if (!query) return null;

    const matchedPeople = people.filter(
      (p) =>
        matchesIdOrText(p.id, query) ||
        matchesIdOrText(p.name, query) ||
        matchesIdOrText(p.householdId, query) ||
        matchesIdOrText(p.phone, query) ||
        matchesIdOrText(p.expectedLocation, query) ||
        matchesIdOrText(p.lastKnownLocation, query)
    );

    const matchedRequests = distressRequests.filter(
      (r) =>
        matchesIdOrText(r.id, query) ||
        matchesIdOrText(r.personId, query) ||
        matchesIdOrText(r.householdId, query) ||
        matchesIdOrText(r.reporterName, query) ||
        matchesIdOrText(r.locationName, query) ||
        matchesIdOrText(r.buildingId, query) ||
        matchesIdOrText(r.assignedTeamId, query)
    );

    const matchedBuildings = buildings.filter(
      (b) =>
        matchesIdOrText(b.id, query) ||
        matchesIdOrText(b.name, query) ||
        matchesIdOrText(b.areaZone, query)
    );

    const matchedTeams = rescueTeams.filter(
      (t) =>
        matchesIdOrText(t.id, query) ||
        matchesIdOrText(t.name, query) ||
        matchesIdOrText(t.leader, query) ||
        matchesIdOrText(t.currentLocation, query)
    );

    const matchedShelters = shelters.filter(
      (s) =>
        matchesIdOrText(s.id, query) ||
        matchesIdOrText(s.name, query) ||
        matchesIdOrText(s.location, query)
    );

    const matchedRoads = blockedRoads.filter(
      (br) =>
        matchesIdOrText(br.id, query) ||
        matchesIdOrText(br.roadName, query) ||
        matchesIdOrText(br.reason, query)
    );

    const totalCount =
      matchedPeople.length +
      matchedRequests.length +
      matchedBuildings.length +
      matchedTeams.length +
      matchedShelters.length +
      matchedRoads.length;

    return {
      people: matchedPeople,
      requests: matchedRequests,
      buildings: matchedBuildings,
      teams: matchedTeams,
      shelters: matchedShelters,
      roads: matchedRoads,
      totalCount,
    };
  }, [query, people, distressRequests, buildings, rescueTeams, shelters, blockedRoads]);

  // Actions when an entity is clicked
  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setActiveTab('people');
    setIsOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelectRequest = (req: DistressRequest) => {
    setSelectedRequest(req);
    setActiveTab('distress');
    setIsOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelectBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setActiveTab('buildings');
    setIsOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelectTeam = (team: RescueTeam) => {
    setActiveTab('teams');
    setIsOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelectShelter = (shelter: Shelter) => {
    setActiveTab('shelters');
    setIsOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelectRoad = (road: BlockedRoad) => {
    setActiveTab('roads');
    setIsOpen(false);
    setIsMobileSearchOpen(false);
  };

  // Keyboard navigation on Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setIsMobileSearchOpen(false);
      return;
    }
    if (e.key === 'Enter' && results && results.totalCount > 0) {
      e.preventDefault();
      // Select the first matching entity
      if (results.people.length > 0) {
        handleSelectPerson(results.people[0]);
      } else if (results.requests.length > 0) {
        handleSelectRequest(results.requests[0]);
      } else if (results.buildings.length > 0) {
        handleSelectBuilding(results.buildings[0]);
      } else if (results.teams.length > 0) {
        handleSelectTeam(results.teams[0]);
      } else if (results.shelters.length > 0) {
        handleSelectShelter(results.shelters[0]);
      } else if (results.roads.length > 0) {
        handleSelectRoad(results.roads[0]);
      }
    }
  };

  const popularSearches = [
    { label: '#182', desc: 'Person P182 & SOS R182 (Critical)', value: '182' },
    { label: 'HH-402', desc: 'Household Verma (Flooded)', value: 'HH-402' },
    { label: 'BLD-A', desc: 'Shanti Towers (Collapsed)', value: 'BLD-A' },
    { label: 'RT-01', desc: 'Alpha Squad (On Scene)', value: 'RT-01' },
    { label: 'SH-12', desc: 'Central Transit Shelter', value: 'SH-12' },
  ];

  // Render Result List UI
  const renderResultsDropdown = () => {
    if (!isOpen) return null;

    return (
      <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-[480px] lg:w-[540px] mt-1.5 bg-[#0a1120] border border-slate-700/90 rounded-xl shadow-2xl shadow-black/80 z-50 overflow-hidden backdrop-blur-md max-h-[75vh] flex flex-col">
        {/* Header Summary */}
        <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
          {query ? (
            <span className="font-mono text-cyan-300 flex items-center gap-1.5">
              <Search className="w-3 h-3 text-cyan-400" />
              <span>
                Found <strong>{results?.totalCount ?? 0}</strong> record{(results?.totalCount ?? 0) !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
              </span>
            </span>
          ) : (
            <span className="text-slate-400 text-[11px] font-mono flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Quick ID & Entity Directory</span>
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300 border border-slate-700">↵ Enter</kbd> to open
          </span>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto divide-y divide-slate-800/60 p-1.5 text-xs">
          {/* Empty query: Show suggested quick searches */}
          {!query && (
            <div className="p-3 space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                ⚡ Frequent Emergency IDs (Click to inspect):
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {popularSearches.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setGlobalSearchQuery(item.value);
                      inputRef.current?.focus();
                    }}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-left border border-slate-800 hover:border-cyan-500/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700 group-hover:border-cyan-400 text-[11px]">
                        {item.label}
                      </span>
                      <span className="text-slate-300 text-xs">{item.desc}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results: No matches found */}
          {query && results && results.totalCount === 0 && (
            <div className="p-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500 border border-slate-800">
                <Search className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-200">No records found for &ldquo;{query}&rdquo;</div>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                Try searching numbers like <code className="text-cyan-400 font-mono">182</code>, person ID <code className="text-cyan-400 font-mono">P182</code>, SOS request <code className="text-cyan-400 font-mono">R182</code>, building <code className="text-cyan-400 font-mono">BLD-A</code>, team <code className="text-cyan-400 font-mono">RT-01</code>, or a citizen&apos;s name.
              </p>
            </div>
          )}

          {/* Category: People */}
          {results && results.people.length > 0 && (
            <div className="py-2">
              <div className="px-2.5 py-1 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3 h-3" />
                <span>People & Citizens ({results.people.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.people.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPerson(p)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-left transition-colors group border border-transparent hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-xs shrink-0">
                        {p.id}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs truncate group-hover:text-cyan-300">
                          {p.name} <span className="text-[11px] font-normal text-slate-400 font-mono">({p.householdId})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {p.lastKnownLocation || p.expectedLocation}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          p.status === 'DISTRESS'
                            ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
                            : p.status === 'SAFE'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : p.status === 'UNACCOUNTED'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {p.status}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category: Distress Requests */}
          {results && results.requests.length > 0 && (
            <div className="py-2">
              <div className="px-2.5 py-1 text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-3 h-3" />
                <span>Distress SOS Requests ({results.requests.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.requests.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRequest(r)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-left transition-colors group border border-transparent hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800 text-xs shrink-0">
                        {r.id}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs truncate group-hover:text-red-300">
                          {r.reporterName}{' '}
                          <span className="text-[11px] font-normal text-slate-400 font-mono">
                            ({r.peopleCount} {r.peopleCount === 1 ? 'person' : 'people'})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{r.locationName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-900/60 text-red-200 border border-red-700">
                        Score: {r.calculatedScore}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category: Buildings */}
          {results && results.buildings.length > 0 && (
            <div className="py-2">
              <div className="px-2.5 py-1 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                <span>Buildings & Sectors ({results.buildings.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.buildings.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBuilding(b)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-left transition-colors group border border-transparent hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-xs shrink-0">
                        {b.id}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs truncate group-hover:text-amber-300">
                          {b.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{b.areaZone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                        {b.damageLevel} DAMAGE
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category: Rescue Teams */}
          {results && results.teams.length > 0 && (
            <div className="py-2">
              <div className="px-2.5 py-1 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Ambulance className="w-3 h-3" />
                <span>Rescue Teams ({results.teams.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.teams.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTeam(t)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-left transition-colors group border border-transparent hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-xs shrink-0">
                        {t.id}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs truncate group-hover:text-cyan-300">
                          {t.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">Leader: {t.leader}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        {t.status.replace('_', ' ')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category: Shelters */}
          {results && results.shelters.length > 0 && (
            <div className="py-2">
              <div className="px-2.5 py-1 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Tent className="w-3 h-3" />
                <span>Evacuation Shelters ({results.shelters.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.shelters.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectShelter(s)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-left transition-colors group border border-transparent hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-xs shrink-0">
                        {s.id}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs truncate group-hover:text-emerald-300">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{s.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {s.availableBeds} beds
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category: Blocked Roads */}
          {results && results.roads.length > 0 && (
            <div className="py-2">
              <div className="px-2.5 py-1 text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" />
                <span>Roads & Hazards ({results.roads.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.roads.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRoad(r)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-left transition-colors group border border-transparent hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-rose-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-xs shrink-0">
                        {r.id}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs truncate group-hover:text-rose-300">
                          {r.roadName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{r.reason}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        {r.status}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Search Bar */}
      <div ref={containerRef} className="relative hidden md:block w-48 lg:w-72">
        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-cyan-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search #ID (e.g. 182, BLD-A)..."
          value={globalSearchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setGlobalSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-slate-900/95 border border-slate-700/90 rounded-lg pl-8 pr-14 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 shadow-inner font-sans transition-all"
        />

        {/* Right action inside input: Clear or Shortcut hint */}
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {globalSearchQuery ? (
            <button
              type="button"
              onClick={() => {
                setGlobalSearchQuery('');
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-white p-0.5 rounded"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="hidden lg:inline text-[9px] font-mono bg-slate-800 text-slate-400 px-1 py-0.5 rounded border border-slate-700 pointer-events-none">
              /
            </kbd>
          )}
        </div>

        {/* Render Dropdown */}
        {renderResultsDropdown()}
      </div>

      {/* Mobile Search Button */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => {
            setIsMobileSearchOpen(true);
            setIsOpen(true);
            setTimeout(() => mobileInputRef.current?.focus(), 100);
          }}
          className="p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-cyan-400 hover:text-white transition-colors"
          title="Search #ID or entity"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Fullscreen Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 p-3 sm:p-4 flex flex-col md:hidden">
          <div className="bg-[#0c1322] border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col max-h-[90vh]">
            {/* Top Search Header */}
            <div className="p-3 border-b border-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Search #ID, person, building, team..."
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              {globalSearchQuery && (
                <button
                  type="button"
                  onClick={() => setGlobalSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded font-mono border border-slate-700"
              >
                Close
              </button>
            </div>

            {/* Dropdown contents inline */}
            <div className="flex-1 overflow-y-auto p-2">
              {renderResultsDropdown()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
