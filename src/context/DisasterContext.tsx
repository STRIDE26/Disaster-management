import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DisasterMode,
  Building,
  DistressRequest,
  Person,
  RescueTeam,
  Shelter,
  BlockedRoad,
  EmergencyAlert,
  IncidentEvent,
  AuditLogItem,
  ConfirmationSource,
  RoadStatus,
  HazardLevel,
  UserRole,
  AlertSeverity,
  LocationCoordinates,
  Hospital,
  FamilyHousehold,
  WelfareCheckRequest,
  FamilyMemberLink,
  BedAllocationRecord,
  MissingPersonBulletin,
  BloodDroneDispatch,
  ShelterAccommodation,
} from '../types';
import {
  INITIAL_EVENT_INFO,
  INITIAL_BUILDINGS,
  INITIAL_DISTRESS_REQUESTS,
  INITIAL_PEOPLE,
  INITIAL_RESCUE_TEAMS,
  INITIAL_SHELTERS,
  INITIAL_BLOCKED_ROADS,
  INITIAL_ALERTS,
  INITIAL_TIMELINE,
  INITIAL_AUDIT_LOG,
} from '../data/mockData';
import {
  INITIAL_HOSPITALS,
  INITIAL_HOUSEHOLDS,
  INITIAL_WELFARE_CHECKS,
  INITIAL_BED_ALLOCATIONS,
  INITIAL_MISSING_BULLETINS,
  INITIAL_BLOOD_DRONES,
} from '../data/hospitalsAndFamilies';
import { calculateDistressScore, calculateBuildingScore } from '../scoringEngine';

interface DisasterContextType {
  mode: DisasterMode;
  setMode: (mode: DisasterMode) => void;
  eventInfo: typeof INITIAL_EVENT_INFO;
  buildings: Building[];
  distressRequests: DistressRequest[];
  people: Person[];
  rescueTeams: RescueTeam[];
  shelters: Shelter[];
  blockedRoads: BlockedRoad[];
  roads: BlockedRoad[];
  alerts: EmergencyAlert[];
  timeline: IncidentEvent[];
  auditLogs: AuditLogItem[];
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  isCitizenView: boolean;
  setIsCitizenView: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  selectedPerson: Person | null;
  setSelectedPerson: (person: Person | null) => void;
  selectedRequest: DistressRequest | null;
  setSelectedRequest: (req: DistressRequest | null) => void;
  selectedBuilding: Building | null;
  setSelectedBuilding: (b: Building | null) => void;
  isBroadcastModalOpen: boolean;
  setIsBroadcastModalOpen: (val: boolean) => void;

  // Operational Actions
  assignTeamToRequest: (requestId: string, teamId: string) => void;
  markRequestRescued: (requestId: string) => void;
  markRequestNotFound: (requestId: string) => void;
  createDistressSOS: (data: {
    reporterName: string;
    householdId: string;
    buildingId?: string;
    locationName: string;
    coordinates?: LocationCoordinates;
    peopleCount: number;
    situations: DistressRequest['situations'];
    batteryLevel?: number;
    connectivity?: 'ONLINE' | 'WEAK_CELLULAR' | 'OFFLINE_MESH_RELAY';
    gpsAccuracyMeters?: number;
  }) => string;
  confirmPersonSafe: (personId: string, source: ConfirmationSource, locationDesc?: string) => void;
  checkInPersonToShelter: (personId: string, shelterId: string) => void;
  broadcastAlert: (alert: {
    type: EmergencyAlert['type'];
    title: string;
    message: string;
    targetZone: string;
    channels: EmergencyAlert['channels'];
  }) => void;
  sendBroadcastAlert: (alert: {
    title: string;
    message: string;
    severity?: AlertSeverity;
    type?: EmergencyAlert['type'];
    targetAudience?: string;
    targetZone?: string;
    channels?: string[];
  }) => void;
  toggleRoadStatus: (roadId: string, newStatus: RoadStatus) => void;
  updateBuildingDamage: (buildingId: string, damage: HazardLevel, hazard: HazardLevel) => void;
  triggerDemoPulse: () => void;
  lastSyncTime: string;
  systemOperational: boolean;
  isOnline: boolean;
  setIsOnline: (val: boolean | ((prev: boolean) => boolean)) => void;
  syncStatus: 'SYNCED' | 'SYNCING' | 'OFFLINE';
  setSyncStatus: (val: 'SYNCED' | 'SYNCING' | 'OFFLINE') => void;
  pingLatency: number;
  bufferedActionsCount: number;
  forceSync: () => void;
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  setSelectedHospital: (h: Hospital | null) => void;
  updateHospitalBeds: (hospitalId: string, deltaOccupied: number) => void;
  familyHouseholds: FamilyHousehold[];
  selectedHouseholdId: string;
  setSelectedHouseholdId: (id: string) => void;
  welfareChecks: WelfareCheckRequest[];
  addWelfareCheck: (check: {
    householdId: string;
    targetPersonName: string;
    requestedBy: string;
    relationship: string;
    requesterPhone: string;
    specialNeeds: string;
  }) => void;
  registerFamilyMember: (householdId: string, member: FamilyMemberLink) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  switchRole: (role: UserRole) => void;

  // Emergency Bed Allocation System
  bedAllocations: BedAllocationRecord[];
  isAllocationModalOpen: boolean;
  setIsAllocationModalOpen: (open: boolean) => void;
  activeAllocationHospital: Hospital | null;
  openEmergencyBedModal: (hospital: Hospital) => void;
  allocateEmergencyBed: (data: {
    hospitalId: string;
    patientName: string;
    patientAge?: number;
    triagePriority: 'RED_CRITICAL' | 'YELLOW_URGENT' | 'GREEN_STABLE';
    bedType: 'TRAUMA_EMERGENCY' | 'ICU_VENTILATOR' | 'OXYGEN_SUPPORTED' | 'BURN_UNIT' | 'GENERAL_ACUTE';
    ambulanceCallsign?: string;
    personId?: string;
    notes?: string;
  }) => BedAllocationRecord;
  selectedAllocationVoucher: BedAllocationRecord | null;
  setSelectedAllocationVoucher: (voucher: BedAllocationRecord | null) => void;

  // Missing Persons Registry
  missingBulletins: MissingPersonBulletin[];
  isMissingPersonsModalOpen: boolean;
  setIsMissingPersonsModalOpen: (open: boolean) => void;
  reportMissingSighting: (bulletinId: string, sighting: { reporter: string; location: string; details: string }) => void;
  addMissingBulletin: (bulletin: Omit<MissingPersonBulletin, 'id' | 'reportedSightings' | 'status'>) => void;

  // Blood Bank & Drone Logistics
  bloodDroneDispatches: BloodDroneDispatch[];
  isBloodBankModalOpen: boolean;
  setIsBloodBankModalOpen: (open: boolean) => void;
  dispatchBloodDrone: (data: { hospitalId: string; bloodType: string; units: number; destinationZone: string }) => void;

  // Survival Tools & Protocols
  isSurvivalToolsModalOpen: boolean;
  setIsSurvivalToolsModalOpen: (open: boolean) => void;
  isFirstAidModalOpen: boolean;
  setIsFirstAidModalOpen: (open: boolean) => void;

  // Shelter Administration Portal & Accommodation Management
  selectedShelterAdminId: string;
  setSelectedShelterAdminId: (id: string) => void;
  updateShelterAccommodation: (
    shelterId: string,
    updates: {
      capacity?: number;
      currentOccupancy?: number;
      availableBeds?: number;
      status?: Shelter['status'];
      accommodationUpdates?: Partial<ShelterAccommodation>;
    }
  ) => void;
  requestShelterSupply: (
    shelterId: string,
    supplyType: 'WATER' | 'FOOD' | 'BLANKETS' | 'MEDICAL',
    quantity: string
  ) => void;
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

export const DisasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<DisasterMode>('DURING');
  const [eventInfo, setEventInfo] = useState(INITIAL_EVENT_INFO);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [distressRequests, setDistressRequests] = useState<DistressRequest[]>(INITIAL_DISTRESS_REQUESTS);
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>(INITIAL_RESCUE_TEAMS);
  const [shelters, setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [selectedShelterAdminId, setSelectedShelterAdminId] = useState<string>('SH-12');
  const [blockedRoads, setBlockedRoads] = useState<BlockedRoad[]>(INITIAL_BLOCKED_ROADS);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(INITIAL_ALERTS);
  const [timeline, setTimeline] = useState<IncidentEvent[]>(INITIAL_TIMELINE);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOG);
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [familyHouseholds, setFamilyHouseholds] = useState<FamilyHousehold[]>(INITIAL_HOUSEHOLDS);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>('HH-814');
  const [welfareChecks, setWelfareChecks] = useState<WelfareCheckRequest[]>(INITIAL_WELFARE_CHECKS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Bed Allocation System
  const [bedAllocations, setBedAllocations] = useState<BedAllocationRecord[]>(INITIAL_BED_ALLOCATIONS);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState<boolean>(false);
  const [activeAllocationHospital, setActiveAllocationHospital] = useState<Hospital | null>(null);
  const [selectedAllocationVoucher, setSelectedAllocationVoucher] = useState<BedAllocationRecord | null>(null);

  // Missing Persons Registry
  const [missingBulletins, setMissingBulletins] = useState<MissingPersonBulletin[]>(INITIAL_MISSING_BULLETINS);
  const [isMissingPersonsModalOpen, setIsMissingPersonsModalOpen] = useState<boolean>(false);

  // Blood Bank & Drone Logistics
  const [bloodDroneDispatches, setBloodDroneDispatches] = useState<BloodDroneDispatch[]>(INITIAL_BLOOD_DRONES);
  const [isBloodBankModalOpen, setIsBloodBankModalOpen] = useState<boolean>(false);

  // Survival Tools & Protocols
  const [isSurvivalToolsModalOpen, setIsSurvivalToolsModalOpen] = useState<boolean>(false);
  const [isFirstAidModalOpen, setIsFirstAidModalOpen] = useState<boolean>(false);

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('CONTROL_ROOM_OPERATOR');
  const [isCitizenView, setIsCitizenView] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('command');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<DistressRequest | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);

  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [systemOperational] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<'SYNCED' | 'SYNCING' | 'OFFLINE'>('SYNCED');
  const [pingLatency, setPingLatency] = useState<number>(24);
  const [bufferedActionsCount, setBufferedActionsCount] = useState<number>(0);

  // Monitor real-world browser network online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('SYNCING');
      setTimeout(() => {
        setSyncStatus('SYNCED');
        setBufferedActionsCount(0);
        setPingLatency(Math.floor(18 + Math.random() * 10));
        const now = new Date();
        setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
      }, 1200);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic heartbeat / sync ticker & latency jitter
  useEffect(() => {
    const timer = setInterval(() => {
      if (isOnline) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
        setLastSyncTime(timeStr);
        setPingLatency(Math.floor(18 + Math.random() * 12));
      }
    }, 12000);
    return () => clearInterval(timer);
  }, [isOnline]);

  const getCurrentTimeFormatted = () => {
    const d = new Date();
    return d.toTimeString().substring(0, 5); // "HH:MM"
  };

  const getFullTimestamp = () => {
    const d = new Date();
    return d.toTimeString().substring(0, 8); // "HH:MM:SS"
  };

  // Helper to append audit log
  const addAuditLog = useCallback((action: string, details: string, category: AuditLogItem['category'], source = 'Control Console') => {
    const newLog: AuditLogItem = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: getFullTimestamp(),
      operator: 'Operator #204',
      action,
      details,
      source,
      category,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  // Helper to append incident event
  const addIncidentEvent = useCallback((title: string, detail: string, category: IncidentEvent['category'], icon = 'Radio') => {
    const newEv: IncidentEvent = {
      id: `EV-${Date.now().toString().slice(-4)}`,
      time: getCurrentTimeFormatted(),
      icon,
      title,
      detail,
      category,
    };
    setTimeline((prev) => [newEv, ...prev]);
  }, []);

  // 1. Assign Team to Request
  const assignTeamToRequest = useCallback((requestId: string, teamId: string) => {
    const req = distressRequests.find((r) => r.id === requestId);
    const team = rescueTeams.find((t) => t.id === teamId);
    if (!req || !team) return;

    const time = getCurrentTimeFormatted();

    // Update Request
    setDistressRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'TEAM_ASSIGNED',
              assignedTeamId: teamId,
              assignedAt: time,
              etaMinutes: 10,
              history: [
                ...r.history,
                { time, event: `Assigned to ${team.name} by Operator #204` },
              ],
            }
          : r
      )
    );

    // Update Team
    setRescueTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              status: 'ASSIGNED',
              currentAssignment: {
                requestId,
                targetLocation: req.locationName,
                etaMinutes: 10,
                assignedAt: time,
              },
            }
          : t
      )
    );

    addAuditLog('TEAM_ASSIGNMENT', `Assigned ${team.id} to Request #${requestId} (${req.locationName})`, 'TEAM_ASSIGNMENT');
    addIncidentEvent(`Team ${team.id} assigned`, `Dispatched to ${req.locationName} for Request #${requestId}`, 'RESCUE', 'Ambulance');
  }, [distressRequests, rescueTeams, addAuditLog, addIncidentEvent]);

  // 2. Mark Request Rescued
  const markRequestRescued = useCallback((requestId: string) => {
    const req = distressRequests.find((r) => r.id === requestId);
    if (!req) return;
    const time = getCurrentTimeFormatted();

    // Free the assigned team
    if (req.assignedTeamId) {
      setRescueTeams((prev) =>
        prev.map((t) =>
          t.id === req.assignedTeamId
            ? { ...t, status: 'AVAILABLE', currentAssignment: undefined }
            : t
        )
      );
    }

    // Update Request Status
    setDistressRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'RESCUED',
              etaMinutes: 0,
              history: [...r.history, { time, event: `Successfully rescued. Confirmed safe.` }],
            }
          : r
      )
    );

    // If there is an associated person, mark safe
    if (req.personId) {
      setPeople((prev) =>
        prev.map((p) =>
          p.id === req.personId
            ? {
                ...p,
                status: 'SAFE',
                confirmationSource: 'RESCUE_TEAM',
                confirmationTimestamp: time,
                confirmationDetails: `Rescued by ${req.assignedTeamId || 'Field Team'}`,
                lastUpdate: time,
              }
            : p
        )
      );
    }

    // Update Global KPIs: In Distress decreases, Confirmed Safe increases, Rescued increases
    setEventInfo((prev) => ({
      ...prev,
      inDistress: Math.max(0, prev.inDistress - req.peopleCount),
      confirmedSafe: prev.confirmedSafe + req.peopleCount,
      totalRescuedToday: prev.totalRescuedToday + req.peopleCount,
    }));

    // Update building stats if matched
    if (req.buildingId) {
      setBuildings((prev) =>
        prev.map((b) =>
          b.id === req.buildingId
            ? {
                ...b,
                distressCount: Math.max(0, b.distressCount - req.peopleCount),
                confirmedSafeCount: b.confirmedSafeCount + req.peopleCount,
                finalPriorityScore: Math.max(20, b.finalPriorityScore - 25),
              }
            : b
        )
      );
    }

    addAuditLog('SAFELY_RESCUED', `Request #${requestId} (${req.peopleCount} people) marked SAFELY RESCUED by field team`, 'STATUS_CHANGE');
    addIncidentEvent(`${req.peopleCount} People Rescued`, `Request #${requestId} cleared at ${req.locationName}`, 'RESCUE', 'CheckCircle');
  }, [distressRequests, addAuditLog, addIncidentEvent]);

  // 3. Mark Request Not Found (moves person back to unaccounted, increases priority score)
  const markRequestNotFound = useCallback((requestId: string) => {
    const req = distressRequests.find((r) => r.id === requestId);
    if (!req) return;
    const time = getCurrentTimeFormatted();

    // Free assigned team
    if (req.assignedTeamId) {
      setRescueTeams((prev) =>
        prev.map((t) =>
          t.id === req.assignedTeamId
            ? { ...t, status: 'AVAILABLE', currentAssignment: undefined }
            : t
        )
      );
    }

    // Recalculate score with additional search urgency penalty (+30)
    const newScore = req.calculatedScore + 30;

    setDistressRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'NOT_FOUND',
              calculatedScore: newScore,
              assignedTeamId: undefined,
              history: [
                ...r.history,
                { time, event: `Search team completed inspection: Occupants not found. Moved to High-Priority Search.` },
              ],
            }
          : r
      )
    );

    // Update associated person to UNACCOUNTED
    if (req.personId) {
      setPeople((prev) =>
        prev.map((p) =>
          p.id === req.personId
            ? {
                ...p,
                status: 'UNACCOUNTED',
                lastUpdate: time,
                timeline: [
                  ...p.timeline,
                  { time, description: 'Search completed: Not found at initial coordinates. Re-escalated to unaccounted.', type: 'RESCUE', confidence: 'HIGH' },
                ],
              }
            : p
        )
      );
    }

    // Update Global KPIs: moved from In Distress to Unaccounted
    setEventInfo((prev) => ({
      ...prev,
      inDistress: Math.max(0, prev.inDistress - req.peopleCount),
      unaccounted: prev.unaccounted + req.peopleCount,
    }));

    addAuditLog('NOT_FOUND_RECLASSIFIED', `Request #${requestId} occupants not located. Person returned to UNACCOUNTED with elevated priority score ${newScore}`, 'STATUS_CHANGE');
    addIncidentEvent(`Search Result: Not Found (Req #${requestId})`, `Moved to Unaccounted. AI search zone updated for wider perimeter.`, 'AI_UPDATE', 'Search');
  }, [distressRequests, addAuditLog, addIncidentEvent]);

  // 4. Create Distress SOS from Citizen / Field
  const createDistressSOS = useCallback((data: {
    reporterName: string;
    householdId: string;
    buildingId?: string;
    locationName: string;
    coordinates?: LocationCoordinates;
    peopleCount: number;
    situations: DistressRequest['situations'];
    batteryLevel?: number;
    connectivity?: 'ONLINE' | 'WEAK_CELLULAR' | 'OFFLINE_MESH_RELAY';
    gpsAccuracyMeters?: number;
  }): string => {
    const id = `R${Math.floor(100 + Math.random() * 900)}`;
    const time = getCurrentTimeFormatted();

    const scoreResult = calculateDistressScore({
      situations: data.situations,
      peopleCount: data.peopleCount,
      waitingMinutes: 0,
    });

    const newReq: DistressRequest = {
      id,
      reporterName: data.reporterName || 'Citizen SOS',
      householdId: data.householdId || 'HH-UNKNOWN',
      buildingId: data.buildingId || 'BLD-A',
      locationName: data.locationName,
      coordinates: data.coordinates || {
        lat: 12.975 + (Math.random() - 0.5) * 0.02,
        lng: 77.609 + (Math.random() - 0.5) * 0.02,
        label: data.locationName,
        accuracyMeters: data.gpsAccuracyMeters ?? 20,
      },
      peopleCount: data.peopleCount,
      situations: data.situations,
      deviceInfo: {
        batteryLevel: data.batteryLevel ?? 68,
        connectivity: data.connectivity ?? 'ONLINE',
        gpsAccuracyMeters: data.coordinates?.accuracyMeters ?? data.gpsAccuracyMeters ?? 20,
        isRelayed: data.connectivity === 'OFFLINE_MESH_RELAY',
        relayHops: data.connectivity === 'OFFLINE_MESH_RELAY' ? 2 : 0,
      },
      receivedAt: time,
      waitingMinutes: 0,
      calculatedScore: scoreResult.total,
      scoreBreakdown: scoreResult.breakdown,
      status: scoreResult.total >= 120 ? 'CRITICAL' : scoreResult.total >= 70 ? 'HIGH' : 'MEDIUM',
      history: [{ time, event: `SOS created via ${data.connectivity || 'Citizen App'}` }],
    };

    setDistressRequests((prev) => [newReq, ...prev]);

    // Update KPIs
    setEventInfo((prev) => ({
      ...prev,
      inDistress: prev.inDistress + data.peopleCount,
      unaccounted: Math.max(0, prev.unaccounted - data.peopleCount),
    }));

    addAuditLog('SOS_SUBMITTED', `New Distress Request #${id} generated for ${data.peopleCount} people at ${data.locationName}. Priority Score: ${scoreResult.total}`, 'STATUS_CHANGE', 'Citizen Interface');
    addIncidentEvent(`🚨 SOS #${id} Received`, `${data.peopleCount} people reporting distress at ${data.locationName}`, 'DISTRESS', 'AlertTriangle');

    return id;
  }, [addAuditLog, addIncidentEvent]);

  // 5. Confirm Person Safe (Self, Shelter, Checkpoint, Rescue Team)
  const confirmPersonSafe = useCallback((personId: string, source: ConfirmationSource, locationDesc?: string) => {
    const time = getCurrentTimeFormatted();
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id === personId) {
          return {
            ...p,
            status: 'SAFE',
            confirmationSource: source,
            confirmationTimestamp: time,
            confirmationDetails: locationDesc || `Confirmed safe via ${source.replace('_', ' ')}`,
            lastUpdate: time,
            timeline: [
              ...p.timeline,
              { time, description: `Status changed to SAFE via ${source}`, type: 'CHECKPOINT', confidence: 'HIGH' },
            ],
          };
        }
        return p;
      })
    );

    setEventInfo((prev) => ({
      ...prev,
      confirmedSafe: prev.confirmedSafe + 1,
      unaccounted: Math.max(0, prev.unaccounted - 1),
    }));

    addAuditLog('PERSON_SAFE_CONFIRMED', `Person #${personId} confirmed SAFE via source: ${source}`, 'STATUS_CHANGE');
    addIncidentEvent(`Person #${personId} Confirmed Safe`, `Reported via ${source.replace('_', ' ')}`, 'ACCOUNTABILITY', 'UserCheck');
  }, [addAuditLog, addIncidentEvent]);

  // 6. Check-in Person to Shelter
  const checkInPersonToShelter = useCallback((personId: string, shelterId: string) => {
    const shelter = shelters.find((s) => s.id === shelterId);
    if (!shelter) return;
    const time = getCurrentTimeFormatted();

    setShelters((prev) =>
      prev.map((s) =>
        s.id === shelterId
          ? {
              ...s,
              currentOccupancy: s.currentOccupancy + 1,
              availableBeds: Math.max(0, s.availableBeds - 1),
            }
          : s
      )
    );

    setPeople((prev) =>
      prev.map((p) =>
        p.id === personId
          ? {
              ...p,
              status: 'SAFE',
              confirmationSource: 'SHELTER_CHECKIN',
              confirmationTimestamp: time,
              confirmationDetails: `Checked in to ${shelter.name}`,
              lastKnownLocation: shelter.name,
              lastUpdate: time,
            }
          : p
      )
    );

    addAuditLog('SHELTER_CHECKIN', `Person #${personId} checked into ${shelter.name}`, 'SHELTER_CHECKIN');
  }, [shelters, addAuditLog]);

  // Update Shelter Accommodation Details & Bed Capacity
  const updateShelterAccommodation = useCallback((
    shelterId: string,
    updates: {
      capacity?: number;
      currentOccupancy?: number;
      availableBeds?: number;
      status?: Shelter['status'];
      accommodationUpdates?: Partial<ShelterAccommodation>;
    }
  ) => {
    const time = getCurrentTimeFormatted();
    setShelters((prev) =>
      prev.map((s) => {
        if (s.id !== shelterId) return s;

        const newCapacity = updates.capacity ?? s.capacity;
        const newOccupancy = updates.currentOccupancy ?? s.currentOccupancy;
        const calculatedAvailable = updates.availableBeds ?? Math.max(0, newCapacity - newOccupancy);

        let updatedAccommodation = s.accommodation;
        if (s.accommodation && updates.accommodationUpdates) {
          updatedAccommodation = {
            ...s.accommodation,
            ...updates.accommodationUpdates,
            lastIntakeAt: time,
          };
        }

        let calculatedStatus = updates.status ?? s.status;
        if (!updates.status) {
          if (calculatedAvailable === 0) calculatedStatus = 'FULL';
          else if (calculatedAvailable <= 30) calculatedStatus = 'NEAR_CAPACITY';
          else calculatedStatus = 'OPEN';
        }

        return {
          ...s,
          capacity: newCapacity,
          currentOccupancy: newOccupancy,
          availableBeds: calculatedAvailable,
          status: calculatedStatus,
          accommodation: updatedAccommodation,
        };
      })
    );

    addAuditLog(
      'SHELTER_UPDATED',
      `Shelter ${shelterId} accommodation and live inventory updated by Shelter Administration`,
      'STATUS_CHANGE'
    );
    addIncidentEvent(
      `Shelter ${shelterId} Updated`,
      `Live occupancy & beds synced with Shelter Warden Command`,
      'ACCOUNTABILITY',
      'Tent'
    );
  }, [addAuditLog, addIncidentEvent]);

  // Request Emergency Supplies for Shelter
  const requestShelterSupply = useCallback((
    shelterId: string,
    supplyType: 'WATER' | 'FOOD' | 'BLANKETS' | 'MEDICAL',
    quantity: string
  ) => {
    const time = getCurrentTimeFormatted();
    const shelter = shelters.find((s) => s.id === shelterId);
    const shelterName = shelter ? shelter.name : shelterId;

    addAuditLog(
      'SHELTER_SUPPLY_REQUESTED',
      `Emergency Supply Request [${supplyType} - ${quantity}] dispatched for ${shelterName}`,
      'RESOURCE_DISPATCH'
    );
    addIncidentEvent(
      `Relief Supply Dispatched: ${supplyType}`,
      `${quantity} allocated and routed to ${shelterName} (${time})`,
      'RESOURCE_DISPATCH',
      'Truck'
    );
  }, [shelters, addAuditLog, addIncidentEvent]);

  // 7. Broadcast Emergency Alert
  const broadcastAlert = useCallback((alertData: {
    type: EmergencyAlert['type'];
    title: string;
    message: string;
    targetZone: string;
    channels: EmergencyAlert['channels'];
  }) => {
    const time = getCurrentTimeFormatted();
    const newAlert: EmergencyAlert = {
      id: `ALT-${Date.now().toString().slice(-3)}`,
      type: alertData.type,
      title: alertData.title,
      message: alertData.message,
      targetZone: alertData.targetZone,
      channels: alertData.channels,
      issuedAt: time,
      issuedBy: 'SDMA Control Room Operator #204',
      active: true,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    addAuditLog('EMERGENCY_BROADCAST', `Issued ${alertData.type} Alert: "${alertData.title}" to ${alertData.targetZone} via [${alertData.channels.join(', ')}]`, 'ALERT_ISSUED');
    addIncidentEvent(`Emergency Broadcast Sent`, `Target: ${alertData.targetZone} - ${alertData.title}`, 'HAZARD', 'Radio');
  }, [addAuditLog, addIncidentEvent]);

  const sendBroadcastAlert = useCallback((alertData: {
    title: string;
    message: string;
    severity?: AlertSeverity;
    type?: EmergencyAlert['type'];
    targetAudience?: string;
    targetZone?: string;
    channels?: string[];
  }) => {
    const time = getCurrentTimeFormatted();
    const newAlert: EmergencyAlert = {
      id: `ALT-${Date.now().toString().slice(-3)}`,
      type: alertData.type || (alertData.severity === 'CRITICAL' ? 'EVACUATION' : 'EMERGENCY'),
      severity: alertData.severity || 'CRITICAL',
      title: alertData.title,
      message: alertData.message,
      targetZone: alertData.targetZone || alertData.targetAudience || 'Central Business District',
      targetAudience: alertData.targetAudience || alertData.targetZone || 'CBD Affected Impact Sector',
      channels: alertData.channels || ['CELL_BROADCAST', 'SMS', 'APP_PUSH'],
      issuedAt: time,
      timestamp: time,
      issuedBy: 'State Disaster Management Authority (SDMA)',
      active: true,
      recipientsReached: Math.floor(Math.random() * 4000) + 12000,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    addAuditLog('EMERGENCY_BROADCAST', `Issued ${newAlert.severity} Alert: "${newAlert.title}" via [${newAlert.channels.join(', ')}]`, 'ALERT_ISSUED');
    addIncidentEvent(`Emergency Broadcast Sent`, `${newAlert.title}`, 'HAZARD', 'Radio');
  }, [addAuditLog, addIncidentEvent]);

  // 8. Toggle Road Status
  const toggleRoadStatus = useCallback((roadId: string, newStatus: RoadStatus) => {
    setBlockedRoads((prev) =>
      prev.map((r) =>
        r.id === roadId
          ? {
              ...r,
              status: newStatus,
              reportedAt: getCurrentTimeFormatted(),
            }
          : r
      )
    );
    addAuditLog('ROAD_STATUS_CHANGED', `Road #${roadId} updated to ${newStatus}`, 'ROAD_UPDATE');
  }, [addAuditLog]);

  // 9. Update Building Damage
  const updateBuildingDamage = useCallback((buildingId: string, damage: HazardLevel, hazard: HazardLevel) => {
    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id === buildingId) {
          const calc = calculateBuildingScore(b.distressScore, b.unaccountedCount, hazard);
          return {
            ...b,
            damageLevel: damage,
            hazardZone: hazard,
            hazardScore: calc.hazardScore,
            finalPriorityScore: calc.finalScore,
          };
        }
        return b;
      })
    );
    addAuditLog('BUILDING_HAZARD_EVALUATED', `Building #${buildingId} damage reclassified to ${damage}, hazard ${hazard}`, 'STATUS_CHANGE');
  }, [addAuditLog]);

  // 10. DEMO PULSE: Interactive simulation for demonstration
  const triggerDemoPulse = useCallback(() => {
    // Generate an exciting simulated event
    const sampleSimulations = [
      () => {
        // Safe check-in simulation
        const randomUnaccounted = people.find((p) => p.status === 'UNACCOUNTED');
        if (randomUnaccounted) {
          confirmPersonSafe(randomUnaccounted.id, 'SELF_CONFIRMATION', 'Confirmed via Mobile App Ping');
        }
      },
      () => {
        // Road status change simulation
        const randomRoad = blockedRoads[Math.floor(Math.random() * blockedRoads.length)];
        const nextStatus: RoadStatus = randomRoad.status === 'BLOCKED' ? 'PARTIALLY_BLOCKED' : 'BLOCKED';
        toggleRoadStatus(randomRoad.id, nextStatus);
      },
      () => {
        // Incoming distress SOS simulation
        createDistressSOS({
          reporterName: 'Sunil Hedge (Citizen)',
          householdId: 'HH-772',
          buildingId: 'BLD-B',
          locationName: 'Brigade Heights 4th Floor Staircase',
          peopleCount: 2,
          situations: {
            trapped: true,
            waterRising: false,
            fire: false,
            heavilyInjuredCount: 1,
            seriouslyUnwellCount: 0,
            childrenCount: 0,
            disabledCount: 0,
            needRescue: true,
            otherNotes: 'Debris blocked fire door, leg fracture reported.',
          },
          batteryLevel: 34,
          connectivity: 'WEAK_CELLULAR',
        });
      },
      () => {
        // Shelter check-in simulation
        const randPerson = people[Math.floor(Math.random() * people.length)];
        const randShelter = shelters[0];
        checkInPersonToShelter(randPerson.id, randShelter.id);
      },
      () => {
        // AI search zone recalculation
        addIncidentEvent('AI Search Zone Calibrated', 'Search perimeter refined for 4 unaccounted individuals around Zone 1', 'AI_UPDATE', 'Map');
      },
    ];

    const pick = sampleSimulations[Math.floor(Math.random() * sampleSimulations.length)];
    pick();

    // Trigger immediate sync activity pulse for demonstration
    if (isOnline) {
      setSyncStatus('SYNCING');
      setTimeout(() => {
        setSyncStatus('SYNCED');
        const now = new Date();
        setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
      }, 700);
    }
  }, [people, blockedRoads, shelters, confirmPersonSafe, toggleRoadStatus, createDistressSOS, checkInPersonToShelter, addIncidentEvent, isOnline]);

  // Force Manual Synchronization
  const forceSync = useCallback(() => {
    if (!isOnline) {
      setIsOnline(true);
    }
    setSyncStatus('SYNCING');
    setTimeout(() => {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
      setLastSyncTime(formatted);
      setSyncStatus('SYNCED');
      setBufferedActionsCount(0);
      setPingLatency(Math.floor(18 + Math.random() * 8));
      addAuditLog('DATA_SYNC_MANUAL', 'Command Operator performed manual server synchronization with Primary Node #BLR-HQ-01. All telemetry buffers flushed.', 'SECURITY');
    }, 850);
  }, [isOnline, addAuditLog]);

  // Switch Role helper
  const switchRole = useCallback((role: UserRole) => {
    setCurrentUserRole(role);
    if (role === 'CITIZEN') {
      setIsCitizenView(true);
    } else if (role === 'FAMILY_MEMBER') {
      setIsCitizenView(false);
      setActiveTab('family');
    } else {
      setIsCitizenView(false);
      if (activeTab === 'citizen') {
        setActiveTab('command');
      }
    }
    addAuditLog('USER_ROLE_SWITCH', `Active session persona transitioned to ${role}.`, 'STATUS_CHANGE');
  }, [addAuditLog, activeTab]);

  // Update Hospital Beds availability dynamically
  const updateHospitalBeds = useCallback((hospitalId: string, deltaOccupied: number) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id !== hospitalId) return h;
        const newOccupied = Math.max(0, Math.min(h.beds.total, h.beds.occupied + deltaOccupied));
        const newAvailable = h.beds.total - newOccupied;
        const newIndex = Math.round((newAvailable / h.beds.total) * 100);
        return {
          ...h,
          beds: {
            ...h.beds,
            occupied: newOccupied,
            available: newAvailable,
          },
          bedAvailabilityIndex: newIndex,
          status: newIndex < 15 ? 'CRITICAL_CAPACITY' : newIndex < 40 ? 'HIGH_LOAD' : 'OPERATIONAL',
        };
      })
    );
  }, []);

  // Add Welfare Check Request
  const addWelfareCheck = useCallback((check: {
    householdId: string;
    targetPersonName: string;
    requestedBy: string;
    relationship: string;
    requesterPhone: string;
    specialNeeds: string;
  }) => {
    const newCheck: WelfareCheckRequest = {
      id: `WCK-${Math.floor(100 + Math.random() * 900)}`,
      householdId: check.householdId,
      targetPersonName: check.targetPersonName,
      requestedBy: check.requestedBy,
      relationship: check.relationship,
      requesterPhone: check.requesterPhone,
      specialNeeds: check.specialNeeds,
      status: 'QUEUED',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      notes: 'Welfare check request dispatched to field search coordinators.',
    };
    setWelfareChecks((prev) => [newCheck, ...prev]);
    addAuditLog('WELFARE_CHECK_FILED', `Family welfare check registered for ${check.targetPersonName} by ${check.requestedBy} (Household ${check.householdId}).`, 'STATUS_CHANGE');
  }, [addAuditLog]);

  // Register a new relative under a household
  const registerFamilyMember = useCallback((householdId: string, member: FamilyMemberLink) => {
    setFamilyHouseholds((prev) =>
      prev.map((hh) => {
        if (hh.householdId !== householdId) return hh;
        return {
          ...hh,
          members: [...hh.members, member],
        };
      })
    );
    addAuditLog('FAMILY_MEMBER_REGISTERED', `Relative ${member.name} (${member.relationship}) added to Household ${householdId}.`, 'STATUS_CHANGE');
  }, [addAuditLog]);

  // Open Emergency Bed Allocation Modal
  const openEmergencyBedModal = useCallback((hospital: Hospital) => {
    setActiveAllocationHospital(hospital);
    setIsAllocationModalOpen(true);
  }, []);

  // Allocate Emergency Hospital Bed with Triage Voucher
  const allocateEmergencyBed = useCallback((data: {
    hospitalId: string;
    patientName: string;
    patientAge?: number;
    triagePriority: 'RED_CRITICAL' | 'YELLOW_URGENT' | 'GREEN_STABLE';
    bedType: 'TRAUMA_EMERGENCY' | 'ICU_VENTILATOR' | 'OXYGEN_SUPPORTED' | 'BURN_UNIT' | 'GENERAL_ACUTE';
    ambulanceCallsign?: string;
    personId?: string;
    notes?: string;
  }): BedAllocationRecord => {
    const targetHosp = hospitals.find((h) => h.id === data.hospitalId) || hospitals[0];
    const voucherNumber = Math.floor(1000 + Math.random() * 9000);
    const voucherId = `BED-VOUCHER-${voucherNumber}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const randomBayNum = Math.floor(1 + Math.random() * 8);
    const bayPrefix =
      data.bedType === 'TRAUMA_EMERGENCY'
        ? 'TRAUMA-BAY'
        : data.bedType === 'ICU_VENTILATOR'
        ? 'ICU-BAY'
        : data.bedType === 'BURN_UNIT'
        ? 'BURN-WARD'
        : 'OXY-BAY';
    const assignedBay = `${bayPrefix}-0${randomBayNum}`;
    const attendingPhysician = targetHosp.chiefMedicalOfficer || 'Dr. On Duty (Disaster Medical Reserve)';

    const newRecord: BedAllocationRecord = {
      voucherId,
      hospitalId: targetHosp.id,
      hospitalName: targetHosp.name,
      patientName: data.patientName,
      patientAge: data.patientAge || 35,
      triagePriority: data.triagePriority,
      bedType: data.bedType,
      assignedBay,
      attendingPhysician,
      dispatchedAmbulanceCallsign: data.ambulanceCallsign || 'AMB-DISPATCH-AUTO',
      timestamp: timeStr,
      status: 'RESERVED',
      barcode: `||| | ||| || ||| | ${voucherNumber}`,
      notes: data.notes || `Emergency triage reservation confirmed at ${targetHosp.name}.`,
    };

    // Decrement capacity
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id !== targetHosp.id) return h;
        const newOccupied = Math.min(h.beds.total, h.beds.occupied + 1);
        const newAvailable = Math.max(0, h.beds.total - newOccupied);
        const newIndex = Math.round((newAvailable / h.beds.total) * 100);

        let newIcu = h.beds.icuAvailable;
        let newVent = h.beds.ventilatorAvailable;
        let newTrauma = h.beds.traumaEmergencyBedsAvailable;
        let newOxy = h.beds.oxygenSupportedBedsAvailable;

        if (data.bedType === 'ICU_VENTILATOR') {
          newIcu = Math.max(0, newIcu - 1);
          newVent = Math.max(0, newVent - 1);
        } else if (data.bedType === 'TRAUMA_EMERGENCY') {
          newTrauma = Math.max(0, newTrauma - 1);
        } else if (data.bedType === 'OXYGEN_SUPPORTED') {
          newOxy = Math.max(0, newOxy - 1);
        }

        return {
          ...h,
          beds: {
            ...h.beds,
            occupied: newOccupied,
            available: newAvailable,
            icuAvailable: newIcu,
            ventilatorAvailable: newVent,
            traumaEmergencyBedsAvailable: newTrauma,
            oxygenSupportedBedsAvailable: newOxy,
          },
          bedAvailabilityIndex: newIndex,
          status: newIndex < 15 ? 'CRITICAL_CAPACITY' : newIndex < 40 ? 'HIGH_LOAD' : 'OPERATIONAL',
          incomingAmbulancesCount: h.incomingAmbulancesCount + 1,
        };
      })
    );

    // If person was selected, update person status
    if (data.personId) {
      setPeople((prev) =>
        prev.map((p) =>
          p.id === data.personId
            ? {
                ...p,
                status: 'SAFE',
                confirmationSource: 'CHECKPOINT_RECORD',
                confirmationTimestamp: timeStr,
                confirmationDetails: `Emergency bed allocated at ${targetHosp.name} (${assignedBay})`,
                lastKnownLocation: targetHosp.name,
              }
            : p
        )
      );
    }

    setBedAllocations((prev) => [newRecord, ...prev]);
    setSelectedAllocationVoucher(newRecord);

    addAuditLog(
      'EMERGENCY_BED_ALLOCATED',
      `Allocated ${data.bedType} at ${targetHosp.name} for ${data.patientName} (${voucherId}). Bay: ${assignedBay}.`,
      'STATUS_CHANGE'
    );

    addIncidentEvent(
      'Emergency Bed Allocated',
      `${data.patientName} admitted to ${assignedBay} at ${targetHosp.name} (${voucherId})`,
      'RESCUE',
      'HeartPulse'
    );

    return newRecord;
  }, [hospitals, addAuditLog, addIncidentEvent]);

  // Report sighting of missing person
  const reportMissingSighting = useCallback((bulletinId: string, sighting: { reporter: string; location: string; details: string }) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
    setMissingBulletins((prev) =>
      prev.map((b) =>
        b.id === bulletinId
          ? {
              ...b,
              status: 'SIGHTED',
              reportedSightings: [
                {
                  time: timeStr,
                  reporter: sighting.reporter,
                  location: sighting.location,
                  details: sighting.details,
                },
                ...b.reportedSightings,
              ],
            }
          : b
      )
    );
    addAuditLog('MISSING_SIGHTING_REPORTED', `Sighting reported for bulletin ${bulletinId} at ${sighting.location} by ${sighting.reporter}.`, 'STATUS_CHANGE');
  }, [addAuditLog]);

  // Add missing person bulletin
  const addMissingBulletin = useCallback((bulletin: Omit<MissingPersonBulletin, 'id' | 'reportedSightings' | 'status'>) => {
    const newId = `MISS-${Math.floor(100 + Math.random() * 900)}`;
    const newBulletin: MissingPersonBulletin = {
      ...bulletin,
      id: newId,
      status: 'MISSING',
      reportedSightings: [],
    };
    setMissingBulletins((prev) => [newBulletin, ...prev]);
    addAuditLog('MISSING_BULLETIN_CREATED', `Missing person alert registered for ${bulletin.name} (${bulletin.age} yrs).`, 'ALERT');
  }, [addAuditLog]);

  // Dispatch blood drone
  const dispatchBloodDrone = useCallback((data: { hospitalId: string; bloodType: string; units: number; destinationZone: string }) => {
    const hosp = hospitals.find((h) => h.id === data.hospitalId) || hospitals[0];
    const droneId = `DRONE-BLD-${Math.floor(10 + Math.random() * 90)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const newDrone: BloodDroneDispatch = {
      id: droneId,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      bloodType: data.bloodType,
      units: data.units,
      destinationZone: data.destinationZone,
      dispatchTime: timeStr,
      etaMinutes: 7,
      status: 'DISPATCHED',
    };
    setBloodDroneDispatches((prev) => [newDrone, ...prev]);
    addAuditLog('BLOOD_DRONE_DISPATCHED', `Drone ${droneId} carrying ${data.units} units of ${data.bloodType} dispatched from ${hosp.name} to ${data.destinationZone}.`, 'ACTION');
  }, [hospitals, addAuditLog]);

  return (
    <DisasterContext.Provider
      value={{
        mode,
        setMode,
        eventInfo,
        buildings,
        distressRequests,
        people,
        rescueTeams,
        shelters,
        blockedRoads,
        roads: blockedRoads,
        alerts,
        timeline,
        auditLogs,
        currentUserRole,
        setCurrentUserRole,
        isCitizenView,
        setIsCitizenView,
        activeTab,
        setActiveTab,
        globalSearchQuery,
        setGlobalSearchQuery,
        selectedPerson,
        setSelectedPerson,
        selectedRequest,
        setSelectedRequest,
        selectedBuilding,
        setSelectedBuilding,
        isBroadcastModalOpen,
        setIsBroadcastModalOpen,
        assignTeamToRequest,
        markRequestRescued,
        markRequestNotFound,
        createDistressSOS,
        confirmPersonSafe,
        checkInPersonToShelter,
        broadcastAlert,
        sendBroadcastAlert,
        toggleRoadStatus,
        updateBuildingDamage,
        triggerDemoPulse,
        lastSyncTime,
        systemOperational,
        isOnline,
        setIsOnline,
        syncStatus,
        setSyncStatus,
        pingLatency,
        bufferedActionsCount,
        forceSync,
        hospitals,
        selectedHospital,
        setSelectedHospital,
        updateHospitalBeds,
        familyHouseholds,
        selectedHouseholdId,
        setSelectedHouseholdId,
        welfareChecks,
        addWelfareCheck,
        registerFamilyMember,
        isAuthModalOpen,
        setIsAuthModalOpen,
        switchRole,
        bedAllocations,
        isAllocationModalOpen,
        setIsAllocationModalOpen,
        activeAllocationHospital,
        openEmergencyBedModal,
        allocateEmergencyBed,
        selectedAllocationVoucher,
        setSelectedAllocationVoucher,
        missingBulletins,
        isMissingPersonsModalOpen,
        setIsMissingPersonsModalOpen,
        reportMissingSighting,
        addMissingBulletin,
        bloodDroneDispatches,
        isBloodBankModalOpen,
        setIsBloodBankModalOpen,
        dispatchBloodDrone,
        isSurvivalToolsModalOpen,
        setIsSurvivalToolsModalOpen,
        isFirstAidModalOpen,
        setIsFirstAidModalOpen,
        selectedShelterAdminId,
        setSelectedShelterAdminId,
        updateShelterAccommodation,
        requestShelterSupply,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisaster must be used within a DisasterProvider');
  }
  return context;
};
