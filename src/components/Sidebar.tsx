import React from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  LayoutDashboard,
  Map as MapIcon,
  Users,
  AlertOctagon,
  TrendingUp,
  UserCheck,
  Building2,
  Tent,
  Ambulance,
  Route,
  Radio,
  BarChart3,
  Settings,
  Shield,
  Wifi,
  Database,
  RefreshCw,
  HeartPulse,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    eventInfo,
    distressRequests,
    shelters,
    rescueTeams,
    blockedRoads,
    alerts,
    lastSyncTime,
    systemOperational,
    isOnline,
  } = useDisaster();

  // Count active/critical indicators
  const criticalCount = distressRequests.filter((r) => r.status === 'CRITICAL' || r.status === 'HIGH').length;
  const availableTeams = rescueTeams.filter((t) => t.status === 'AVAILABLE').length;
  const blockedRoadCount = blockedRoads.filter((r) => r.status === 'BLOCKED').length;

  const navItems = [
    { id: 'command', label: 'Command Center', icon: LayoutDashboard, badge: null },
    { id: 'map', label: 'Live Map', icon: MapIcon, badge: 'GIS' },
    { id: 'hospitals', label: 'Hospitals & Beds', icon: HeartPulse, badge: 'Live BAI', badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40' },
    { id: 'family', label: 'Family Member Portal', icon: Users, badge: 'Family', badgeClass: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' },
    { id: 'accountability', label: 'Accountability', icon: Users, badge: `${eventInfo.unaccounted} unacc.` },
    { id: 'distress', label: 'Distress Requests', icon: AlertOctagon, badge: criticalCount > 0 ? `${criticalCount}` : null, badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    { id: 'priority', label: 'Rescue Priority', icon: TrendingUp, badge: 'Ranked' },
    { id: 'people', label: 'People', icon: UserCheck, badge: null },
    { id: 'buildings', label: 'Buildings & Areas', icon: Building2, badge: '6' },
    { id: 'shelters', label: 'Shelters', icon: Tent, badge: `${shelters.length}` },
    { id: 'teams', label: 'Rescue Teams', icon: Ambulance, badge: `${availableTeams} avail.` },
    { id: 'roads', label: 'Roads & Evacuation', icon: Route, badge: `${blockedRoadCount} blk.` },
    { id: 'alerts', label: 'Alerts', icon: Radio, badge: `${alerts.length}` },
    { id: 'reports', label: 'Reports', icon: BarChart3, badge: null },
    { id: 'settings', label: 'System Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 bg-[#090e17] border-r border-slate-800/80 flex-col justify-between shrink-0 h-[calc(100vh-53px)] sticky top-[53px] overflow-y-auto">
      {/* Brand & Subtitle */}
      <div>
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-md shadow-red-950/50">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-wider font-mono flex items-center gap-1.5">
                <span>RESQ</span>
                <span className="text-red-400">COMMAND</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-tight">
                Disaster Accountability & Rescue Coordination
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-0.5">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Operations Console
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/60'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ml-1.5 ${
                      item.badgeClass || 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800 bg-[#070b12] text-xs font-mono space-y-2">
        <div className="bg-slate-900/90 rounded p-2.5 border border-slate-800/90 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold">SYSTEM STATUS</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Operational
            </span>
          </div>

          <div className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
            {isOnline ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                Uplink & Systems Online
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping"></span>
                Offline (Mesh Buffer)
              </span>
            )}
          </div>

          <div className="pt-1.5 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-400">
                <RefreshCw className="w-2.5 h-2.5 text-slate-500" />
                Last Sync:
              </span>
              <span className="text-slate-300">{lastSyncTime}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-400">
                <Wifi className="w-2.5 h-2.5 text-cyan-500" />
                Mesh Network:
              </span>
              <span className="text-cyan-400">Online (Mesh 2.4G)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-400">
                <Database className="w-2.5 h-2.5 text-emerald-500" />
                GIS & Seismology:
              </span>
              <span className="text-emerald-400">Synced</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center px-1 font-mono">
          RESQ COMMAND v2.6.4 • Node ID #BLR-HQ-01
        </div>
      </div>
    </aside>
  );
};
