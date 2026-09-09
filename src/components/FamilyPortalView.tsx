import React, { useState, useMemo } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { FamilyHousehold, FamilyMemberLink, WelfareCheckRequest, Person } from '../types';
import { FamilyLiveMap } from './FamilyLiveMap';
import {
  Users,
  Search,
  Phone,
  Home,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  Clock,
  PlusCircle,
  CheckCircle2,
  FileText,
  Hospital as HospitalIcon,
  Navigation,
  MapPin,
  Sparkles,
  UserCheck,
  Send,
  X,
  Bed,
  ArrowRight,
  Key,
} from 'lucide-react';

export const FamilyPortalView: React.FC = () => {
  const {
    familyHouseholds,
    selectedHouseholdId,
    setSelectedHouseholdId,
    people,
    distressRequests,
    shelters,
    hospitals,
    welfareChecks,
    addWelfareCheck,
    registerFamilyMember,
    setActiveTab,
    setSelectedPerson,
    currentUserRole,
    setIsAuthModalOpen,
  } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [isWelfareModalOpen, setIsWelfareModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [welfareSuccessMsg, setWelfareSuccessMsg] = useState<string | null>(null);

  // Welfare Form State
  const [welfareTargetName, setWelfareTargetName] = useState('');
  const [welfareRequester, setWelfareRequester] = useState('');
  const [welfareRelation, setWelfareRelation] = useState('Relative');
  const [welfarePhone, setWelfarePhone] = useState('');
  const [welfareNotes, setWelfareNotes] = useState('');

  // Register Relative Form State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState('30');
  const [newMemberRel, setNewMemberRel] = useState<FamilyMemberLink['relationship']>('SON');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberMedical, setNewMemberMedical] = useState('');

  // Selected household
  const currentHousehold = useMemo(() => {
    return (
      familyHouseholds.find((h) => h.householdId === selectedHouseholdId) ||
      familyHouseholds[0]
    );
  }, [familyHouseholds, selectedHouseholdId]);

  // Find linked data for each family member
  const membersWithStatus = useMemo(() => {
    if (!currentHousehold) return [];

    return currentHousehold.members.map((member) => {
      // Find in people registry if available
      const personRecord = people.find(
        (p) =>
          p.id === member.personId ||
          p.name.toLowerCase() === member.name.toLowerCase() ||
          (member.phone && p.phone === member.phone)
      );

      // Check if person has an active distress request
      const activeSOS = distressRequests.find(
        (r) =>
          r.personId === member.personId ||
          r.householdId === currentHousehold.householdId ||
          r.reporterName.toLowerCase().includes(member.name.toLowerCase())
      );

      // Determine synthesized status
      let category: 'SAFE_AT_SHELTER' | 'HOSPITALIZED' | 'DISTRESS_ACTIVE' | 'SAFE_CONFIRMED' | 'UNACCOUNTED' =
        'SAFE_CONFIRMED';
      let locationDetail = 'Verified Safe';
      let timestamp = '14:25 IST';
      let actionRecommendation = '';

      if (activeSOS && activeSOS.status !== 'RESCUED') {
        category = 'DISTRESS_ACTIVE';
        locationDetail = `SOS #${activeSOS.id} • ${activeSOS.locationName}`;
        timestamp = activeSOS.receivedAt + ' IST';
        actionRecommendation = activeSOS.assignedTeamId
          ? `Rescue Squad ${activeSOS.assignedTeamId} dispatched (ETA ~${activeSOS.etaMinutes || 5} mins)`
          : 'Pending dispatch in Command Triage queue';
      } else if (
        member.medicalConditions?.some((m) => m.toLowerCase().includes('hospital')) ||
        member.name === 'Vikram Sharma' ||
        member.name === 'Subhash Roy' ||
        member.name === 'Tariq Zahra'
      ) {
        category = 'HOSPITALIZED';
        locationDetail = 'Victoria / Bowring Emergency Trauma Center';
        timestamp = '14:20 IST';
        actionRecommendation = 'Admitted for clinical monitoring; vitals stabilized.';
      } else if (personRecord?.confirmationSource === 'SHELTER_CHECKIN') {
        category = 'SAFE_AT_SHELTER';
        locationDetail = personRecord.lastKnownLocation || 'Kanteerava Stadium Shelter #12';
        timestamp = personRecord.confirmationTimestamp || '14:25 IST';
        actionRecommendation = 'Checked in at relief shelter. Food, water and dry bedding provided.';
      } else if (personRecord?.status === 'SAFE') {
        category = 'SAFE_CONFIRMED';
        locationDetail = personRecord.lastKnownLocation || 'Mayo Hall Evacuation Corridor';
        timestamp = personRecord.confirmationTimestamp || '14:19 IST';
        actionRecommendation = 'Confirmed safe at evacuation checkpoint.';
      } else {
        category = 'UNACCOUNTED';
        locationDetail = 'Last seen near residential building';
        timestamp = 'Awaiting Confirmation';
        actionRecommendation = 'Field teams are currently scanning Sector A.';
      }

      return {
        ...member,
        category,
        locationDetail,
        timestamp,
        actionRecommendation,
        personRecord,
        activeSOS,
      };
    });
  }, [currentHousehold, people, distressRequests]);

  // Filter households by search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return familyHouseholds.filter(
      (h) =>
        h.householdId.toLowerCase().includes(q) ||
        h.familyName.toLowerCase().includes(q) ||
        h.contactPhone.includes(q) ||
        h.members.some((m) => m.name.toLowerCase().includes(q))
    );
  }, [familyHouseholds, searchQuery]);

  // Submit Welfare Check
  const handleSubmitWelfare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!welfareTargetName || !welfareRequester) {
      alert('Please fill in the relative name and requester name.');
      return;
    }

    addWelfareCheck({
      householdId: currentHousehold.householdId,
      targetPersonName: welfareTargetName,
      requestedBy: welfareRequester,
      relationship: welfareRelation,
      requesterPhone: welfarePhone || currentHousehold.contactPhone,
      specialNeeds: welfareNotes || 'Check health status and verify shelter/hospital location.',
    });

    setWelfareSuccessMsg(
      `Priority welfare check dispatched for ${welfareTargetName}. Field responders notified.`
    );
    setIsWelfareModalOpen(false);
    setWelfareTargetName('');
    setWelfareNotes('');

    setTimeout(() => {
      setWelfareSuccessMsg(null);
    }, 5000);
  };

  // Submit Register Relative
  const handleRegisterMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName) return;

    registerFamilyMember(currentHousehold.householdId, {
      personId: `P-${Math.floor(100 + Math.random() * 900)}`,
      name: newMemberName,
      relationship: newMemberRel,
      age: parseInt(newMemberAge) || 25,
      phone: newMemberPhone,
      medicalConditions: newMemberMedical ? [newMemberMedical] : [],
    });

    setIsRegisterModalOpen(false);
    setNewMemberName('');
    setNewMemberMedical('');
    setNewMemberPhone('');
  };

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Registered Family Member Locator & Welfare Portal
              </h1>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded font-mono font-bold uppercase">
                Family Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure family tracking, shelter check-in status, hospital admission verification, and welfare checks
            </p>
          </div>
        </div>

        {/* Action buttons & Role Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors"
            title="Click to Switch Login Role"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">ROLE:</span>
            <span className="text-white font-bold">
              {currentUserRole === 'FAMILY_MEMBER'
                ? 'FAMILY MEMBER'
                : currentUserRole.startsWith('ADMIN')
                ? 'ADMIN COMMAND'
                : 'CITIZEN'}
            </span>
          </button>

          <button
            onClick={() => setIsWelfareModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs font-mono transition-all active:scale-95 shadow-md shadow-amber-950/80"
          >
            <Send className="w-3.5 h-3.5" />
            <span>REQUEST WELFARE CHECK</span>
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>REGISTER RELATIVE</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {welfareSuccessMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{welfareSuccessMsg}</span>
          </div>
          <button
            onClick={() => setWelfareSuccessMsg(null)}
            className="text-xs underline hover:text-white font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Family Household Search & Quick Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Household ID (e.g. HH-814), Relative Name (e.g. Aditi Rao), or Phone..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {searchQuery && searchResults.length > 0 && (
            <div className="text-xs text-cyan-400 font-mono">
              Found {searchResults.length} matching households
            </div>
          )}
        </div>

        {/* Quick Sample Household Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 text-[11px] shrink-0 font-medium">Registered Families:</span>
          {familyHouseholds.map((hh) => {
            const isSelected = hh.householdId === currentHousehold.householdId;
            return (
              <button
                key={hh.householdId}
                onClick={() => {
                  setSelectedHouseholdId(hh.householdId);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-950/80'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <span>{hh.familyName}</span>
                <span className="opacity-70 text-[10px] ml-1">({hh.householdId})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Household Overview Card */}
      {currentHousehold && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">{currentHousehold.familyName}</h2>
                <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                  ID: {currentHousehold.householdId}
                </span>
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  {currentHousehold.members.length} Registered Relatives
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-slate-500" />
                <span>Residence: {currentHousehold.registeredAddress}</span>
              </p>
            </div>

            {/* Contacts */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <a
                href={`tel:${currentHousehold.contactPhone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{currentHousehold.contactPhone}</span>
              </a>
              {currentHousehold.alternatePhone && (
                <span className="text-slate-500 text-[11px]">
                  Alt: {currentHousehold.alternatePhone}
                </span>
              )}
            </div>
          </div>

          {/* Household Status Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Verified Safe</div>
                <div className="text-sm font-bold text-emerald-300 font-mono">
                  {membersWithStatus.filter((m) => m.category.includes('SAFE')).length} Members
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-950 text-rose-400 border border-rose-800">
                <HospitalIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Hospitalized / Care</div>
                <div className="text-sm font-bold text-rose-300 font-mono">
                  {membersWithStatus.filter((m) => m.category === 'HOSPITALIZED').length} Members
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Active Rescue / Search</div>
                <div className="text-sm font-bold text-amber-300 font-mono">
                  {
                    membersWithStatus.filter(
                      (m) => m.category === 'DISTRESS_ACTIVE' || m.category === 'UNACCOUNTED'
                    ).length
                  }{' '}
                  Members
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Map for Family Members Tracking with Google Maps */}
      {currentHousehold && (
        <FamilyLiveMap
          household={currentHousehold}
          people={people}
          shelters={shelters}
          hospitals={hospitals}
          distressRequests={distressRequests}
        />
      )}

      {/* 4. Family Members Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Family Member Safety & Location Status</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Updated in real-time via Command Triage Stream
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {membersWithStatus.map((member) => {
            const isSafe = member.category.includes('SAFE');
            const isHospital = member.category === 'HOSPITALIZED';
            const isDistress = member.category === 'DISTRESS_ACTIVE';

            return (
              <div
                key={member.personId}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  {/* Top Row: Name, Relationship & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{member.name}</h3>
                        <span className="text-[11px] font-mono text-slate-400">
                          ({member.age} yrs • {member.relationship})
                        </span>
                      </div>
                      {member.phone && (
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Phone: {member.phone}
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isHospital ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-700 px-2.5 py-1 rounded-md">
                          <HospitalIcon className="w-3 h-3" />
                          HOSPITALIZED
                        </span>
                      ) : isDistress ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono font-bold bg-red-950/80 text-red-300 border border-red-600 px-2.5 py-1 rounded-md animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          RESCUE ACTIVE
                        </span>
                      ) : isSafe ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          CONFIRMED SAFE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700 px-2.5 py-1 rounded-md">
                          <Clock className="w-3 h-3" />
                          SEARCHING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location & Check-in Details */}
                  <div className="mt-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        Current Location:
                      </span>
                      <span className="text-slate-200 font-semibold font-mono text-right">
                        {member.locationDetail}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Last Confirmed Time:
                      </span>
                      <span className="text-cyan-300 font-mono">{member.timestamp}</span>
                    </div>

                    <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80 font-sans leading-relaxed">
                      <span className="text-cyan-400 font-mono font-medium">Status Note: </span>
                      {member.actionRecommendation}
                    </p>
                  </div>

                  {/* Medical Conditions / Special Alerts */}
                  {member.medicalConditions && member.medicalConditions.length > 0 && (
                    <div className="mt-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-500">Medical Attention:</span>
                        {member.medicalConditions.map((med, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-rose-950/60 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded"
                          >
                            {med}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {member.personRecord && (
                      <button
                        onClick={() => setSelectedPerson(member.personRecord)}
                        className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] underline flex items-center gap-1"
                      >
                        <span>View Registry File</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isHospital ? (
                      <button
                        onClick={() => setActiveTab('hospitals')}
                        className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors"
                      >
                        <Bed className="w-3 h-3" />
                        <span>Check Hospital Beds</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setWelfareTargetName(`${member.name} (${member.relationship}, ${member.age})`);
                          setIsWelfareModalOpen(true);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors"
                      >
                        <Send className="w-3 h-3 text-amber-400" />
                        <span>Request Check</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Welfare Check Audit Log for This Family */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Active Family Welfare Check Requests</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {welfareChecks.length} filed checks
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          {welfareChecks.map((wck) => (
            <div
              key={wck.id}
              className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white">{wck.targetPersonName}</span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Requested by {wck.requestedBy} ({wck.relationship})
                  </span>
                  <span className="text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded">
                    {wck.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans mt-1">{wck.specialNeeds}</p>
                {wck.notes && (
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                    Field Response: {wck.notes}
                  </p>
                )}
              </div>

              <div className="shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    wck.status === 'LOCATED_SAFE'
                      ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                      : wck.status === 'HOSPITALIZED'
                      ? 'bg-rose-950 border-rose-700 text-rose-300'
                      : 'bg-amber-950 border-amber-700 text-amber-300'
                  }`}
                >
                  {wck.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Welfare Check Modal */}
      {isWelfareModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Request Family Welfare Check</h3>
                  <p className="text-[11px] text-slate-400">
                    Direct ping to on-scene rescue squads & shelter staff
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWelfareModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWelfare} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Relative Name to Check on *</label>
                <input
                  type="text"
                  value={welfareTargetName}
                  onChange={(e) => setWelfareTargetName(e.target.value)}
                  placeholder="e.g. Aditi Rao or Devaki Rao (Age 67)"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={welfareRequester}
                    onChange={(e) => setWelfareRequester(e.target.value)}
                    placeholder="e.g. Rajesh Rao"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Relationship</label>
                  <select
                    value={welfareRelation}
                    onChange={(e) => setWelfareRelation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Relative">Relative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Your Contact Phone</label>
                <input
                  type="text"
                  value={welfarePhone}
                  onChange={(e) => setWelfarePhone(e.target.value)}
                  placeholder={currentHousehold.contactPhone}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">
                  Urgent Details / Medical Needs / Last Seen Place
                </label>
                <textarea
                  rows={3}
                  value={welfareNotes}
                  onChange={(e) => setWelfareNotes(e.target.value)}
                  placeholder="e.g. Needs oxygen support or insulin; was near 4th floor staircase when tremor hit."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWelfareModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono transition-colors"
                >
                  TRANSMIT WELFARE CHECK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Relative Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Register Family Relative</h3>
                  <p className="text-[11px] text-slate-400">
                    Add a family member to Household {currentHousehold.householdId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterMember} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Sumanth Rao"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Age *</label>
                  <input
                    type="number"
                    value={newMemberAge}
                    onChange={(e) => setNewMemberAge(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Relationship</label>
                  <select
                    value={newMemberRel}
                    onChange={(e) => setNewMemberRel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="HEAD">Head of Household</option>
                    <option value="SPOUSE">Spouse</option>
                    <option value="SON">Son</option>
                    <option value="DAUGHTER">Daughter</option>
                    <option value="PARENT">Parent</option>
                    <option value="SIBLING">Sibling</option>
                    <option value="RELATIVE">Relative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="+91 9XXXX XXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Medical Conditions / Disabilities</label>
                <input
                  type="text"
                  value={newMemberMedical}
                  onChange={(e) => setNewMemberMedical(e.target.value)}
                  placeholder="e.g. Asthma, Wheelchair user, Hearing impairment"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono transition-colors"
                >
                  ADD RELATIVE TO HOUSEHOLD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
