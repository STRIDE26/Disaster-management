import React, { useState, useEffect } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { Hospital, BedAllocationRecord } from '../types';
import {
  Bed,
  HeartPulse,
  Activity,
  Wind,
  CheckCircle2,
  X,
  Printer,
  Copy,
  AlertTriangle,
  Ambulance,
  User,
  ShieldCheck,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const EmergencyBedAllocationModal: React.FC = () => {
  const {
    isAllocationModalOpen,
    setIsAllocationModalOpen,
    activeAllocationHospital,
    hospitals,
    people,
    allocateEmergencyBed,
    selectedAllocationVoucher,
    setSelectedAllocationVoucher,
    bedAllocations,
  } = useDisaster();

  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [patientSource, setPatientSource] = useState<'EXISTING' | 'MANUAL'>('MANUAL');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [customPatientName, setCustomPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<number>(34);
  const [bedType, setBedType] = useState<
    'TRAUMA_EMERGENCY' | 'ICU_VENTILATOR' | 'OXYGEN_SUPPORTED' | 'BURN_UNIT' | 'GENERAL_ACUTE'
  >('TRAUMA_EMERGENCY');
  const [triagePriority, setTriagePriority] = useState<'RED_CRITICAL' | 'YELLOW_URGENT' | 'GREEN_STABLE'>('RED_CRITICAL');
  const [ambulanceCallsign, setAmbulanceCallsign] = useState<string>('AMB-MED-03');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ALLOCATE' | 'RECENT_VOUCHERS'>('ALLOCATE');

  // Initialize selected hospital from activeAllocationHospital or first hospital
  useEffect(() => {
    if (activeAllocationHospital) {
      setSelectedHospitalId(activeAllocationHospital.id);
    } else if (hospitals.length > 0 && !selectedHospitalId) {
      setSelectedHospitalId(hospitals[0].id);
    }
  }, [activeAllocationHospital, hospitals, selectedHospitalId]);

  if (!isAllocationModalOpen) return null;

  const currentHospital =
    hospitals.find((h) => h.id === selectedHospitalId) || activeAllocationHospital || hospitals[0];

  const handlePersonSelect = (personId: string) => {
    setSelectedPersonId(personId);
    const person = people.find((p) => p.id === personId);
    if (person) {
      setCustomPatientName(person.name);
      setPatientAge(person.age);
      if (person.isHeavilyInjured) {
        setTriagePriority('RED_CRITICAL');
        setBedType('TRAUMA_EMERGENCY');
      } else if (person.isSeriouslyUnwell) {
        setTriagePriority('YELLOW_URGENT');
        setBedType('OXYGEN_SUPPORTED');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPatientName =
      patientSource === 'EXISTING' && selectedPersonId
        ? people.find((p) => p.id === selectedPersonId)?.name || customPatientName || 'Unknown Casualty'
        : customPatientName.trim() || 'Unidentified Trauma Patient';

    const voucher = allocateEmergencyBed({
      hospitalId: currentHospital.id,
      patientName: finalPatientName,
      patientAge: patientAge,
      triagePriority,
      bedType,
      ambulanceCallsign,
      personId: patientSource === 'EXISTING' ? selectedPersonId : undefined,
      notes: clinicalNotes,
    });

    setSelectedAllocationVoucher(voucher);
  };

  const copyVoucherDetails = (voucher: BedAllocationRecord) => {
    const text = `
EMERGENCY ADMISSION PASS - STRIDE DISASTER NETWORK
Voucher ID: ${voucher.voucherId}
Patient: ${voucher.patientName} (Age: ${voucher.patientAge || 'N/A'})
Priority: ${voucher.triagePriority}
Bed Category: ${voucher.bedType}
Facility: ${voucher.hospitalName}
Assigned Bay: ${voucher.assignedBay}
Doctor on Duty: ${voucher.attendingPhysician}
Ambulance: ${voucher.dispatchedAmbulanceCallsign}
Issued At: ${voucher.timestamp}
Status: ${voucher.status}
    `.trim();

    navigator.clipboard?.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[92vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Emergency Bed Allocation & Triage Voucher</span>
                <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">
                  LIVE ADMISSION
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct dispatch reservation with guaranteed bay number and digital triage voucher
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAllocationModalOpen(false);
              setSelectedAllocationVoucher(null);
            }}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 bg-slate-950/60 p-2 border-b border-slate-800 gap-1.5 text-xs font-mono">
          <button
            onClick={() => {
              setActiveTab('ALLOCATE');
            }}
            className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'ALLOCATE'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>New Bed Allocation</span>
          </button>
          <button
            onClick={() => setActiveTab('RECENT_VOUCHERS')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'RECENT_VOUCHERS'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Issued Vouchers ({bedAllocations.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* If a Voucher has just been issued, show the digital pass */}
          {selectedAllocationVoucher && activeTab === 'ALLOCATE' ? (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-xl bg-emerald-950/40 border-2 border-emerald-500/60 text-emerald-100 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">EMERGENCY BED ALLOCATED</div>
                      <div className="text-xs text-emerald-300 font-mono">
                        {selectedAllocationVoucher.voucherId} • GUARANTEED ADMISSION
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono bg-emerald-900/80 text-emerald-200 px-2.5 py-1 rounded border border-emerald-700">
                    STATUS: {selectedAllocationVoucher.status}
                  </span>
                </div>

                {/* Voucher Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block">PATIENT NAME & AGE</span>
                    <span className="font-bold text-white text-sm">
                      {selectedAllocationVoucher.patientName}
                    </span>
                    <span className="text-slate-300 block text-[11px]">
                      Age: {selectedAllocationVoucher.patientAge || 'N/A'} • Triage:{' '}
                      <span className="text-rose-400 font-bold">
                        {selectedAllocationVoucher.triagePriority.replace('_', ' ')}
                      </span>
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block">ASSIGNED FACILITY & BAY</span>
                    <span className="font-bold text-cyan-300 text-sm">
                      {selectedAllocationVoucher.assignedBay}
                    </span>
                    <span className="text-slate-300 block text-[11px] truncate">
                      {selectedAllocationVoucher.hospitalName}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block">BED CATEGORY</span>
                    <span className="font-bold text-amber-300">
                      {selectedAllocationVoucher.bedType.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 block text-[10px]">
                      Doctor: {selectedAllocationVoucher.attendingPhysician}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block">TRANSPORT DISPATCH</span>
                    <span className="font-bold text-emerald-300">
                      {selectedAllocationVoucher.dispatchedAmbulanceCallsign}
                    </span>
                    <span className="text-slate-400 block text-[10px]">
                      Issued: {selectedAllocationVoucher.timestamp}
                    </span>
                  </div>
                </div>

                {/* Digital Barcode Representation */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center space-y-1">
                  <div className="font-mono text-2xl tracking-[0.35em] text-slate-300 select-none">
                    {selectedAllocationVoucher.barcode}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    SCAN AT AMBULANCE DOCK / TRIAGE DESK FOR INSTANT ADMISSION
                  </div>
                </div>

                {/* Copy / Print Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyVoucherDetails(selectedAllocationVoucher)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedNotification ? 'Copied to Clipboard!' : 'Copy Voucher Text'}</span>
                    </button>
                    <button
                      onClick={() => window.print?.()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Pass</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedAllocationVoucher(null)}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
                  >
                    + Allocate Another Bed
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'ALLOCATE' ? (
            /* Allocation Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              {/* Target Hospital Selector & Current Capacity */}
              <div className="space-y-2">
                <label className="text-slate-300 font-medium flex items-center justify-between">
                  <span>Select Receiving Hospital</span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Available Beds: {currentHospital?.beds?.available ?? 0} / {currentHospital?.beds?.total ?? 0}
                  </span>
                </label>
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} — {h.beds?.available ?? 0} Beds Available (ICU: {h.beds?.icuAvailable ?? 0}, Vent:{' '}
                      {h.beds?.ventilatorAvailable ?? 0}, Trauma: {h.beds?.traumaEmergencyBedsAvailable ?? 0})
                    </option>
                  ))}
                </select>

                {/* Quick Hospital Status Badges */}
                {currentHospital && (
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ICU / Vent Capacity</span>
                      <span className="font-bold text-rose-400">
                        {currentHospital.beds.icuAvailable} ICU / {currentHospital.beds.ventilatorAvailable} Vent
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Trauma Bay Status</span>
                      <span className="font-bold text-emerald-400">
                        {currentHospital.beds.traumaEmergencyBedsAvailable} Bays Ready
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Est. Triage Wait</span>
                      <span className="font-bold text-amber-400">
                        ~{currentHospital.estimatedWaitMinutes} Mins
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Patient Selection Mode */}
              <div className="space-y-2">
                <label className="text-slate-300 font-medium block">Patient / Casualty Record</label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setPatientSource('MANUAL')}
                    className={`py-1.5 px-3 rounded-lg border font-bold text-center transition-colors ${
                      patientSource === 'MANUAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Custom Casualty Name
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientSource('EXISTING')}
                    className={`py-1.5 px-3 rounded-lg border font-bold text-center transition-colors ${
                      patientSource === 'EXISTING'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    From Tracked Casualties
                  </button>
                </div>

                {patientSource === 'EXISTING' ? (
                  <select
                    value={selectedPersonId}
                    onChange={(e) => handlePersonSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Choose casualty from disaster tracking list --</option>
                    {people
                      .filter((p) => p.status !== 'SAFE')
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Age {p.age}) — {p.status} • {p.expectedLocation}
                        </option>
                      ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={customPatientName}
                        onChange={(e) => setCustomPatientName(e.target.value)}
                        placeholder="e.g. Ramesh Chandra (Trauma Casualty)"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(parseInt(e.target.value) || 0)}
                        placeholder="Age"
                        min={1}
                        max={110}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bed Type & Triage Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Required Bed Category</label>
                  <select
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  >
                    <option value="TRAUMA_EMERGENCY">Trauma Care & Resuscitation Bay</option>
                    <option value="ICU_VENTILATOR">Intensive Care Unit (ICU) + Ventilator</option>
                    <option value="OXYGEN_SUPPORTED">High-Flow Oxygen Supported Bed</option>
                    <option value="BURN_UNIT">Severe Burn & Debridement Unit</option>
                    <option value="GENERAL_ACUTE">General Acute Disaster Ward</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Clinical Triage Priority</label>
                  <select
                    value={triagePriority}
                    onChange={(e) => setTriagePriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  >
                    <option value="RED_CRITICAL">🔴 RED (P1: Immediate Resuscitation)</option>
                    <option value="YELLOW_URGENT">🟡 YELLOW (P2: Urgent - Serious Injury)</option>
                    <option value="GREEN_STABLE">🟢 GREEN (P3: Delayed - Stable Ambulatory)</option>
                  </select>
                </div>
              </div>

              {/* Inbound Ambulance & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Inbound Ambulance Unit</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={ambulanceCallsign}
                      onChange={(e) => setAmbulanceCallsign(e.target.value)}
                      placeholder="e.g. AMB-MED-03"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                    />
                    <Ambulance className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Clinical Brief / Notes</label>
                  <input
                    type="text"
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="e.g. Crush injury, left femur fracture, Vitals: BP 100/70"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={currentHospital && currentHospital.beds.available <= 0}
                className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-3 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/80 active:scale-[0.99]"
              >
                <Bed className="w-4 h-4" />
                <span>CONFIRM ALLOCATION & ISSUE DIGITAL ADMISSION PASS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Recent Issued Vouchers Tab */
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Active bed reservations and hospital vouchers</span>
                <span className="font-mono text-cyan-400">{bedAllocations.length} total records</span>
              </div>

              {bedAllocations.map((v) => (
                <div
                  key={v.voucherId}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">{v.voucherId}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          v.triagePriority === 'RED_CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        {v.triagePriority.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{v.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block">PATIENT</span>
                      <span className="text-slate-200 font-bold">{v.patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">BAY ASSIGNMENT</span>
                      <span className="text-cyan-300 font-bold">{v.assignedBay}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">HOSPITAL</span>
                      <span className="text-slate-300 truncate block">{v.hospitalName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">AMBULANCE</span>
                      <span className="text-emerald-300">{v.dispatchedAmbulanceCallsign}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs font-mono">
                    <span className="text-[11px] text-slate-400 truncate max-w-[280px]">
                      {v.notes}
                    </span>
                    <button
                      onClick={() => copyVoucherDetails(v)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
