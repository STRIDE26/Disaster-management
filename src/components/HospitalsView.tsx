import React, { useState, useMemo } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { Hospital, HospitalType } from '../types';
import {
  Building2,
  HeartPulse,
  Activity,
  Bed,
  Clock,
  Navigation,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  ShieldAlert,
  Wind,
  Droplet,
  Zap,
  ArrowRight,
  ExternalLink,
  Info,
  Layers,
  MapPin,
  Ambulance,
  Sparkles,
  Plane,
  Users,
  LifeBuoy,
} from 'lucide-react';

export const HospitalsView: React.FC = () => {
  const {
    hospitals,
    selectedHospital,
    setSelectedHospital,
    updateHospitalBeds,
    setActiveTab,
    currentUserRole,
    setIsAuthModalOpen,
    openEmergencyBedModal,
    setIsMissingPersonsModalOpen,
    setIsBloodBankModalOpen,
    setIsSurvivalToolsModalOpen,
    bedAllocations,
  } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DISTANCE' | 'BAI' | 'WAIT_TIME'>('BAI');
  const [reservationNotice, setReservationNotice] = useState<string | null>(null);

  // Overall aggregate metrics
  const stats = useMemo(() => {
    let totalBeds = 0;
    let availableBeds = 0;
    let totalICU = 0;
    let availableICU = 0;
    let totalVent = 0;
    let availableVent = 0;
    let shortestWait = 999;

    hospitals.forEach((h) => {
      totalBeds += h.beds.total;
      availableBeds += h.beds.available;
      totalICU += h.beds.icuTotal;
      availableICU += h.beds.icuAvailable;
      totalVent += h.beds.ventilatorTotal;
      availableVent += h.beds.ventilatorAvailable;
      if (h.estimatedWaitMinutes < shortestWait) {
        shortestWait = h.estimatedWaitMinutes;
      }
    });

    const avgBAI = Math.round(
      hospitals.reduce((acc, h) => acc + h.bedAvailabilityIndex, 0) / hospitals.length
    );

    return {
      totalBeds,
      availableBeds,
      totalICU,
      availableICU,
      totalVent,
      availableVent,
      shortestWait: shortestWait === 999 ? 0 : shortestWait,
      avgBAI,
    };
  }, [hospitals]);

  // Filtered and sorted hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals
      .filter((h) => {
        const matchesSearch =
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        if (filterType === 'ICU_ONLY') return h.beds.icuAvailable > 0;
        if (filterType === 'VENTILATOR_ONLY') return h.beds.ventilatorAvailable > 0;
        if (filterType === 'TRAUMA_LEVEL_1') return h.type === 'TRAUMA_CENTER_LEVEL_1';
        if (filterType === 'SHORT_WAIT') return h.estimatedWaitMinutes <= 15;
        if (filterType === 'CLEAR_ROUTE') return h.routeCondition === 'CLEAR_ACCESS';

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'DISTANCE') return a.distanceKm - b.distanceKm;
        if (sortBy === 'WAIT_TIME') return a.estimatedWaitMinutes - b.estimatedWaitMinutes;
        return b.bedAvailabilityIndex - a.bedAvailabilityIndex; // Default BAI descending
      });
  }, [hospitals, searchQuery, filterType, sortBy]);

  // Handle Bed Allocation: Open Interactive Triage & Voucher Allocation Modal
  const handleReserveBed = (hospital: Hospital) => {
    openEmergencyBedModal(hospital);
  };

  const getBAIBadge = (index: number) => {
    if (index >= 75) {
      return {
        label: 'High Capacity Available',
        bg: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300',
        dot: 'bg-emerald-400',
      };
    }
    if (index >= 45) {
      return {
        label: 'Moderate Load',
        bg: 'bg-amber-950/80 border-amber-500/60 text-amber-300',
        dot: 'bg-amber-400',
      };
    }
    return {
      label: 'Critical / Near Capacity',
      bg: 'bg-red-950/80 border-red-500/60 text-red-300',
      dot: 'bg-red-500 animate-pulse',
    };
  };

  const getRouteBadge = (condition: Hospital['routeCondition']) => {
    switch (condition) {
      case 'CLEAR_ACCESS':
        return {
          label: 'Direct Clear Route',
          color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
        };
      case 'CAUTION_DEBRIS':
        return {
          label: 'Caution: Debris Nearby',
          color: 'text-amber-400 bg-amber-950/60 border-amber-800',
        };
      case 'DETOUR_REQUIRED':
        return {
          label: 'Detour Required (Flooded/Blocked)',
          color: 'text-red-400 bg-red-950/60 border-red-800',
        };
    }
  };

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg">
              <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Emergency Hospitals & Trauma Care Directory
              </h1>
              <p className="text-xs text-slate-400">
                Live Bed Availability Index (BAI), Clinical Wait Times, Oxygen & Blood Bank Reserves
              </p>
            </div>
          </div>
        </div>

        {/* Global Action & Role Indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            onClick={() => setIsAuthModalOpen(true)}
            className="cursor-pointer flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-mono hover:border-cyan-500 transition-colors"
            title="Click to change role"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">ROLE:</span>
            <span className="text-white font-bold">
              {currentUserRole === 'ADMINISTRATOR' || currentUserRole === 'CONTROL_ROOM_OPERATOR'
                ? 'ADMIN COMMAND'
                : currentUserRole === 'FAMILY_MEMBER'
                ? 'REGISTERED FAMILY'
                : 'CITIZEN'}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors"
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>VIEW ON LIVE MAP</span>
          </button>
        </div>
      </div>

      {/* Emergency Disaster Management Quick Actions Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => openEmergencyBedModal(hospitals[0])}
          className="p-3 bg-gradient-to-r from-rose-950/70 to-rose-900/40 border border-rose-500/50 hover:border-rose-400 rounded-xl text-left transition-all group flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 font-mono">
              <Bed className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>ALLOCATE BED</span>
            </div>
            <div className="text-[11px] text-slate-400">Issue Triage Pass ({bedAllocations.length} Active)</div>
          </div>
          <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">
            + NEW
          </span>
        </button>

        <button
          onClick={() => setIsMissingPersonsModalOpen(true)}
          className="p-3 bg-gradient-to-r from-amber-950/70 to-amber-900/40 border border-amber-500/50 hover:border-amber-400 rounded-xl text-left transition-all group flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-mono">
              <Users className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>MISSING PERSONS</span>
            </div>
            <div className="text-[11px] text-slate-400">Search & Sightings Registry</div>
          </div>
          <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
            TRACE
          </span>
        </button>

        <button
          onClick={() => setIsBloodBankModalOpen(true)}
          className="p-3 bg-gradient-to-r from-red-950/70 to-red-900/40 border border-red-500/50 hover:border-red-400 rounded-xl text-left transition-all group flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-300 font-mono">
              <Plane className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <span>DRONE BLOOD TRANSIT</span>
            </div>
            <div className="text-[11px] text-slate-400">Air Express Transfusion Units</div>
          </div>
          <span className="text-[10px] font-mono bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded">
            FLY
          </span>
        </button>

        <button
          onClick={() => setIsSurvivalToolsModalOpen(true)}
          className="p-3 bg-gradient-to-r from-cyan-950/70 to-cyan-900/40 border border-cyan-500/50 hover:border-cyan-400 rounded-xl text-left transition-all group flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 font-mono">
              <LifeBuoy className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>SURVIVAL & SIREN</span>
            </div>
            <div className="text-[11px] text-slate-400">Audio Beacon, CPR, Hotlines</div>
          </div>
          <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
            SOS
          </span>
        </button>
      </div>

      {/* Reservation Notification Banner */}
      {reservationNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{reservationNotice}</span>
          </div>
          <button
            onClick={() => setReservationNotice(null)}
            className="text-xs font-mono underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-blue-400" />
            Available Beds
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-white font-mono">{stats.availableBeds}</span>
            <span className="text-xs text-slate-500 font-mono">/ {stats.totalBeds}</span>
          </div>
          <div className="text-[10px] text-blue-400 font-mono mt-0.5">
            {Math.round((stats.availableBeds / stats.totalBeds) * 100)}% Available
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            ICU Beds
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-rose-400 font-mono">{stats.availableICU}</span>
            <span className="text-xs text-slate-500 font-mono">/ {stats.totalICU}</span>
          </div>
          <div className="text-[10px] text-rose-300 font-mono mt-0.5">
            Critical Care Capacity
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            Ventilators Ready
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-cyan-400 font-mono">{stats.availableVent}</span>
            <span className="text-xs text-slate-500 font-mono">/ {stats.totalVent}</span>
          </div>
          <div className="text-[10px] text-cyan-300 font-mono mt-0.5">
            Life Support Systems
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Fastest Wait Time
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-amber-300 font-mono">{stats.shortestWait}m</span>
          </div>
          <div className="text-[10px] text-amber-400 font-mono mt-0.5">
            At Manipal Trauma
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Avg. Bed Index
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-emerald-400 font-mono">{stats.avgBAI}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="text-[10px] text-emerald-300 font-mono mt-0.5">
            Citywide Preparedness
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Ambulance className="w-3.5 h-3.5 text-purple-400" />
            Ambulance Hotline
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold text-purple-300 font-mono">108</span>
            <span className="text-[10px] text-slate-400">Emergency</span>
          </div>
          <div className="text-[10px] text-purple-300 font-mono mt-0.5">
            Dedicated Dispatch
          </div>
        </div>
      </div>

      {/* 3. Search, Filter & Sort Controls */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospitals by name, locality (e.g. Fort, HAL, Shivaji Nagar), or specialty..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              <option value="BAI">Bed Availability Index (Highest First)</option>
              <option value="WAIT_TIME">Shortest Emergency Wait Time</option>
              <option value="DISTANCE">Closest Distance</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 text-[11px] shrink-0 font-medium">Filter by:</span>
          {[
            { id: 'ALL', label: 'All Facilities' },
            { id: 'ICU_ONLY', label: 'ICU Beds Available' },
            { id: 'VENTILATOR_ONLY', label: 'Ventilators Available' },
            { id: 'TRAUMA_LEVEL_1', label: 'Level 1 Trauma Centers' },
            { id: 'SHORT_WAIT', label: 'Wait Time ≤ 15 mins' },
            { id: 'CLEAR_ROUTE', label: 'Clear Route Access' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === item.id
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Hospital Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredHospitals.map((hospital) => {
          const baiBadge = getBAIBadge(hospital.bedAvailabilityIndex);
          const routeBadge = getRouteBadge(hospital.routeCondition);

          return (
            <div
              key={hospital.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all shadow-md"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-white">{hospital.name}</h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {hospital.distanceKm} km away
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {hospital.location}
                    </p>
                  </div>

                  {/* Bed Availability Index Score Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-right shrink-0 ${baiBadge.bg}`}
                    title="Bed Availability Index (0-100)"
                  >
                    <div className="text-[10px] uppercase font-mono tracking-wider font-semibold opacity-80">
                      Bed Index
                    </div>
                    <div className="text-lg font-extrabold font-mono leading-none flex items-center justify-end gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${baiBadge.dot}`}></span>
                      <span>{hospital.bedAvailabilityIndex}/100</span>
                    </div>
                  </div>
                </div>

                {/* Status & Clinical Wait Time Reason */}
                <div className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-slate-300 font-medium">Estimated Wait Time:</span>
                      <span className="font-bold text-amber-300 font-mono text-sm">
                        {hospital.estimatedWaitMinutes} mins
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({hospital.triageBacklogCount} in triage)
                      </span>
                    </div>

                    <div className="text-[11px] text-purple-300 font-mono flex items-center gap-1">
                      <Ambulance className="w-3.5 h-3.5" />
                      <span>{hospital.incomingAmbulancesCount} ambulances inbound</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-2 rounded border border-slate-800/60">
                    <span className="text-amber-400 font-semibold font-mono">Triage Reason: </span>
                    {hospital.waitTimeReason}
                  </p>
                </div>

                {/* Beds Breakdown Grid */}
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded">
                    <div className="text-[10px] text-slate-400 font-sans">Total Avail.</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {hospital.beds.available}{' '}
                      <span className="text-[10px] text-slate-500">/ {hospital.beds.total}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded">
                    <div className="text-[10px] text-slate-400 font-sans">ICU Beds</div>
                    <div className="text-sm font-bold text-rose-400 mt-0.5">
                      {hospital.beds.icuAvailable}{' '}
                      <span className="text-[10px] text-slate-500">/ {hospital.beds.icuTotal}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded">
                    <div className="text-[10px] text-slate-400 font-sans">Ventilators</div>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5">
                      {hospital.beds.ventilatorAvailable}{' '}
                      <span className="text-[10px] text-slate-500">
                        / {hospital.beds.ventilatorTotal}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded col-span-3 sm:col-span-1">
                    <div className="text-[10px] text-slate-400 font-sans">Trauma Bays</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {hospital.beds.traumaEmergencyBedsAvailable} Ready
                    </div>
                  </div>
                </div>

                {/* Important Infrastructure Supplies: Blood Bank, Oxygen, Power, Route */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  {/* Blood Bank */}
                  <div className="bg-slate-950/50 border border-slate-800 p-2 rounded">
                    <div className="text-slate-400 flex items-center gap-1 font-sans text-[10px]">
                      <Droplet className="w-3 h-3 text-red-400" />
                      Blood Bank
                    </div>
                    <div className="mt-1 text-slate-200">
                      O- Neg:{' '}
                      <span
                        className={
                          hospital.bloodBank.oNegative === 'ADEQUATE'
                            ? 'text-emerald-400 font-bold'
                            : hospital.bloodBank.oNegative === 'LOW'
                            ? 'text-amber-400 font-bold'
                            : 'text-red-400 font-bold'
                        }
                      >
                        {hospital.bloodBank.oNegative}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {hospital.bloodBank.plasmaUnits} units plasma
                    </div>
                  </div>

                  {/* Oxygen Reserves */}
                  <div className="bg-slate-950/50 border border-slate-800 p-2 rounded">
                    <div className="text-slate-400 flex items-center gap-1 font-sans text-[10px]">
                      <Wind className="w-3 h-3 text-cyan-400" />
                      Oxygen Supply
                    </div>
                    <div className="mt-1 text-cyan-300 font-bold">
                      {hospital.oxygenReserveHours} Hours
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Uninterrupted</div>
                  </div>

                  {/* Power Backup */}
                  <div className="bg-slate-950/50 border border-slate-800 p-2 rounded">
                    <div className="text-slate-400 flex items-center gap-1 font-sans text-[10px]">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Power Grid
                    </div>
                    <div className="mt-1 text-slate-200 truncate">
                      {hospital.powerBackupStatus === 'GENERATOR_BACKUP_ONLINE'
                        ? 'Gen. Active'
                        : 'Grid Primary'}
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">100% Online</div>
                  </div>

                  {/* Route Status */}
                  <div className="bg-slate-950/50 border border-slate-800 p-2 rounded">
                    <div className="text-slate-400 flex items-center gap-1 font-sans text-[10px]">
                      <Navigation className="w-3 h-3 text-blue-400" />
                      Corridor Access
                    </div>
                    <div className={`mt-1 font-bold text-[10px] ${routeBadge.color} truncate`}>
                      {routeBadge.label}
                    </div>
                  </div>
                </div>

                {/* Specialties Tags */}
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Specialties:</span>
                  {hospital.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Direct Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${hospital.ambulanceHotline.replace(/[^0-9]/g, '')}`}
                    className="flex items-center gap-1 text-xs text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 px-2.5 py-1.5 rounded-lg transition-colors font-mono"
                    title="Call Emergency Hotline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{hospital.ambulanceHotline}</span>
                  </a>

                  <button
                    onClick={() => {
                      setSelectedHospital(hospital);
                      setActiveTab('map');
                    }}
                    className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors"
                    title="View Hospital on Live GIS Map"
                  >
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Map Pin</span>
                  </button>
                </div>

                <button
                  onClick={() => handleReserveBed(hospital)}
                  disabled={hospital.beds.available <= 0}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs font-mono transition-all active:scale-95 shadow-md shadow-rose-950/80"
                >
                  <Bed className="w-3.5 h-3.5" />
                  <span>ALLOCATE EMERGENCY BED</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-slate-400 space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-200">No medical facilities match your criteria</p>
          <p className="text-xs">Try resetting your search query or loosening the specialty/wait-time filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('ALL');
            }}
            className="mt-2 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1.5 rounded font-mono"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
