import React from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  X,
  User,
  Users,
  MapPin,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Tent,
  Smartphone,
  Info,
} from 'lucide-react';

export const PersonDetailModal: React.FC = () => {
  const { selectedPerson, setSelectedPerson, confirmPersonSafe, shelters, checkInPersonToShelter } =
    useDisaster();

  if (!selectedPerson) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b121f] border border-slate-700 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-700">
                  #{selectedPerson.id}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedPerson.name}</h3>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Age: {selectedPerson.age} • Phone: {selectedPerson.phone} • Household: {selectedPerson.householdId}
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedPerson(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Pill & Vulnerabilities */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 font-mono">ACCOUNTABILITY STATUS: </span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded ${
                selectedPerson.status === 'SAFE'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : selectedPerson.status === 'UNACCOUNTED'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              {selectedPerson.status}
            </span>
          </div>

          {(selectedPerson.medicalNotes || selectedPerson.notes) && (
            <div className="text-rose-300 font-mono text-[11px] bg-rose-950/60 px-2 py-1 rounded border border-rose-900/60">
              ⚠️ {selectedPerson.medicalNotes || selectedPerson.notes}
            </div>
          )}
        </div>

        {/* Expected Location vs Last Known Location (Crucial Principle Section 7 & 25) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="text-amber-400 font-bold font-mono text-[11px] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>EXPECTED BASELINE LOCATION</span>
            </div>
            <div className="text-white font-medium">{selectedPerson.expectedLocation}</div>
            <div className="text-[10px] text-slate-400 font-mono">Based on residence / office registry</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="text-cyan-400 font-bold font-mono text-[11px] flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" />
              <span>LAST KNOWN VERIFIED LOCATION</span>
            </div>
            <div className="text-white font-medium">{selectedPerson.lastKnownLocation}</div>
            <div className="text-[10px] text-slate-400 font-mono">
              GPS Accuracy: ±{selectedPerson.coordinates?.accuracyMeters || selectedPerson.gpsAccuracyMeters || 25}m
            </div>
          </div>
        </div>

        {/* Location & Status History Timeline (Section 12) */}
        <div className="space-y-2 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[11px] font-mono">
            VERIFIED LOCATION & STATUS AUDIT TRAIL:
          </span>
          <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            {(selectedPerson.locationHistory || (selectedPerson.timeline ? selectedPerson.timeline.map((t) => ({
              timestamp: t.time,
              location: t.description,
              source: t.type,
              accuracyMeters: selectedPerson.coordinates?.accuracyMeters || 25,
            })) : [])).map((hist, idx) => (
              <div key={idx} className="flex items-start gap-2.5 font-mono text-[11px]">
                <span className="text-cyan-400 font-bold shrink-0">{hist.timestamp} IST</span>
                <span className="text-slate-600">&rarr;</span>
                <div>
                  <span className="text-slate-200">{hist.location}</span>
                  <span className="text-slate-500 text-[10px] ml-1.5">
                    ({(hist.source || 'VERIFIED').replace('_', ' ')} • ±{hist.accuracyMeters}m)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {selectedPerson.status !== 'SAFE' && (
            <button
              onClick={() => {
                confirmPersonSafe(selectedPerson.id, 'RESCUE_TEAM', 'Verified by Field Commander on Scene');
                setSelectedPerson(null);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CONFIRM SAFE NOW</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPerson(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
