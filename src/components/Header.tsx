import React, { useState, useEffect } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Siren,
  Clock,
  Search,
  Radio,
  User,
  Smartphone,
  Zap,
  ChevronDown,
  Bell,
  X,
  AlertTriangle,
  Info,
  HeartPulse,
  Users,
  Key,
  Menu,
  ShieldCheck,
  LayoutDashboard,
  Map as MapIcon,
  Tent,
  Ambulance,
  Route,
  BarChart3,
  Settings,
} from 'lucide-react';
import { DisasterMode } from '../types';
import { GlobalSearchBar } from './GlobalSearchBar';
import { ConnectionStatus } from './ConnectionStatus';

export const Header: React.FC = () => {
  const {
    mode,
    setMode,
    eventInfo,
    globalSearchQuery,
    setGlobalSearchQuery,
    isCitizenView,
    setIsCitizenView,
    setIsBroadcastModalOpen,
    triggerDemoPulse,
    alerts,
    activeTab,
    setActiveTab,
    currentUserRole,
    setIsAuthModalOpen,
    selectedHouseholdId,
  } = useDisaster();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showModeDropdown, setShowModeDropdown] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getModeBadge = (m: DisasterMode) => {
    switch (m) {
      case 'BEFORE':
        return {
          label: '🟡 BEFORE MODE (PRE-IMPACT)',
          classes: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        };
      case 'DURING':
        return {
          label: '🔴 DURING MODE ACTIVE',
          classes: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse',
        };
      case 'AFTER':
        return {
          label: '🔵 AFTER MODE (RECOVERY)',
          classes: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
    }
  };

  const currentBadge = getModeBadge(mode);

  return (
    <header className="sticky top-0 z-40 bg-[#0c121e] border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Disaster Identifier & Mode Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white tracking-wide text-sm md:text-base flex items-center gap-1.5">
                  <span className="text-red-400 font-mono font-semibold">EVENT:</span> {eventInfo.name}
                </h1>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono hidden sm:inline-block">
                  M{eventInfo.magnitude.split(' ')[0]}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Detected: 14:03 IST</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-mono text-[10px] bg-amber-950/60 px-1 py-0.5 rounded border border-amber-800/40">
                  DEMO ENVIRONMENT — NOT FOR REAL EMERGENCY USE
                </span>
              </div>
            </div>
          </div>

          {/* Mode Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border font-mono transition-colors ${currentBadge.classes}`}
              title="Click to toggle disaster operating state"
            >
              <span>{currentBadge.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showModeDropdown && (
              <div className="absolute left-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                  SELECT OPERATIONAL DISASTER MODE:
                </div>
                <button
                  onClick={() => {
                    setMode('BEFORE');
                    setShowModeDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-slate-800 ${
                    mode === 'BEFORE' ? 'bg-slate-800/60 text-amber-300 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span className="text-base">🟡</span>
                  <div>
                    <div className="font-semibold">BEFORE MODE</div>
                    <div className="text-[10px] text-slate-400">Baseline registration, expected locations, shelter readiness</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setMode('DURING');
                    setShowModeDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-slate-800 ${
                    mode === 'DURING' ? 'bg-slate-800/60 text-red-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span className="text-base">🔴</span>
                  <div>
                    <div className="font-semibold">DURING MODE (Active)</div>
                    <div className="text-[10px] text-slate-400">Tactical rescue, accountability checks, triage & SOS routing</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setMode('AFTER');
                    setShowModeDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-slate-800 ${
                    mode === 'AFTER' ? 'bg-slate-800/60 text-blue-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span className="text-base">🔵</span>
                  <div>
                    <div className="font-semibold">AFTER MODE</div>
                    <div className="text-[10px] text-slate-400">Recovery audit, historical analytics, permanent rehousing</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Actions & Search */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Global Search Bar with live autocomplete results dropdown */}
          <GlobalSearchBar />

          {/* Visual Connection Status Indicator (Online/Offline & Server Sync) */}
          <ConnectionStatus />

          {/* Live Clock with Ticking Seconds */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded text-xs font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentTime || '14:37:00 IST'}</span>
          </div>

          {/* Simulate Event / Demo Pulse Button */}
          <button
            onClick={triggerDemoPulse}
            className="flex items-center gap-1 text-xs bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 px-2 py-1 rounded transition-colors font-mono"
            title="Inject simulated rescue event, new SOS, or shelter update"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="hidden sm:inline">SIMULATE EVENT</span>
          </button>

          {/* Citizen SOS Mode Toggle */}
          <button
            onClick={() => setIsCitizenView(!isCitizenView)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded border font-mono transition-all ${
              isCitizenView
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-800/60'
            }`}
            title="Open the ultra-simple Citizen Emergency SOS screen"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isCitizenView ? 'EXIT CITIZEN VIEW' : 'CITIZEN SOS VIEW'}</span>
          </button>

          {/* Hospitals Shortcut Button */}
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border font-mono transition-all ${
              activeTab === 'hospitals'
                ? 'bg-rose-500 text-white font-bold border-rose-400 shadow-md shadow-rose-950'
                : 'bg-slate-800/90 hover:bg-slate-700 text-rose-300 border-rose-900/60'
            }`}
            title="Nearby Hospitals & Bed Availability Index"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>HOSPITALS</span>
          </button>

          {/* Family Portal Shortcut Button */}
          <button
            onClick={() => setActiveTab('family')}
            className={`hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border font-mono transition-all ${
              activeTab === 'family'
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-950'
                : 'bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border-cyan-900/60'
            }`}
            title="Family Member Status & Welfare Checks"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>FAMILY PORTAL</span>
          </button>

          {/* Role Login / Switcher Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-md border transition-all ${
              currentUserRole === 'ADMINISTRATOR' || currentUserRole === 'CONTROL_ROOM_OPERATOR'
                ? 'bg-rose-950/80 border-rose-600/70 text-rose-300 hover:bg-rose-900/80'
                : currentUserRole === 'SHELTER_STAFF'
                ? 'bg-amber-950/80 border-amber-500/70 text-amber-300 hover:bg-amber-900/80'
                : currentUserRole === 'FAMILY_MEMBER'
                ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-300 hover:bg-cyan-900/80'
                : 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900/80'
            }`}
            title="Click to Switch Login Role (Admin / Shelter / Family / Citizen)"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {currentUserRole === 'ADMINISTRATOR' || currentUserRole === 'CONTROL_ROOM_OPERATOR'
                ? 'ADMIN HQ'
                : currentUserRole === 'SHELTER_STAFF'
                ? 'SHELTER WARDEN'
                : currentUserRole === 'FAMILY_MEMBER'
                ? `FAMILY (${selectedHouseholdId})`
                : 'CITIZEN'}
            </span>
            <span className="sm:hidden text-[10px]">
              {currentUserRole === 'SHELTER_STAFF' ? 'SHELTER' : currentUserRole === 'FAMILY_MEMBER' ? 'FAMILY' : currentUserRole.startsWith('ADMIN') ? 'ADMIN' : 'USER'}
            </span>
          </button>

          {/* Emergency Broadcast Button */}
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-md shadow-lg shadow-red-900/30 border border-red-500/80 active:scale-95 transition-all"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>BROADCAST ALERT</span>
          </button>

          {/* Mobile All-Modules Menu Hamburger (Visible on screens < 768px) */}
          <div className="relative md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg flex items-center justify-center transition-colors"
              title="All Modules Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {showMobileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs font-mono">
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>ALL MODULES</span>
                  <button onClick={() => setShowMobileMenu(false)} className="text-slate-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="py-1 space-y-0.5 max-h-72 overflow-y-auto">
                  {[
                    { id: 'command', label: 'Command Center', icon: LayoutDashboard },
                    { id: 'map', label: 'Live GIS Map', icon: MapIcon },
                    { id: 'hospitals', label: 'Hospitals & Beds', icon: HeartPulse },
                    { id: 'family', label: 'Family Member Portal', icon: Users },
                    { id: 'accountability', label: 'Accountability Status', icon: Users },
                    { id: 'distress', label: 'Distress SOS Requests', icon: Siren },
                    { id: 'priority', label: 'Rescue Priority Rank', icon: Zap },
                    { id: 'shelters', label: 'Shelters & Supplies', icon: Tent },
                    { id: 'teams', label: 'Rescue Teams Dispatch', icon: Ambulance },
                    { id: 'roads', label: 'Roads & Evacuation', icon: Route },
                    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
                    { id: 'settings', label: 'System Settings & Audit', icon: Settings },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveTab(m.id);
                          setShowMobileMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                          activeTab === m.id
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 transition-colors"
              title="Alert Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {alerts.length}
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>EMERGENCY DISPATCH NOTIFICATIONS ({alerts.length})</span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800 mt-2 space-y-2">
                  {alerts.map((alt) => (
                    <div key={alt.id} className="pt-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-mono text-red-400">
                        <span>{alt.type} ALERT</span>
                        <span className="text-slate-500">{alt.issuedAt}</span>
                      </div>
                      <div className="font-semibold text-slate-200 mt-0.5">{alt.title}</div>
                      <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">{alt.message}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('alerts');
                      setShowNotifications(false);
                    }}
                    className="text-xs text-cyan-400 hover:underline font-mono"
                  >
                    View All Operational Broadcasts &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Operator Profile */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded text-xs">
            <div className="w-5 h-5 rounded-full bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300 text-[10px] font-bold">
              OP
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-200 leading-tight">Operator #204</div>
              <div className="text-[9px] text-slate-400 leading-tight">Chief Controller</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
