import React, { useState, useRef, useEffect } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ChevronDown,
  X,
  Database,
  ArrowDownUp,
  Sliders,
} from 'lucide-react';

export const ConnectionStatus: React.FC = () => {
  const {
    isOnline,
    setIsOnline,
    syncStatus,
    setSyncStatus,
    pingLatency,
    lastSyncTime,
    bufferedActionsCount,
    forceSync,
  } = useDisaster();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isForcing, setIsForcing] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle manual force sync action
  const handleForceSync = () => {
    setIsForcing(true);
    forceSync();
    setTimeout(() => {
      setIsForcing(false);
    }, 900);
  };

  // Toggle simulate offline mode
  const handleToggleOffline = () => {
    if (isOnline) {
      setIsOnline(false);
      setSyncStatus('OFFLINE');
    } else {
      setIsOnline(true);
      setSyncStatus('SYNCING');
      setTimeout(() => {
        setSyncStatus('SYNCED');
      }, 800);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 1. Header Visual Connection Indicator Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono transition-all select-none active:scale-95 ${
          !isOnline || syncStatus === 'OFFLINE'
            ? 'bg-red-950/80 hover:bg-red-900/80 border-red-500/70 text-red-200 shadow-md shadow-red-950/60 animate-pulse'
            : syncStatus === 'SYNCING' || isForcing
            ? 'bg-cyan-950/80 hover:bg-cyan-900/80 border-cyan-500/70 text-cyan-200'
            : 'bg-slate-900/90 hover:bg-slate-800/90 border-emerald-500/50 hover:border-emerald-400 text-emerald-300'
        }`}
        title="Click to view Command Server connection diagnostics & sync controls"
        aria-label="Connection Status"
        aria-expanded={isOpen}
      >
        {/* Pulsing Status Beacon */}
        {!isOnline || syncStatus === 'OFFLINE' ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        ) : syncStatus === 'SYNCING' || isForcing ? (
          <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
        ) : (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}

        {/* Status Icon */}
        {!isOnline || syncStatus === 'OFFLINE' ? (
          <WifiOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
        ) : (
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        )}

        {/* Primary Status Label */}
        <span className="font-bold tracking-wider">
          {!isOnline || syncStatus === 'OFFLINE' ? (
            <span className="text-red-300">OFFLINE</span>
          ) : syncStatus === 'SYNCING' || isForcing ? (
            <span className="text-cyan-300">SYNCING...</span>
          ) : (
            <span className="text-emerald-400">ONLINE</span>
          )}
        </span>

        {/* Secondary Details (Desktop only) */}
        <span className="text-[11px] text-slate-400 hidden sm:inline-block">
          {!isOnline || syncStatus === 'OFFLINE' ? (
            <span className="text-red-300 font-semibold">• MESH BUFFER</span>
          ) : syncStatus === 'SYNCING' || isForcing ? (
            <span className="text-cyan-400">• PUSHING</span>
          ) : (
            <span className="text-emerald-300/80">• SYNC ACTIVE</span>
          )}
        </span>

        {/* Latency badge or Queued badge */}
        {!isOnline || syncStatus === 'OFFLINE' ? (
          <span className="text-[10px] bg-red-900/90 text-red-200 px-1.5 py-0.5 rounded border border-red-700 font-bold">
            {bufferedActionsCount > 0 ? `${bufferedActionsCount} QUEUED` : 'LOCAL'}
          </span>
        ) : (
          <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/80 hidden md:inline-block">
            {pingLatency}ms
          </span>
        )}

        <ChevronDown
          className={`w-3 h-3 opacity-60 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 2. Detailed Diagnostics & Uplink Management Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#090f1d] border border-slate-700/80 rounded-xl shadow-2xl shadow-black/90 p-4 z-50 text-xs text-slate-200 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                  !isOnline || syncStatus === 'OFFLINE'
                    ? 'bg-red-950/80 border-red-700 text-red-400'
                    : 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                }`}
              >
                {!isOnline || syncStatus === 'OFFLINE' ? (
                  <WifiOff className="w-4 h-4" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm font-sans flex items-center gap-1.5">
                  <span>Server Connection Status</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Command Telemetry Uplink
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              title="Close connection panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current State Banner */}
          <div
            className={`mt-3 p-2.5 rounded-lg border flex items-center justify-between ${
              !isOnline || syncStatus === 'OFFLINE'
                ? 'bg-red-950/50 border-red-700/60 text-red-200'
                : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 font-mono text-xs">
              {!isOnline || syncStatus === 'OFFLINE' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <span className="font-bold text-red-300">DISCONNECTED</span>
                    <div className="text-[10px] text-red-300/80 font-sans">
                      Operating in Offline Local Mesh Buffer
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-300">CONNECTED & SYNCHRONIZED</span>
                    <div className="text-[10px] text-emerald-300/80 font-sans">
                      Active bidirectional event streaming
                    </div>
                  </div>
                </>
              )}
            </div>

            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                !isOnline || syncStatus === 'OFFLINE'
                  ? 'bg-red-900/60 border-red-700 text-red-300'
                  : 'bg-emerald-900/60 border-emerald-700 text-emerald-300'
              }`}
            >
              {!isOnline || syncStatus === 'OFFLINE' ? 'OFFLINE' : 'LIVE'}
            </span>
          </div>

          {/* Diagnostics Metrics Table */}
          <div className="mt-3 space-y-2 text-[11px] font-mono bg-slate-950/80 border border-slate-800/80 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                Target Node:
              </span>
              <span className="text-slate-200 font-semibold">HQ-PRIMARY-01 (Bengaluru)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                Uplink Protocol:
              </span>
              <span className="text-slate-300">WSS + TLS 1.3 / SSE Stream</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <ArrowDownUp className="w-3.5 h-3.5 text-purple-400" />
                Roundtrip Latency:
              </span>
              <span className={!isOnline ? 'text-red-400' : 'text-emerald-400 font-bold'}>
                {!isOnline ? 'Offline (Inf)' : `${pingLatency} ms (Optimal)`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                Last Server Sync:
              </span>
              <span className="text-cyan-300 font-bold">{lastSyncTime || 'Just now'}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                Local Outbox Queue:
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  bufferedActionsCount > 0
                    ? 'bg-amber-900/60 border border-amber-700 text-amber-300'
                    : 'text-slate-400'
                }`}
              >
                {bufferedActionsCount} pending records
              </span>
            </div>
          </div>

          {/* Operational Controls */}
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              {/* Force Sync Button */}
              <button
                type="button"
                onClick={handleForceSync}
                disabled={isForcing}
                className="flex-1 flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs font-mono transition-all active:scale-95 shadow-md shadow-cyan-950/80"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isForcing ? 'animate-spin' : ''}`} />
                <span>{isForcing ? 'SYNCHRONIZING...' : 'FORCE SYNC NOW'}</span>
              </button>

              {/* Offline Drill Simulator Toggle */}
              <button
                type="button"
                onClick={handleToggleOffline}
                className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-mono border transition-all ${
                  isOnline
                    ? 'bg-slate-900 hover:bg-red-950 text-slate-300 hover:text-red-300 border-slate-700 hover:border-red-700'
                    : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-700'
                }`}
                title="Toggle simulated connection drop to test offline field capability"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isOnline ? 'Simulate Offline' : 'Restore Online'}</span>
              </button>
            </div>

            {/* Field Note */}
            <p className="text-[10px] text-slate-400 font-sans leading-relaxed pt-1">
              <span className="text-cyan-400 font-semibold font-mono">Decentralized Mesh Buffer:</span> When
              offline, SOS tickets and squad updates are encrypted in local IndexedDB storage and
              automatically uploaded upon server reconnection.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
