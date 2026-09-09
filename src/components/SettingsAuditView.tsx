import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Shield,
  FileCheck,
  Search,
  Filter,
  Users,
  Settings,
  Sliders,
  CheckCircle,
  Key,
} from 'lucide-react';
import { UserRole } from '../types';

export const SettingsAuditView: React.FC = () => {
  const { auditLogs, currentUserRole, setCurrentUserRole } = useDisaster();

  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (roleFilter !== 'ALL' && !log.actor.includes(roleFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto">
      {/* Section 33: Active Operational Role Selection */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Key className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white font-mono">
            ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {[
            {
              role: 'DISASTER_COMMANDER',
              title: 'Disaster Commander',
              desc: 'Full authority to declare modes, dispatch squads, send cell broadcasts, override priority rules.',
            },
            {
              role: 'RESCUE_SQUAD_LEADER',
              title: 'Rescue Squad Leader',
              desc: 'Accept assignments, report on-scene status, confirm rescued occupants or mark not found.',
            },
            {
              role: 'SHELTER_COORDINATOR',
              title: 'Shelter Coordinator',
              desc: 'Execute intake verification, record shelter check-ins, manage capacity and food supplies.',
            },
            {
              role: 'CITIZEN',
              title: 'Citizen / Civilian',
              desc: "Submit I'M SAFE status check, send distress SOS, review safe evacuation routes.",
            },
            {
              role: 'AUDITOR',
              title: 'Government Auditor',
              desc: 'Read-only access to immutable disaster logs, telemetry timestamps, and sitreps.',
            },
          ].map((item) => {
            const isCurrent = currentUserRole === item.role;
            return (
              <div
                key={item.role}
                onClick={() => setCurrentUserRole(item.role as UserRole)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{item.title}</span>
                  {isCurrent && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                <span className="inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-950 text-slate-300">
                  {isCurrent ? 'ACTIVE ROLE' : 'SWITCH TO ROLE'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 32: Immutable Disaster Audit Log */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base font-mono">
                IMMUTABLE DISASTER AUDIT TRAIL
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically timestamped operational actions, status transitions, and squad dispatches.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 w-56 font-mono"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-mono text-slate-400 bg-slate-900/90 border-b border-slate-800 uppercase">
              <tr>
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / Role</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500">#{log.id}</td>
                  <td className="py-2.5 px-3 text-cyan-400 font-semibold">{log.timestamp} IST</td>
                  <td className="py-2.5 px-3 text-white font-sans font-medium">{log.actor}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
