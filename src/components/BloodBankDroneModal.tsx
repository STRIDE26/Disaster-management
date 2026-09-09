import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Droplet,
  Plane,
  X,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Zap,
  Activity,
} from 'lucide-react';

export const BloodBankDroneModal: React.FC = () => {
  const {
    isBloodBankModalOpen,
    setIsBloodBankModalOpen,
    hospitals,
    bloodDroneDispatches,
    dispatchBloodDrone,
  } = useDisaster();

  const [selectedHospitalId, setSelectedHospitalId] = useState(
    hospitals.length > 0 ? hospitals[0].id : ''
  );
  const [bloodType, setBloodType] = useState('O- (Universal Donor)');
  const [units, setUnits] = useState<number>(3);
  const [destinationZone, setDestinationZone] = useState('Field Triage Post Alpha (Brigade Road)');
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isBloodBankModalOpen) return null;

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHospital) return;

    dispatchBloodDrone({
      hospitalId: currentHospital.id,
      bloodType,
      units,
      destinationZone,
    });

    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 3500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[92vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Blood Bank Reserves & Drone Express Logistics</span>
                <span className="text-[10px] font-mono bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded">
                  COLD-CHAIN AIR DISPATCH
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Hospital blood inventory management and autonomous medical drone delivery
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBloodBankModalOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* Hospital Blood Reserves Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-red-400" />
                <span>Hospital Network Blood Stock Level</span>
              </span>
              <span className="text-slate-400">Total Facilities: {hospitals.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {hospitals.map((h) => (
                <div
                  key={h.id}
                  onClick={() => setSelectedHospitalId(h.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedHospitalId === h.id
                      ? 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate max-w-[200px]">
                      {h.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        h.bloodBank.oNegative === 'ADEQUATE'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : h.bloodBank.oNegative === 'LOW'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}
                    >
                      O- {h.bloodBank.oNegative}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-300">
                    <div>
                      <span className="text-[9px] text-slate-500 block">Plasma</span>
                      <span className="font-bold">{h.bloodBank.plasmaUnits} Units</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Platelets</span>
                      <span className="font-bold">{h.bloodBank.plateletsUnits} Units</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Drone Dock</span>
                      <span className="font-bold text-emerald-400">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drone Dispatch Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-red-300 font-mono flex items-center gap-2">
                <Plane className="w-4 h-4 text-red-400" />
                <span>RAPID MEDICAL DRONE DISPATCH CONTROL</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">
                Cold-Box Payload: 4°C Calibrated
              </span>
            </div>

            {successNotice && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Drone launched! Transponder active. Real-time telemetry feed initiated.</span>
              </div>
            )}

            <form onSubmit={handleDispatch} className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1">Source Hospital</label>
                  <select
                    value={selectedHospitalId}
                    onChange={(e) => setSelectedHospitalId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white focus:outline-none focus:border-red-500 truncate"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Blood / Component Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="O- (Universal Donor)">O- (Universal Trauma Transfusion)</option>
                    <option value="O+ Positive">O+ Positive</option>
                    <option value="A+ Platelets">A+ Concentrated Platelets</option>
                    <option value="B+ Positive">B+ Positive</option>
                    <option value="Fresh Frozen Plasma">Fresh Frozen Plasma (FFP)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Units (Cold Pouch)</label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
                    min={1}
                    max={6}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Destination Emergency Zone / Field Clinic</label>
                <input
                  type="text"
                  value={destinationZone}
                  onChange={(e) => setDestinationZone(e.target.value)}
                  placeholder="e.g. Field Triage Post Alpha (Brigade Road)"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded font-mono text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-950/80"
              >
                <Plane className="w-4 h-4" />
                <span>AUTHORIZE AIR DRONE LAUNCH & TRANSMIT FLIGHT PATH</span>
              </button>
            </form>
          </div>

          {/* Active Flight Missions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 font-mono block">
              Active Drone Missions ({bloodDroneDispatches.length})
            </span>

            <div className="space-y-2">
              {bloodDroneDispatches.map((drone) => (
                <div
                  key={drone.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="w-3.5 h-3.5 text-red-400" />
                      <span className="font-bold text-white">{drone.id}</span>
                      <span className="text-slate-400">• {drone.bloodType} ({drone.units} units)</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        drone.status === 'DELIVERED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-cyan-950 text-cyan-300 border-cyan-800 animate-pulse'
                      }`}
                    >
                      {drone.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Origin: <span className="text-slate-200">{drone.hospitalName}</span>
                    </span>
                    <span>
                      ETA:{' '}
                      <span className="text-amber-400 font-bold">
                        {drone.etaMinutes > 0 ? `${drone.etaMinutes} Mins` : 'ARRIVED'}
                      </span>
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Destination: <span className="text-cyan-300">{drone.destinationZone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
