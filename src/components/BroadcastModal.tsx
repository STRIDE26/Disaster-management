import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { Radio, X, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AlertSeverity } from '../types';

export const BroadcastModal: React.FC = () => {
  const { isBroadcastModalOpen, setIsBroadcastModalOpen, sendBroadcastAlert } = useDisaster();

  const [title, setTitle] = useState<string>('CIVIL EMERGENCY: MANDATORY EVACUATION');
  const [message, setMessage] = useState<string>(
    'Secondary tremors detected. All citizens in Zone 1 (MG Road, Brigade Road) evacuate to Kanteerava Stadium immediately. Follow marked green routes.'
  );
  const [severity, setSeverity] = useState<AlertSeverity>('CRITICAL');
  const [targetAudience, setTargetAudience] = useState<string>('AFFECTED_SECTOR');
  const [dispatched, setDispatched] = useState<boolean>(false);

  if (!isBroadcastModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendBroadcastAlert({
      title,
      message,
      severity,
      targetAudience,
      channels: ['CELL_BROADCAST', 'SMS', 'APP_PUSH', 'OUTDOOR_SIRENS'],
    });
    setDispatched(true);
    setTimeout(() => {
      setDispatched(false);
      setIsBroadcastModalOpen(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b121f] border border-red-500/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500 text-red-400 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-mono">
                BROADCAST EMERGENCY ALERT
              </h3>
              <p className="text-[11px] text-red-300 font-mono">Government Cell Broadcast & Sirens</p>
            </div>
          </div>
          <button
            onClick={() => setIsBroadcastModalOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {dispatched ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <div className="text-white font-bold font-mono">ALERT DISPATCHED ACROSS ALL CHANNELS</div>
            <div className="text-xs text-slate-400">Cell Broadcast, SMS & Sirens Triggered</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1 font-mono">Alert Headline:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1 font-mono">Severity Level:</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono focus:outline-none"
              >
                <option value="CRITICAL">🔴 CRITICAL (Force Vibration + Loud Alarm)</option>
                <option value="WARNING">🟠 WARNING (Evacuation Recommended)</option>
                <option value="ADVISORY">🟡 ADVISORY (Public Safety Notice)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1 font-mono">Target Region:</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono focus:outline-none"
              >
                <option value="AFFECTED_SECTOR">CBD Affected Impact Sector (MG Rd & Brigade)</option>
                <option value="ALL_REGISTERED">All Registered Citizens Metro Area</option>
                <option value="UNACCOUNTED_ONLY">Unaccounted Residents Only</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1 font-mono">Message Text:</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-sans focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-mono font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-red-950"
              >
                <Send className="w-3.5 h-3.5" />
                <span>BROADCAST NOW</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
