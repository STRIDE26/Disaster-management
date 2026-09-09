import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  AlertOctagon,
  MapPin,
  Clock,
  Shield,
  Smartphone,
  Eye,
  CheckCircle2,
  HelpCircle,
  X,
} from 'lucide-react';
import { Person, PersonStatus } from '../types';
import { matchesIdOrText } from '../utils/searchUtils';

export const PeopleView: React.FC = () => {
  const { people, setSelectedPerson, confirmPersonSafe, globalSearchQuery } = useDisaster();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // If local search is empty, fall back to globalSearchQuery
  const activeQuery = search.trim() || globalSearchQuery.trim();

  const filteredPeople = people.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (activeQuery) {
      return (
        matchesIdOrText(p.id, activeQuery) ||
        matchesIdOrText(p.name, activeQuery) ||
        matchesIdOrText(p.householdId, activeQuery) ||
        matchesIdOrText(p.phone, activeQuery) ||
        matchesIdOrText(p.expectedLocation, activeQuery) ||
        matchesIdOrText(p.lastKnownLocation, activeQuery)
      );
    }
    return true;
  });

  const getStatusBadge = (status: PersonStatus) => {
    switch (status) {
      case 'SAFE':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'UNACCOUNTED':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'DISTRESS':
        return 'bg-red-950/80 text-red-300 border-red-800';
      case 'KNOWN_ELSEWHERE':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto">
      {/* Top Bar */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono">
              CITIZEN REGISTRY & ACCOUNTABILITY DATABASE
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registered residents, baseline expected locations, telemetry pings, and verification sources.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search person, ID (e.g. 182, P182)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs rounded-lg pl-8 pr-7 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 w-60"
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

          <div className="flex rounded-lg bg-slate-900 border border-slate-700 p-0.5 text-xs font-mono">
            {['ALL', 'SAFE', 'UNACCOUNTED', 'DISTRESS', 'KNOWN_ELSEWHERE'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === tab
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* People Table (Section 25) */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-mono text-slate-400 bg-slate-900/90 border-b border-slate-800 uppercase">
              <tr>
                <th className="py-3 px-3">Person ID</th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Household</th>
                <th className="py-3 px-3">Expected Location</th>
                <th className="py-3 px-3">Last Known Location</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Confirmation Source</th>
                <th className="py-3 px-3">Last Update</th>
                <th className="py-3 px-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredPeople.map((person) => (
                <tr
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 font-bold text-cyan-400">#{person.id}</td>
                  <td className="py-3 px-3 font-semibold text-white font-sans">
                    {person.name}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{person.householdId}</td>
                  <td className="py-3 px-3 text-slate-300 font-sans truncate max-w-[150px]">
                    {person.expectedLocation}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-sans truncate max-w-[180px]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{person.lastKnownLocation}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                        person.status
                      )}`}
                    >
                      {person.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-300">
                    {person.confirmationSource.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3 text-slate-400">{person.lastUpdate} IST</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPerson(person);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-sans text-xs border border-slate-700 transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
