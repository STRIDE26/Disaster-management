import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Tent,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  Phone,
  User,
  Plus,
  ArrowRight,
  Shield,
  Search,
  X,
  Droplet,
  Utensils,
  Zap,
  HeartPulse,
  Package,
  Bed,
  ExternalLink,
  ShieldCheck,
  Send,
  Building,
  RefreshCw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { matchesIdOrText } from '../utils/searchUtils';
import { DormCategory } from '../types';

export const SheltersView: React.FC = () => {
  const {
    shelters,
    people,
    checkInPersonToShelter,
    globalSearchQuery,
    currentUserRole,
    selectedShelterAdminId,
    setSelectedShelterAdminId,
    updateShelterAccommodation,
    requestShelterSupply,
    setIsAuthModalOpen,
  } = useDisaster();

  const [search, setSearch] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [personIdToCheckIn, setPersonIdToCheckIn] = useState<string>('');
  const [activeAdminShelterId, setActiveAdminShelterId] = useState<string>(
    selectedShelterAdminId || 'SH-12'
  );

  // Shelter Warden Admin Form States
  const [intakeName, setIntakeName] = useState('');
  const [intakeAge, setIntakeAge] = useState('32');
  const [intakeMembersCount, setIntakeMembersCount] = useState('1');
  const [intakeCategory, setIntakeCategory] = useState<'maleDorms' | 'femaleDorms' | 'familyRooms' | 'specialNeeds'>('familyRooms');
  const [intakeMedical, setIntakeMedical] = useState('');
  const [supplyRequestStatus, setSupplyRequestStatus] = useState<string | null>(null);

  const activeQuery = search.trim() || globalSearchQuery.trim();

  const filteredShelters = shelters.filter((s) => {
    if (activeQuery) {
      return (
        matchesIdOrText(s.id, activeQuery) ||
        matchesIdOrText(s.name, activeQuery) ||
        matchesIdOrText(s.location, activeQuery)
      );
    }
    return true;
  });

  const unaccountedPeople = people.filter((p) => p.status === 'UNACCOUNTED');

  const handleCheckIn = (shelterId: string) => {
    if (!personIdToCheckIn) return;
    checkInPersonToShelter(personIdToCheckIn, shelterId);
    setSuccessMessage(`Person #${personIdToCheckIn} verified and checked into shelter #${shelterId}!`);
    setPersonIdToCheckIn('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const currentAdminShelter = shelters.find((s) => s.id === activeAdminShelterId) || shelters[0];

  // Adjust beds for a dorm category in active admin shelter
  const handleBedAdjustment = (categoryKey: 'maleDorms' | 'femaleDorms' | 'familyRooms' | 'specialNeeds', delta: number) => {
    if (!currentAdminShelter?.accommodation) return;
    const cat = currentAdminShelter.accommodation[categoryKey];
    const newOccupied = Math.max(0, Math.min(cat.total, cat.occupied + delta));
    const newAvailable = Math.max(0, cat.total - newOccupied);

    const updatedCat: DormCategory = {
      ...cat,
      occupied: newOccupied,
      available: newAvailable,
      status: newAvailable === 0 ? 'FULL' : newAvailable <= 5 ? 'LIMITED' : 'AVAILABLE',
    };

    const newAccom = {
      ...currentAdminShelter.accommodation,
      [categoryKey]: updatedCat,
    };

    const totalOccupied =
      newAccom.maleDorms.occupied +
      newAccom.femaleDorms.occupied +
      newAccom.familyRooms.occupied +
      newAccom.specialNeeds.occupied;
    const totalAvailable = Math.max(0, currentAdminShelter.capacity - totalOccupied);

    updateShelterAccommodation(currentAdminShelter.id, {
      currentOccupancy: totalOccupied,
      availableBeds: totalAvailable,
      status: totalAvailable === 0 ? 'FULL' : totalAvailable <= 50 ? 'NEAR_CAPACITY' : 'OPEN',
      accommodationUpdates: newAccom,
    });

    setSuccessMessage(`Shelter bed update applied: ${categoryKey} is now ${newOccupied}/${cat.total} occupied.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Submit fast intake from warden portal
  const handleFastIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeName.trim()) return;

    const count = parseInt(intakeMembersCount) || 1;
    handleBedAdjustment(intakeCategory, count);

    setSuccessMessage(`Intake registered: ${intakeName} (+${count - 1} relatives) assigned to ${intakeCategory} at ${currentAdminShelter.name}!`);
    setIntakeName('');
    setIntakeMedical('');
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  const handleQuickSupplyDispatch = (type: 'WATER' | 'FOOD' | 'BLANKETS' | 'MEDICAL', quantity: string) => {
    requestShelterSupply(currentAdminShelter.id, type, quantity);
    setSupplyRequestStatus(`Municipal dispatch confirmed: ${quantity} ${type} routed to ${currentAdminShelter.name}. Transit ETA ~15 mins.`);
    setTimeout(() => setSupplyRequestStatus(null), 5000);
  };

  const isShelterAdminRole =
    currentUserRole === 'SHELTER_STAFF' ||
    currentUserRole === 'ADMINISTRATOR' ||
    currentUserRole === 'CONTROL_ROOM_OPERATOR';

  return (
    <div className="space-y-5 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Tent className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white font-mono">
              SHELTER ADMINISTRATION & LIVE ACCOMMODATION HUBS
            </h2>
            {isShelterAdminRole && (
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                WARDEN PORTAL ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time dormitory occupancy, gender-segregated dorms, humanitarian supply buffers, and Google Maps integration.
          </p>
        </div>

        {/* Search & Role Switch Helper */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search shelter #ID (e.g. SH-12)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs rounded-lg pl-8 pr-7 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 w-56"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs font-mono transition-all shadow-md active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isShelterAdminRole ? 'Switch Warden Portal' : 'Shelter Admin Login'}</span>
          </button>
        </div>
      </div>

      {/* Global Alerts / Success Banners */}
      {successMessage && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500 rounded-xl text-xs font-mono text-emerald-300 flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="underline text-[11px] text-emerald-400">
            Dismiss
          </button>
        </div>
      )}

      {supplyRequestStatus && (
        <div className="p-3 bg-amber-950/90 border border-amber-500 rounded-xl text-xs font-mono text-amber-200 flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{supplyRequestStatus}</span>
          </div>
          <button onClick={() => setSupplyRequestStatus(null)} className="underline text-[11px] text-amber-300">
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHELTER ADMINISTRATION & WARDEN CONSOLE (Dedicated Portal Section) */}
      {/* ========================================================================= */}
      {isShelterAdminRole && currentAdminShelter && (
        <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-[#0c1322] border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white font-mono">
                  SHELTER WARDEN ADMINISTRATION CONSOLE
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700">
                  Officer Duty: #{currentAdminShelter.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Authorized intake operations for <strong className="text-white">{currentAdminShelter.name}</strong> • Manager: {currentAdminShelter.contactPerson} ({currentAdminShelter.phone})
              </p>
            </div>

            {/* Select shelter to administer */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Select Shelter:</span>
              <select
                value={activeAdminShelterId}
                onChange={(e) => {
                  setActiveAdminShelterId(e.target.value);
                  setSelectedShelterAdminId(e.target.value);
                }}
                className="bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-amber-200 font-mono focus:outline-none"
              >
                {shelters.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.id} - {s.name} ({s.availableBeds} beds avail)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dormitory Live Bed Adjustment Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-amber-400" />
                Live Dormitory Category Allocation & Occupancy Controls
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                Overall Available: <strong className="text-emerald-400">{currentAdminShelter.availableBeds}</strong> / {currentAdminShelter.capacity} Beds
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  key: 'maleDorms' as const,
                  label: 'Male Dormitory',
                  color: 'text-cyan-400',
                  border: 'border-cyan-800/60',
                  data: currentAdminShelter.accommodation?.maleDorms,
                },
                {
                  key: 'femaleDorms' as const,
                  label: 'Female Dormitory',
                  color: 'text-purple-400',
                  border: 'border-purple-800/60',
                  data: currentAdminShelter.accommodation?.femaleDorms,
                },
                {
                  key: 'familyRooms' as const,
                  label: 'Family Pods',
                  color: 'text-emerald-400',
                  border: 'border-emerald-800/60',
                  data: currentAdminShelter.accommodation?.familyRooms,
                },
                {
                  key: 'specialNeeds' as const,
                  label: 'Senior & Medical Needs',
                  color: 'text-rose-400',
                  border: 'border-rose-800/60',
                  data: currentAdminShelter.accommodation?.specialNeeds,
                },
              ].map((dorm) => {
                const dormData = dorm.data || { total: 100, occupied: 50, available: 50, status: 'AVAILABLE' };
                const pct = Math.round((dormData.occupied / dormData.total) * 100);

                return (
                  <div
                    key={dorm.key}
                    className={`bg-slate-950/80 border ${dorm.border} p-3 rounded-xl space-y-2 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold font-mono ${dorm.color}`}>{dorm.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">
                          {dormData.status}
                        </span>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between font-mono">
                        <span className="text-xl font-extrabold text-white">{dormData.available}</span>
                        <span className="text-xs text-slate-400">
                          / {dormData.total} beds ({dormData.occupied} occ)
                        </span>
                      </div>

                      {/* Mini Bar */}
                      <div className="h-1.5 w-full bg-slate-900 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick +1 / -1 Buttons */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-xs font-mono">
                      <span className="text-[10px] text-slate-500">Quick Adjust:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleBedAdjustment(dorm.key, -1)}
                          disabled={dormData.occupied <= 0}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded text-[11px] font-bold"
                          title="Release 1 bed"
                        >
                          -1 Free
                        </button>
                        <button
                          onClick={() => handleBedAdjustment(dorm.key, 1)}
                          disabled={dormData.available <= 0}
                          className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-slate-950 rounded text-[11px] font-bold"
                          title="Occupy 1 bed"
                        >
                          +1 Intake
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Intake Form & Supply Replenishment in 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
            {/* 1. Fast Evacuee Intake Form */}
            <form
              onSubmit={handleFastIntakeSubmit}
              className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2.5 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Direct Evacuee Intake Registration
                </span>
                <span className="text-[10px] text-slate-400">Target: {currentAdminShelter.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Evacuee / Family Head Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={intakeName}
                    onChange={(e) => setIntakeName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Age & Relatives Count</label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="number"
                      value={intakeAge}
                      onChange={(e) => setIntakeAge(e.target.value)}
                      placeholder="Age"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:outline-none"
                    />
                    <select
                      value={intakeMembersCount}
                      onChange={(e) => setIntakeMembersCount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-1 text-white text-xs focus:outline-none"
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 People</option>
                      <option value="3">3 People</option>
                      <option value="4">4 People</option>
                      <option value="5">5+ People</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Assign Dormitory Category</label>
                  <select
                    value={intakeCategory}
                    onChange={(e) => setIntakeCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="familyRooms">Family Pods</option>
                    <option value="maleDorms">Male Dormitory</option>
                    <option value="femaleDorms">Female Dormitory</option>
                    <option value="specialNeeds">Senior / Special Medical Care</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Medical Needs (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Diag: Asthma, Senior"
                    value={intakeMedical}
                    onChange={(e) => setIntakeMedical(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 rounded transition-all flex items-center justify-center gap-1 text-xs"
              >
                <span>CONFIRM ADMISSION & ALLOCATE BED</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* 2. Humanitarian Supply Emergency Dispatch Requests */}
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  Emergency Municipal Logistics Dispatch
                </span>
                <span className="text-[10px] text-slate-400">Direct Route to HQ</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSupplyDispatch('WATER', '5,000 Liters')}
                  className="p-2.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/70 text-left transition-colors flex items-start gap-2"
                >
                  <Droplet className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-cyan-200">5,000L Water Tanker</div>
                    <div className="text-[10px] text-cyan-400/80">Dispatches BWSSB Mobile Tanker</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSupplyDispatch('FOOD', '500 Ration Crates')}
                  className="p-2.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/70 text-left transition-colors flex items-start gap-2"
                >
                  <Utensils className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-200">500 Meal Packs</div>
                    <div className="text-[10px] text-emerald-400/80">Ready-to-eat dry ration boxes</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSupplyDispatch('BLANKETS', '200 Warm Cots & Bundles')}
                  className="p-2.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/70 text-left transition-colors flex items-start gap-2"
                >
                  <Bed className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-purple-200">200 Cots & Blankets</div>
                    <div className="text-[10px] text-purple-400/80">Thermal foil & folded cots</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSupplyDispatch('MEDICAL', 'Emergency Doctor Unit')}
                  className="p-2.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/70 text-left transition-colors flex items-start gap-2"
                >
                  <HeartPulse className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-200">Mobile Medical Van</div>
                    <div className="text-[10px] text-rose-400/80">Trauma paramedic & first aid</div>
                  </div>
                </button>
              </div>

              {/* Status Selector */}
              <div className="pt-1.5 flex items-center justify-between border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400">Shelter Intake Status:</span>
                <div className="flex gap-1.5">
                  {(['OPEN', 'NEAR_CAPACITY', 'FULL'] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() =>
                        updateShelterAccommodation(currentAdminShelter.id, {
                          status: st,
                        })
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all ${
                        currentAdminShelter.status === st
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHELTER CARDS & DETAILED LIVE ACCOMMODATION MATRIX */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredShelters.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
            No shelters matching &ldquo;{activeQuery}&rdquo;.
          </div>
        ) : (
          filteredShelters.map((shelter) => {
            const occupancyRate = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
            const isFull = shelter.status === 'FULL' || shelter.availableBeds === 0;
            const accom = shelter.accommodation;

            // Google Maps links
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${shelter.coordinates.lat},${shelter.coordinates.lng}`;
            const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shelter.coordinates.lat},${shelter.coordinates.lng}`;

            return (
              <div
                key={shelter.id}
                className="bg-[#0c1322] border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                        #{shelter.id}
                      </span>
                      <h3 className="font-bold text-white text-base">{shelter.name}</h3>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{shelter.location}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-cyan-400 font-mono font-semibold">
                        {shelter.distanceKm} km from Center
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        shelter.status === 'OPEN'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : shelter.status === 'NEAR_CAPACITY'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {shelter.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      GPS: {shelter.coordinates.lat.toFixed(4)}, {shelter.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Overall Occupancy Bar */}
                <div className="space-y-1.5 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Bed Occupancy:</span>
                    <span className="text-white font-bold">
                      {shelter.currentOccupancy} / {shelter.capacity} ({occupancyRate}%)
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyRate > 90
                          ? 'bg-red-500'
                          : occupancyRate > 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div>
                      <span className="text-slate-500 text-[10px] block">TOTAL BEDS</span>
                      <strong className="text-white text-sm">{shelter.capacity}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">OCCUPIED</span>
                      <strong className="text-amber-400 text-sm">{shelter.currentOccupancy}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">AVAILABLE</span>
                      <strong className="text-emerald-400 text-sm">{shelter.availableBeds}</strong>
                    </div>
                  </div>
                </div>

                {/* DETAILED DORMITORY BREAKDOWN (LIVE ACCOMMODATION) */}
                {accom && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      LIVE DORMITORY AVAILABILITY & GENDER CATEGORIES:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-slate-950 border border-cyan-900/40">
                        <div className="text-[10px] text-cyan-400">MALE DORMS</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {accom.maleDorms.available}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            / {accom.maleDorms.total}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 uppercase">{accom.maleDorms.status}</span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-950 border border-purple-900/40">
                        <div className="text-[10px] text-purple-400">FEMALE DORMS</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {accom.femaleDorms.available}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            / {accom.femaleDorms.total}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 uppercase">{accom.femaleDorms.status}</span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-950 border border-emerald-900/40">
                        <div className="text-[10px] text-emerald-400">FAMILY PODS</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {accom.familyRooms.available}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            / {accom.familyRooms.total}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 uppercase">{accom.familyRooms.status}</span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-950 border border-rose-900/40">
                        <div className="text-[10px] text-rose-400">SPECIAL NEEDS</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {accom.specialNeeds.available}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            / {accom.specialNeeds.total}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 uppercase">{accom.specialNeeds.status}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* HUMANITARIAN SUPPLIES & UTILITY BUFFER */}
                {accom && (
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Droplet className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{accom.waterLitersRemaining.toLocaleString()} L Water</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Utensils className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{accom.packagedMealsRemaining.toLocaleString()} Meals</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Power: {accom.powerGridStatus.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Dr: {accom.medicalStaffOnDuty ? 'On Duty' : 'Visiting'}</span>
                    </div>
                  </div>
                )}

                {/* Facilities Checklist */}
                <div className="space-y-1 text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px] font-mono">
                    FACILITIES & ACCESSIBILITY:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {shelter.facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        ✓ {fac}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Google Maps Direct Link & Rapid Intake */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  {/* Google Maps Actions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-2.5 py-1 rounded text-xs transition-colors"
                      title="Open Shelter Coordinates on Google Maps"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Google Maps</span>
                    </a>

                    <a
                      href={googleDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-2.5 py-1 rounded text-xs transition-colors"
                      title="Navigate to Shelter with Google Maps"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Directions</span>
                    </a>
                  </div>

                  {/* Public or Admin Intake Action */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={personIdToCheckIn}
                      onChange={(e) => setPersonIdToCheckIn(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200 focus:outline-none max-w-[170px]"
                    >
                      <option value="">Check-in Person...</option>
                      {unaccountedPeople.map((p) => (
                        <option key={p.id} value={p.id}>
                          #{p.id} - {p.name}
                        </option>
                      ))}
                    </select>

                    <button
                      disabled={!personIdToCheckIn || isFull}
                      onClick={() => handleCheckIn(shelter.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded text-xs font-bold transition-colors"
                    >
                      Intake
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
