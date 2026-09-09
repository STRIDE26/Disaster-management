import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Radio,
  Send,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Users,
  Building,
  Volume2,
  Smartphone,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { BroadcastAlert, AlertSeverity } from '../types';

export const AlertsView: React.FC = () => {
  const { alerts, sendBroadcastAlert } = useDisaster();

  const [title, setTitle] = useState<string>('AFTERSHOCK ADVISORY: STRUCTURAL EVACUATION');
  const [message, setMessage] = useState<string>(
    'Geological survey detects secondary tremor risks. All occupants in Central Business District must evacuate compromised multi-story structures to open assembly grounds immediately.'
  );
  const [severity, setSeverity] = useState<AlertSeverity>('CRITICAL');
  const [targetAudience, setTargetAudience] = useState<string>('AFFECTED_SECTOR');
  const [channels, setChannels] = useState({
    cellBroadcast: true,
    sms: true,
    push: true,
    sirens: true,
  });

  const [showSuccessNotice, setShowSuccessNotice] = useState<boolean>(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    sendBroadcastAlert({
      title,
      message,
      severity,
      targetAudience,
      channels: [
        ...(channels.cellBroadcast ? ['CELL_BROADCAST'] : []),
        ...(channels.sms ? ['SMS'] : []),
        ...(channels.push ? ['APP_PUSH'] : []),
        ...(channels.sirens ? ['OUTDOOR_SIRENS'] : []),
      ],
    });

    setShowSuccessNotice(true);
    setTimeout(() => setShowSuccessNotice(false), 5000);
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-base font-bold text-white font-mono">
              CIVIL DEFENSE BROADCAST & MASS NOTIFICATION CENTER
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Government Cell Broadcast, localized geo-fenced SMS blasts, mobile push alerts, and outdoor loudspeaker systems.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-red-950/80 text-red-300 border border-red-800">
            CAP Compliant (Common Alerting Protocol)
          </span>
        </div>
      </div>

      {showSuccessNotice && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Broadcast dispatched successfully to telecom carriers and public address systems.</span>
        </div>
      )}

      {/* Broadcast Composer (Section 27) */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2 pb-3 border-b border-slate-800">
          <Send className="w-4 h-4 text-cyan-400" />
          <span>COMPOSE EMERGENCY PUBLIC BROADCAST</span>
        </h3>

        <form onSubmit={handleBroadcast} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Alert Title / Headline:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            {/* Severity */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Alert Severity Level:</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2.5 text-slate-200 focus:outline-none font-mono"
              >
                <option value="CRITICAL">🔴 CRITICAL (Triggers Forced Phone Tone & Sirens)</option>
                <option value="WARNING">🟠 WARNING (Evacuation Notice)</option>
                <option value="ADVISORY">🟡 ADVISORY (General Public Guidance)</option>
                <option value="ALL_CLEAR">🟢 ALL CLEAR (Post-Event Stand Down)</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Public Instruction Message Body:</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 font-sans"
            />
          </div>

          {/* Target Audience & Distribution Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Target Demographic / Geographic Area:</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2.5 text-slate-200 focus:outline-none font-mono"
              >
                <option value="ALL_REGISTERED">All Registered Citizens (Metro Bengaluru)</option>
                <option value="AFFECTED_SECTOR">CBD Affected Impact Sector Only (Brigade & MG Rd)</option>
                <option value="UNACCOUNTED_ONLY">Unaccounted Household Contacts Only</option>
                <option value="RESCUE_TEAMS_ONLY">Active Field Rescue Squads</option>
              </select>
            </div>

            {/* Channels Checklist */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Transmission Channels:</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.cellBroadcast}
                    onChange={(e) =>
                      setChannels((prev) => ({ ...prev, cellBroadcast: e.target.checked }))
                    }
                    className="rounded text-red-600 focus:ring-0"
                  />
                  <span>Cell Broadcast</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.sms}
                    onChange={(e) =>
                      setChannels((prev) => ({ ...prev, sms: e.target.checked }))
                    }
                    className="rounded text-red-600 focus:ring-0"
                  />
                  <span>Emergency SMS</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.push}
                    onChange={(e) =>
                      setChannels((prev) => ({ ...prev, push: e.target.checked }))
                    }
                    className="rounded text-red-600 focus:ring-0"
                  />
                  <span>RESQ Mobile App</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.sirens}
                    onChange={(e) =>
                      setChannels((prev) => ({ ...prev, sirens: e.target.checked }))
                    }
                    className="rounded text-red-600 focus:ring-0"
                  />
                  <span>Public Sirens (PA)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-lg font-mono tracking-wider transition-colors shadow-lg shadow-red-950 flex items-center gap-2"
            >
              <Radio className="w-4 h-4" />
              <span>TRANSMIT EMERGENCY BROADCAST</span>
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast History Log */}
      <div className="space-y-3">
        <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <span>BROADCAST TRANSMISSION ARCHIVE</span>
        </h3>

        <div className="space-y-2.5">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      (alert.severity === 'CRITICAL' || alert.type === 'EVACUATION')
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {alert.severity || (alert.type === 'EVACUATION' ? 'CRITICAL' : 'WARNING')}
                  </span>
                  <h4 className="font-bold text-white text-sm">{alert.title}</h4>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {alert.timestamp || alert.issuedAt || '14:00'} IST • ID: #{alert.id}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Audience: <strong className="text-slate-200">{alert.targetAudience || alert.targetZone || 'Affected Metro Sector'}</strong></span>
                  <span>•</span>
                  <span>Recipients Reached: <strong className="text-emerald-400">{(alert.recipientsReached ?? 12400).toLocaleString()}</strong></span>
                </div>

                <div className="flex items-center gap-1 text-[10px]">
                  {(alert.channels || []).map((ch, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
