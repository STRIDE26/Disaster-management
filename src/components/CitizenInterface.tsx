import React, { useState, useEffect, useCallback } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Radio,
  MapPin,
  Clock,
  Battery,
  Wifi,
  Users,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ArrowLeft,
  Smartphone,
  Share2,
  Info,
  RefreshCw,
  Locate,
  LocateFixed,
  Compass,
  Loader2,
  HeartPulse,
  LifeBuoy,
  Plane,
  Bed,
} from 'lucide-react';

export const CitizenInterface: React.FC = () => {
  const {
    createDistressSOS,
    setIsCitizenView,
    eventInfo,
    setActiveTab,
    openEmergencyBedModal,
    setIsMissingPersonsModalOpen,
    setIsBloodBankModalOpen,
    setIsSurvivalToolsModalOpen,
    hospitals,
  } = useDisaster();

  // Screen states: 'HOME' | 'SAFE_CONFIRMED' | 'HELP_FORM' | 'SOS_SUBMITTED'
  const [screen, setScreen] = useState<'HOME' | 'SAFE_CONFIRMED' | 'HELP_FORM' | 'SOS_SUBMITTED'>('HOME');

  // Form states
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [situations, setSituations] = useState({
    trapped: false,
    heavilyInjured: false,
    waterRising: false,
    fire: false,
    disabled: false,
    children: false,
    seriouslyUnwell: false,
    needRescue: true,
    otherNotes: '',
  });

  const [citizenName, setCitizenName] = useState<string>('Naveen Chandran');
  const [householdId, setHouseholdId] = useState<string>('HH-814');
  const [locationName, setLocationName] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState<number>(48);
  const [connectivity, setConnectivity] = useState<'ONLINE' | 'WEAK_CELLULAR' | 'OFFLINE_MESH_RELAY'>('WEAK_CELLULAR');
  const [submittedRequestId, setSubmittedRequestId] = useState<string>('');
  const [submittedTime, setSubmittedTime] = useState<string>('');

  // Location Auto-Detection states
  type GpsState = 'IDLE' | 'DETECTING' | 'FOUND' | 'NOT_FOUND' | 'DENIED';
  const [gpsStatus, setGpsStatus] = useState<GpsState>('IDLE');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracyMeters: number } | null>(null);
  const [detectedAddress, setDetectedAddress] = useState<string>('');
  const [locationError, setLocationError] = useState<string | null>(null);

  const [showMeshExplainer, setShowMeshExplainer] = useState<boolean>(false);

  // Read simulated battery if API available or fallback
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
      }).catch(() => {});
    }
  }, []);

  // Automatic Location Detection function
  const detectLocation = useCallback(() => {
    setGpsStatus('DETECTING');
    setLocationError(null);

    if (!('geolocation' in navigator) || !navigator.geolocation) {
      setGpsStatus('NOT_FOUND');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracyMeters = Math.round(position.coords.accuracy || 15);

        setGpsCoords({ lat, lng, accuracyMeters });
        setGpsStatus('FOUND');

        // Attempt reverse geocode with short timeout
        let resolvedArea = '';
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2200);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { signal: controller.signal }
          );
          clearTimeout(timer);
          if (response.ok) {
            const data = await response.json();
            const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || data.address?.city_district;
            if (road) {
              resolvedArea = `${road} (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
            } else if (data.display_name) {
              resolvedArea = data.display_name.split(',').slice(0, 2).join(', ');
            }
          }
        } catch {
          // offline or network error; fall back to coordinate label
        }

        if (!resolvedArea) {
          resolvedArea = `GPS Lock (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
        }

        setDetectedAddress(resolvedArea);
        setLocationName((prev) => {
          if (!prev || prev.trim() === '' || prev === 'Brigade Road Flat #202') {
            return `${resolvedArea}`;
          }
          return prev;
        });
      },
      (err) => {
        console.warn('GPS detection failed:', err.message);
        if (err.code === 1) {
          // Permission denied
          setGpsStatus('DENIED');
        } else {
          // Position unavailable or timeout
          setGpsStatus('NOT_FOUND');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 15000,
      }
    );
  }, []);

  // Automatically trigger location detection on mount or when switching to HELP_FORM
  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const handleImSafe = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSubmittedTime(time);
    setScreen('SAFE_CONFIRMED');
  };

  const handleSendSOS = () => {
    // If GPS was not found and user has not typed a location, ask for location
    if (gpsStatus !== 'FOUND' && (!locationName || !locationName.trim())) {
      setLocationError('⚠️ Location required: GPS was not detected. Please enter your building, street, or landmark so rescue teams can navigate to you.');
      return;
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const finalLocation = locationName.trim() || (gpsCoords ? `GPS (${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)})` : 'Disaster Zone - Address Pending');

    const reqId = createDistressSOS({
      reporterName: citizenName,
      householdId: householdId,
      locationName: finalLocation,
      coordinates: gpsCoords ? {
        lat: gpsCoords.lat,
        lng: gpsCoords.lng,
        label: finalLocation,
        accuracyMeters: gpsCoords.accuracyMeters,
      } : undefined,
      peopleCount: peopleCount,
      situations: {
        trapped: situations.trapped,
        waterRising: situations.waterRising,
        fire: situations.fire,
        heavilyInjuredCount: situations.heavilyInjured ? 1 : 0,
        seriouslyUnwellCount: situations.seriouslyUnwell ? 1 : 0,
        childrenCount: situations.children ? 1 : 0,
        disabledCount: situations.disabled ? 1 : 0,
        needRescue: situations.needRescue,
        otherNotes: situations.otherNotes,
      },
      batteryLevel: batteryLevel,
      connectivity: connectivity,
      gpsAccuracyMeters: gpsCoords?.accuracyMeters,
    });

    setSubmittedRequestId(reqId);
    setSubmittedTime(time);
    setScreen('SOS_SUBMITTED');
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#070b12] text-slate-100 flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto">
      {/* Top Bar for Citizen screen */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white tracking-wider text-sm font-mono">RESQ CITIZEN SOS</div>
            <div className="text-[10px] text-red-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              {eventInfo.name}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCitizenView(false)}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 font-mono"
        >
          &larr; Return to Control Room
        </button>
      </div>

      {/* Auto-detected telemetry bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 my-3 text-[11px] font-mono text-slate-300 flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-1 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="truncate max-w-[150px]">
            {gpsStatus === 'FOUND' && gpsCoords
              ? `GPS ±${gpsCoords.accuracyMeters}m (${gpsCoords.lat.toFixed(3)}, ${gpsCoords.lng.toFixed(3)})`
              : locationName || (gpsStatus === 'DETECTING' ? 'Detecting GPS...' : 'Location Required')}
          </span>
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <Battery className="w-3.5 h-3.5 text-emerald-400" />
          <span>{batteryLevel}%</span>
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <Wifi className="w-3.5 h-3.5 text-amber-400" />
          <span>{connectivity.replace('_', ' ')}</span>
        </span>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col justify-center py-2">
        {/* SCREEN 1: ARE YOU SAFE? - High Contrast, Large Buttons */}
        {screen === 'HOME' && (
          <div className="space-y-6 text-center">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                EMERGENCY ACCOUNTABILITY CHECK
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ARE YOU SAFE?
              </h1>
              <p className="text-sm text-slate-300 max-w-xs mx-auto pt-1">
                An earthquake was detected in your area. Please tap your current status immediately.
              </p>
            </div>

            {/* The two enormous buttons */}
            <div className="space-y-4 pt-2">
              <button
                onClick={handleImSafe}
                className="w-full py-6 sm:py-8 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all rounded-2xl shadow-xl shadow-emerald-950/50 border-2 border-emerald-400 flex flex-col items-center justify-center gap-2"
              >
                <span className="text-3xl sm:text-4xl">🟢</span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-wider">
                  I'M SAFE
                </span>
                <span className="text-xs text-emerald-100 font-medium opacity-90">
                  I am safe and do not require rescue assistance
                </span>
              </button>

              <button
                onClick={() => {
                  setScreen('HELP_FORM');
                  detectLocation();
                }}
                className="w-full py-6 sm:py-8 bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all rounded-2xl shadow-xl shadow-red-950/50 border-2 border-red-400 flex flex-col items-center justify-center gap-2"
              >
                <span className="text-3xl sm:text-4xl">🔴</span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-wider">
                  I NEED HELP
                </span>
                <span className="text-xs text-red-100 font-medium opacity-90">
                  I am trapped, injured, or in immediate danger
                </span>
              </button>
            </div>

            {/* Quick Disaster Services for Citizens */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block text-center">
                VITAL EMERGENCY TOOLS & MEDICAL SERVICES
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => {
                    setActiveTab('hospitals');
                    setIsCitizenView(false);
                  }}
                  className="p-3 bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-xl text-left transition-colors space-y-1 group"
                >
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <HeartPulse className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>HOSPITALS & BEDS</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Find nearby ICU, oxygen & trauma bays</div>
                </button>

                <button
                  onClick={() => {
                    if (hospitals.length > 0) openEmergencyBedModal(hospitals[0]);
                  }}
                  className="p-3 bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-xl text-left transition-colors space-y-1 group"
                >
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <Bed className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>EMERGENCY BED PASS</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Generate priority admission voucher</div>
                </button>

                <button
                  onClick={() => setIsMissingPersonsModalOpen(true)}
                  className="p-3 bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-colors space-y-1 group"
                >
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>MISSING PERSONS</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Search bulletins or log sightings</div>
                </button>

                <button
                  onClick={() => setIsSurvivalToolsModalOpen(true)}
                  className="p-3 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition-colors space-y-1 group"
                >
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <LifeBuoy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>SOS SIREN & FIRST AID</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Acoustic beacon & CPR cadence</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: SAFE CONFIRMED */}
        {screen === 'SAFE_CONFIRMED' && (
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                CONFIRMATION RECORDED
              </span>
              <h2 className="text-2xl font-bold text-white">Your status has been updated to SAFE.</h2>
              <p className="text-xs text-slate-300 pt-1">
                Disaster management authorities and rescue coordinators have updated your household accountability record.
              </p>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 text-xs font-mono text-left space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Citizen:</span>
                <span className="text-white font-bold">{citizenName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Household ID:</span>
                <span className="text-cyan-400">{householdId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded Timestamp:</span>
                <span className="text-white">{submittedTime} IST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Source:</span>
                <span className="text-emerald-400">Self-Confirmation</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location Tag:</span>
                <span className="text-slate-300">{locationName}</span>
              </div>
            </div>

            <button
              onClick={() => setScreen('HOME')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-sm transition-colors"
            >
              Change My Status
            </button>
          </div>
        )}

        {/* SCREEN 3: DISTRESS REQUEST FORM (Section 10) */}
        {screen === 'HELP_FORM' && (
          <div className="space-y-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScreen('HOME')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <span className="text-red-500">🚨</span> I NEED HELP
                </h2>
              </div>
              <span className="text-[11px] text-red-400 font-mono font-bold bg-red-950 px-2 py-0.5 rounded border border-red-800">
                HIGH PRIORITY SOS
              </span>
            </div>

            {/* Checkbox Situations */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Select your situation (choose all that apply):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'trapped', label: 'Trapped under rubble' },
                  { key: 'heavilyInjured', label: 'Heavily injured' },
                  { key: 'waterRising', label: 'Water rising / flooding' },
                  { key: 'fire', label: 'Fire or heavy smoke' },
                  { key: 'disabled', label: 'Physically disabled present' },
                  { key: 'children', label: 'Children or infants present' },
                  { key: 'seriouslyUnwell', label: 'Seriously unwell / medical aid' },
                  { key: 'needRescue', label: 'Immediate rescue required' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                      (situations as any)[item.key]
                        ? 'bg-red-950/80 border-red-600/80 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(situations as any)[item.key]}
                      onChange={(e) =>
                        setSituations((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-0"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stepper for number of people */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-300">
                Number of people needing help:
              </label>
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPeopleCount((c) => Math.max(1, c - 1))}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="text-xl font-bold font-mono text-white">
                  {peopleCount} {peopleCount === 1 ? 'Person' : 'People'}
                </div>
                <button
                  onClick={() => setPeopleCount((c) => c + 1)}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Location Detection & Fallback Prompt */}
            <div className="space-y-3 pt-1 text-xs">
              {/* Status Banner */}
              {gpsStatus === 'DETECTING' && (
                <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                    <div>
                      <div className="font-bold text-cyan-200">Auto-Detecting GPS Location...</div>
                      <div className="text-[11px] text-cyan-400/80 font-mono">
                        Acquiring satellite fix for accurate squad dispatch...
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGpsStatus('NOT_FOUND')}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 underline whitespace-nowrap"
                  >
                    Enter Manually
                  </button>
                </div>
              )}

              {gpsStatus === 'FOUND' && gpsCoords && (
                <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <LocateFixed className="w-4 h-4 shrink-0" />
                      <span>GPS Location Locked</span>
                      <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-1.5 py-0.5 rounded font-mono border border-emerald-700/60 ml-1">
                        ±{gpsCoords.accuracyMeters}m precision
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Re-detect GPS
                    </button>
                  </div>
                  <div className="text-slate-300 font-mono text-[11px] flex items-center gap-2 flex-wrap">
                    <span className="text-emerald-300">Fix:</span>
                    <span>{gpsCoords.lat.toFixed(5)}°N, {gpsCoords.lng.toFixed(5)}°E</span>
                    {detectedAddress && (
                      <span className="text-slate-400 truncate">• {detectedAddress}</span>
                    )}
                  </div>
                </div>
              )}

              {(gpsStatus === 'NOT_FOUND' || gpsStatus === 'DENIED') && (
                <div className="bg-rose-950/40 border border-rose-500/60 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-rose-200">
                          {gpsStatus === 'DENIED' ? 'Location Permission Denied' : 'GPS Location Not Found'}
                        </div>
                        <p className="text-rose-300/90 text-[11px] mt-0.5 leading-relaxed">
                          Satellite coordinates could not be automatically detected. <strong>Please enter your location, building, or landmark manually below</strong> so emergency rescue squads can reach you.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="shrink-0 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-800 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry GPS
                    </button>
                  </div>

                  {/* 1-tap rapid landmark picker */}
                  <div className="pt-1 border-t border-rose-900/40">
                    <span className="text-[10px] text-rose-300/80 font-mono block mb-1.5">
                      ⚡ Quick-Tap Disaster Zone Landmark:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Brigade Road Flat #202',
                        'MG Road Metro Station',
                        'Shanti Towers, 3rd Floor',
                        'Victoria Road Transit Hub',
                        'Residency Road Corridor',
                        'Shivajinagar Market Annex',
                      ].map((landmark) => (
                        <button
                          key={landmark}
                          type="button"
                          onClick={() => {
                            setLocationName(landmark);
                            setLocationError(null);
                          }}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-400 transition-colors"
                        >
                          + {landmark}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Location Input Box */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold block text-xs">
                    {gpsStatus === 'FOUND' ? 'Location & Floor / Flat Details:' : 'Your Location / Building / Landmark:'}
                    {gpsStatus !== 'FOUND' && (
                      <span className="text-rose-400 ml-1 font-mono text-[11px]">* Required for Dispatch</span>
                    )}
                  </label>
                  {gpsStatus === 'FOUND' && (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="w-3 h-3" /> GPS Coordinates Attached
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => {
                    setLocationName(e.target.value);
                    if (e.target.value.trim()) setLocationError(null);
                  }}
                  className={`w-full bg-slate-950 border rounded-lg p-2.5 text-xs text-white focus:outline-none transition-colors ${
                    locationError
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : gpsStatus !== 'FOUND' && !locationName.trim()
                      ? 'border-amber-500/80 focus:border-amber-400 placeholder:text-amber-500/50'
                      : 'border-slate-800 focus:border-red-500'
                  }`}
                  placeholder={
                    gpsStatus === 'FOUND'
                      ? 'e.g. 3rd Floor Apt 304, rear staircase'
                      : 'e.g. Brigade Road, Shanti Towers Flat #202 (Please specify location)'
                  }
                />

                {locationError && (
                  <div className="text-rose-400 text-[11px] font-mono flex items-center gap-1.5 mt-1.5 bg-rose-950/50 p-2 rounded border border-rose-800/60">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{locationError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Short Message (Optional):</label>
                <textarea
                  rows={2}
                  value={situations.otherNotes}
                  onChange={(e) => setSituations((prev) => ({ ...prev, otherNotes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  placeholder="e.g. Door jammed from outside, infant needs formula."
                />
              </div>
            </div>

            {/* Auto-attached Telemetry Info Card */}
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
              <div className="text-slate-300 font-bold flex items-center justify-between">
                <span>AUTOMATICALLY ATTACHED TELEMETRY:</span>
                {gpsStatus === 'FOUND' && gpsCoords ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[9px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    GPS LOCKED
                  </span>
                ) : gpsStatus === 'DETECTING' ? (
                  <span className="text-cyan-400 flex items-center gap-1 font-mono text-[9px] bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    ACQUIRING FIX
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1 font-mono text-[9px] bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800/60">
                    MANUAL ADDRESS DISPATCH
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1 text-slate-400">
                <span className={gpsStatus === 'FOUND' ? 'text-emerald-300 col-span-2' : gpsStatus === 'DETECTING' ? 'text-cyan-300 col-span-2' : 'text-amber-300 col-span-2'}>
                  📍 GPS:{' '}
                  {gpsStatus === 'FOUND' && gpsCoords
                    ? `±${gpsCoords.accuracyMeters}m (${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}) - LIVE FIX`
                    : gpsStatus === 'DETECTING'
                    ? 'Scanning satellite fix...'
                    : 'Not Found (Manual Location Attached)'}
                </span>
                <span>🕒 Time: Real-time sync</span>
                <span>👤 ID: {householdId}</span>
                <span>🔋 Battery: {batteryLevel}%</span>
                <span>📶 Network: {connectivity.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Big Send SOS Button */}
            <button
              onClick={handleSendSOS}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-lg tracking-wider shadow-lg shadow-red-950 transition-all flex items-center justify-center gap-2 border border-red-400 active:scale-[0.99]"
            >
              <Radio className="w-5 h-5 animate-pulse" />
              <span>SEND SOS NOW</span>
            </button>
          </div>
        )}

        {/* SCREEN 4: SOS RECEIVED */}
        {screen === 'SOS_SUBMITTED' && (
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-red-600/20 border-2 border-red-500 text-red-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Radio className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                🔴 SOS RECEIVED
              </span>
              <h2 className="text-2xl font-bold text-white">Rescue coordination has received your request.</h2>
              <p className="text-xs text-slate-300 pt-1">
                Your emergency signal has been queued into the priority dispatch engine. Stay calm and conserve battery.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">REQUEST ID:</span>
                <span className="text-red-400 font-bold text-base font-mono">#{submittedRequestId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time Registered:</span>
                <span className="text-white">{submittedTime} IST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Occupants Count:</span>
                <span className="text-white">{peopleCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-white truncate max-w-[170px]">{locationName}</span>
              </div>
              {gpsCoords && (
                <div className="flex justify-between">
                  <span className="text-slate-400">GPS Coordinates:</span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    {gpsCoords.lat.toFixed(5)}°N, {gpsCoords.lng.toFixed(5)}°E (±{gpsCoords.accuracyMeters}m)
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Network Transport:</span>
                <span className="text-cyan-400">{connectivity.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-left text-xs text-amber-300">
              <strong>Critical Guidance:</strong> Keep your phone powered on but refrain from video calls or high-drain apps. If network drops, your signal will opportunistically relay via nearby devices.
            </div>

            <button
              onClick={() => setScreen('HOME')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-colors"
            >
              Update or Cancel Request
            </button>
          </div>
        )}
      </div>

      {/* Bottom: Section 11 Offline SOS / Mesh Concept Explainer & Disclaimer */}
      <div className="pt-3 border-t border-slate-800/80">
        <button
          onClick={() => setShowMeshExplainer(!showMeshExplainer)}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1 font-mono"
        >
          <span className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>HOW OFFLINE SOS MESH WORKS</span>
          </span>
          <span className="text-[11px] text-cyan-400">{showMeshExplainer ? 'Hide ▲' : 'Learn More ▼'}</span>
        </button>

        {showMeshExplainer && (
          <div className="mt-2 bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-xs space-y-2.5 font-mono">
            <div className="text-[11px] font-bold text-cyan-300">OFFLINE MESH RELAY ARCHITECTURE:</div>
            {/* Visual Diagram */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/90 text-center space-y-1 text-[11px] text-slate-300">
              <div className="text-red-400 font-bold">📱 PHONE A (YOUR SOS CREATED)</div>
              <div className="text-slate-500">↓</div>
              <div className="text-amber-400">💾 STORED LOCALLY IN ENCRYPTED CACHE</div>
              <div className="text-slate-500">↓ (Bluetooth / WiFi Direct)</div>
              <div className="text-cyan-400">📱 PHONE B NEARBY (OPPORTUNISTIC RELAY)</div>
              <div className="text-slate-500">↓ (When Cell Signal Available)</div>
              <div className="text-emerald-400">🌐 CLOUD RESQ SERVER</div>
              <div className="text-slate-500">↓</div>
              <div className="text-white font-bold">🏢 EMERGENCY CONTROL ROOM</div>
            </div>

            {/* Crucial Required Disclaimers */}
            <div className="space-y-1 text-[10px] text-slate-400 font-sans leading-relaxed border-t border-slate-800 pt-2">
              <p className="text-amber-300 font-medium">
                ⚠️ <strong>Opportunistic relay only:</strong> Delivery is not guaranteed. Packet hops depend on neighboring devices being within radio range.
              </p>
              <p className="italic text-slate-400">
                “If a person is alone, their phone is inaccessible, there is no cellular network, and no nearby relay device is available, the system cannot communicate with them.”
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
