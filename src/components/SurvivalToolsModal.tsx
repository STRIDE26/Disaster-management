import React, { useState, useEffect, useRef } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Radio,
  Zap,
  HeartPulse,
  Flame,
  Phone,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  LifeBuoy,
} from 'lucide-react';

export const SurvivalToolsModal: React.FC = () => {
  const {
    isSurvivalToolsModalOpen,
    setIsSurvivalToolsModalOpen,
  } = useDisaster();

  const [activeTab, setActiveTab] = useState<'SIREN_BEACON' | 'FIRST_AID' | 'EMERGENCY_HOTLINES'>('SIREN_BEACON');
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [isCprActive, setIsCprActive] = useState(false);
  const [cprBeepCount, setCprBeepCount] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<any>(null);
  const cprIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      // Cleanup audio
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
      if (cprIntervalRef.current) clearInterval(cprIntervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  if (!isSurvivalToolsModalOpen) return null;

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const toggleSiren = () => {
    if (isSirenActive) {
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
      setIsSirenActive(false);
    } else {
      const ctx = getAudioContext();
      if (!ctx) return;
      setIsSirenActive(true);

      let high = true;
      const playTone = () => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(high ? 960 : 700, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.38);
          high = !high;
        } catch (e) {
          console.error(e);
        }
      };

      playTone();
      sirenIntervalRef.current = setInterval(playTone, 400);
    }
  };

  const toggleCprMetronome = () => {
    if (isCprActive) {
      if (cprIntervalRef.current) clearInterval(cprIntervalRef.current);
      setIsCprActive(false);
    } else {
      const ctx = getAudioContext();
      if (!ctx) return;
      setIsCprActive(true);
      setCprBeepCount(0);

      // 105 beats per minute = 571 ms per beat
      const playClick = () => {
        try {
          setCprBeepCount((prev) => (prev % 30) + 1);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.4, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.09);
        } catch (e) {
          console.error(e);
        }
      };

      playClick();
      cprIntervalRef.current = setInterval(playClick, 571);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 ${
        isStrobeActive ? 'bg-amber-400 animate-pulse' : 'bg-black/85 backdrop-blur-md'
      }`}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[92vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Disaster Survival Toolkit & Medical Triage</span>
                <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">
                  OFFLINE READY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Acoustic distress beacons, CPR rhythm guide, first-aid protocols, and emergency hotlines
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
              if (cprIntervalRef.current) clearInterval(cprIntervalRef.current);
              setIsSirenActive(false);
              setIsCprActive(false);
              setIsStrobeActive(false);
              setIsSurvivalToolsModalOpen(false);
            }}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 bg-slate-950/60 p-2 border-b border-slate-800 gap-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab('SIREN_BEACON')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'SIREN_BEACON'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>SOS Beacons</span>
          </button>
          <button
            onClick={() => setActiveTab('FIRST_AID')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'FIRST_AID'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Triage & CPR</span>
          </button>
          <button
            onClick={() => setActiveTab('EMERGENCY_HOTLINES')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'EMERGENCY_HOTLINES'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hotlines & Radios</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeTab === 'SIREN_BEACON' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Acoustic High-Decibel Siren */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-rose-400" />
                      <span>HIGH-PITCH RESCUE SIREN</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isSirenActive
                          ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isSirenActive ? 'SOUNDING' : 'IDLE'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-sans">
                    Emits a dual-frequency 700Hz–960Hz acoustic pulsing siren to help K9 search teams and listening arrays locate trapped individuals under rubble.
                  </p>

                  <button
                    onClick={toggleSiren}
                    className={`w-full py-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isSirenActive
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/60 animate-bounce'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSirenActive ? 'STOP RESCUE SIREN' : 'TRIGGER AUDIO RESCUE SIREN'}</span>
                  </button>
                </div>

                {/* Visual Strobe Beacon */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>NIGHT SCREEN STROBE BEACON</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isStrobeActive
                          ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isStrobeActive ? 'FLASHING' : 'IDLE'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-sans">
                    Flashes high-contrast amber beacon lighting across device display to signal hovering search drones, boats, and rescue choppers in darkness or fog.
                  </p>

                  <button
                    onClick={() => setIsStrobeActive(!isStrobeActive)}
                    className={`w-full py-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isStrobeActive
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isStrobeActive ? 'STOP STROBE LIGHT' : 'ACTIVATE STROBE LIGHT'}</span>
                  </button>
                </div>
              </div>

              {/* Survival Signal Protocols */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
                <span className="text-cyan-400 font-bold block">
                  INTERNATIONALLY RECOGNIZED RESCUE SIGNALS (SOS)
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>
                    <strong className="text-white">Rule of Three:</strong> 3 distinct whistles, 3 loud bangs on pipes, or 3 flashes with a flashlight indicate urgent distress.
                  </li>
                  <li>
                    <strong className="text-white">Conserve Battery:</strong> Dim screen brightness to minimum unless signaling. Keep phone in Airplane Mode if network is dead and toggle only for scheduled sync pulses.
                  </li>
                  <li>
                    <strong className="text-white">Rubble tapping:</strong> Metal pipes conduct sound through concrete foundations far better than human voice shouting.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'FIRST_AID' && (
            <div className="space-y-4">
              {/* CPR Metronome */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-400" />
                    <span>CPR METRONOME CADENCE (105 BPM)</span>
                  </span>
                  {isCprActive && (
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      Compressions: {cprBeepCount} / 30
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 font-sans">
                  Audible metronome providing the exact 100–120 compressions/min rhythm for adult CPR. Push hard and fast in the center of the chest (depth: 2 inches).
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleCprMetronome}
                    className={`flex-1 py-2.5 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isCprActive
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <HeartPulse className="w-4 h-4" />
                    <span>{isCprActive ? 'STOP CPR CADENCE' : 'START CPR METRONOME (105 BPM)'}</span>
                  </button>
                </div>
              </div>

              {/* Triage Protocols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="font-bold text-rose-400 block">CRUSH INJURY & BLEEDING</span>
                  <p className="text-slate-300 text-[11px]">
                    Apply direct continuous pressure with clean dressing. If limbs are pinned for &gt;1 hour, avoid rapid untying without intravenous fluid access due to reperfusion syndrome.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="font-bold text-cyan-400 block">SMOKE INHALATION</span>
                  <p className="text-slate-300 text-[11px]">
                    Keep patient seated upright at 45°. Cover nose/mouth with moist cloth. Monitor for hoarseness or carbonaceous sputum indicating upper airway thermal damage.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="font-bold text-amber-400 block">THERMAL BURNS</span>
                  <p className="text-slate-300 text-[11px]">
                    Cool with room temperature clean water for 10–20 mins. Never apply ice directly. Cover with sterile non-adherent film. Keep patient warm to prevent shock.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="font-bold text-emerald-400 block">WATER PURIFICATION</span>
                  <p className="text-slate-300 text-[11px]">
                    Boil vigorously for 1 minute or use chlorine purification tablets (1 tablet per 1 liter of clear water, wait 30 minutes before drinking).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'EMERGENCY_HOTLINES' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="text-slate-400">
                Official National Disaster & Emergency Coordination Numbers (Toll-Free & VHF Frequencies)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { name: 'NDRF National Disaster Response Force', number: '1078 / 011-24363260', tag: 'DISASTER' },
                  { name: 'State Disaster Management (SEOC)', number: '1070 / 112', tag: 'STATE CONTROL' },
                  { name: 'Emergency Medical & Ambulance', number: '108 / 102', tag: 'TRAUMA' },
                  { name: 'Fire & Rescue Services', number: '101', tag: 'FIRE' },
                  { name: 'Police Control Room', number: '100 / 112', tag: 'SECURITY' },
                  { name: 'Disaster Mental Health & Psych Support', number: '080-46110007', tag: 'TELE-MANAS' },
                  { name: 'Childline Emergency Rescue', number: '1098', tag: 'CHILDREN' },
                  { name: 'Women Helpline in Distress', number: '181 / 1091', tag: 'WOMEN' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[11px] text-slate-300 block font-sans font-medium">{item.name}</span>
                      <a
                        href={`tel:${item.number.split('/')[0].trim()}`}
                        className="text-cyan-400 font-bold hover:underline"
                      >
                        {item.number}
                      </a>
                    </div>
                    <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-amber-400 font-bold block flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>HAM RADIO & CIVIL DEFENSE FREQUENCIES</span>
                </span>
                <p className="text-[11px] text-slate-300">
                  VHF Distress Channel 16: 156.800 MHz • Disaster Triage Net: 145.200 MHz • All India Radio Emergency Broadcast: AM 612 kHz / FM 102.9 MHz
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
