export type DisasterMode = 'BEFORE' | 'DURING' | 'AFTER';

export type PersonStatus = 'SAFE' | 'UNACCOUNTED' | 'DISTRESS' | 'KNOWN_ELSEWHERE' | 'UNKNOWN';

export type ConfirmationSource = 'SELF_CONFIRMATION' | 'SHELTER_CHECKIN' | 'CHECKPOINT_RECORD' | 'RESCUE_TEAM' | 'NONE';

export type HazardLevel = 'SEVERE' | 'HIGH' | 'MODERATE' | 'LOW' | 'UNASSESSED';

export type RoadStatus = 'BLOCKED' | 'PARTIALLY_BLOCKED' | 'OPEN' | 'UNKNOWN';

export type TeamStatus = 'AVAILABLE' | 'ASSIGNED' | 'BUSY' | 'OFFLINE';
export type RescueTeamStatus = TeamStatus | 'EN_ROUTE' | 'ON_SCENE' | 'RETURNING';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'ALL_CLEAR';

export interface BroadcastAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  targetAudience: string;
  channels: string[];
  timestamp: string;
  recipientsReached: number;
}

export type RequestStatus = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'MONITORED' | 'TEAM_ASSIGNED' | 'RESCUED' | 'NOT_FOUND';

export type UserRole = 'CONTROL_ROOM_OPERATOR' | 'RESCUE_TEAM' | 'SHELTER_STAFF' | 'CHECKPOINT_STAFF' | 'ADMINISTRATOR' | 'CITIZEN' | 'FAMILY_MEMBER';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  label: string;
  accuracyMeters?: number;
}

export interface Person {
  id: string;
  name: string;
  age: number;
  householdId: string;
  phone?: string;
  expectedLocation: string; // e.g. "Building A (Home)"
  lastKnownLocation: string;
  coordinates: LocationCoordinates;
  status: PersonStatus;
  confirmationSource: ConfirmationSource;
  confirmationTimestamp?: string;
  confirmationDetails?: string;
  lastUpdate: string;
  isChild?: boolean;
  isPhysicallyDisabled?: boolean;
  isHeavilyInjured?: boolean;
  isSeriouslyUnwell?: boolean;
  notes?: string;
  medicalNotes?: string;
  gpsAccuracyMeters?: number;
  locationHistory?: {
    timestamp: string;
    location: string;
    source: string;
    accuracyMeters: number;
  }[];
  timeline: {
    time: string;
    description: string;
    type: 'GPS' | 'CITIZEN_REPORT' | 'CHECKPOINT' | 'RESCUE' | 'SYSTEM';
    confidence: 'HIGH' | 'MEDIUM' | 'ESTIMATED';
  }[];
}

export interface DistressRequest {
  id: string; // e.g. "R182"
  personId?: string;
  reporterName: string;
  householdId: string;
  buildingId: string;
  locationName: string;
  coordinates: LocationCoordinates;
  peopleCount: number;
  situations: {
    trapped: boolean;
    waterRising: boolean;
    fire: boolean;
    heavilyInjuredCount: number;
    seriouslyUnwellCount: number;
    childrenCount: number;
    disabledCount: number;
    needRescue: boolean;
    otherNotes?: string;
  };
  deviceInfo: {
    batteryLevel: number;
    connectivity: 'ONLINE' | 'WEAK_CELLULAR' | 'OFFLINE_MESH_RELAY';
    gpsAccuracyMeters: number;
    isRelayed?: boolean;
    relayHops?: number;
  };
  receivedAt: string; // "14:03"
  waitingMinutes: number;
  calculatedScore: number;
  scoreBreakdown: {
    waterRising: number;
    fire: number;
    trapped: number;
    children: number;
    disabled: number;
    injured: number;
    unwell: number;
    needRescue: number;
    peopleCount: number;
    waitingTime: number;
  };
  status: RequestStatus;
  assignedTeamId?: string;
  assignedAt?: string;
  etaMinutes?: number;
  history: {
    time: string;
    event: string;
  }[];
}

export interface Building {
  id: string; // "BLD-A"
  name: string;
  areaZone: string;
  coordinates: LocationCoordinates;
  registeredCount: number;
  expectedCount: number;
  confirmedSafeCount: number;
  unaccountedCount: number;
  distressCount: number;
  knownAbsentCount: number;
  damageLevel: HazardLevel;
  hazardZone: HazardLevel;
  distressScore: number;
  unaccountedScore: number;
  hazardScore: number;
  finalPriorityScore: number; // 0.5*distress + 0.3*unaccounted + 0.2*hazard
  searchStatus: 'PENDING' | 'SEARCH_IN_PROGRESS' | 'CLEARED' | 'HIGH_RISK_DELAYED';
  nearbyTeamIds: string[];
}

export interface RescueTeam {
  id: string; // "RT-07"
  name: string;
  status: TeamStatus;
  membersCount: number;
  leader: string;
  equipment: string[];
  specializedEquipment?: string[];
  currentLocation: string;
  coordinates: LocationCoordinates;
  currentAssignment?: {
    requestId: string;
    targetLocation: string;
    etaMinutes: number;
    assignedAt: string;
  };
}

export interface DormCategory {
  total: number;
  occupied: number;
  available: number;
}

export interface ShelterAccommodation {
  maleDormBeds: DormCategory;
  femaleDormBeds: DormCategory;
  familyPods: DormCategory;
  medicalSeniorBeds: DormCategory;
  waterSupplyLiters: number;
  foodMealsRemaining: number;
  medicalStaffOnDuty: boolean;
  powerBackup: 'GENERATOR_ACTIVE' | 'SOLAR_BANK' | 'GRID_ONLINE';
  acceptingEvacuees: boolean;
  lastIntakeAt?: string;
  // Aliases for compatibility
  maleDorms?: DormCategory;
  femaleDorms?: DormCategory;
  familyRooms?: DormCategory;
  specialNeeds?: DormCategory;
}

export interface Shelter {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  capacity: number;
  currentOccupancy: number;
  availableBeds: number;
  status: 'OPEN' | 'NEAR_CAPACITY' | 'FULL' | 'CLOSED';
  facilities: string[];
  contactPerson: string;
  phone: string;
  coordinates: LocationCoordinates;
  accommodation?: ShelterAccommodation;
}

export interface BlockedRoad {
  id: string;
  roadName: string;
  name?: string;
  status: RoadStatus;
  reason: string;
  reportedAt: string;
  source: string;
  confidence: 'HIGH' | 'MEDIUM' | 'ESTIMATED';
  coordinates: {
    from: LocationCoordinates;
    to: LocationCoordinates;
  };
}

export interface EmergencyAlert {
  id: string;
  type: 'EMERGENCY' | 'EVACUATION' | 'FIRE' | 'FLOOD' | 'STRUCTURAL' | 'ROAD_CLOSURE' | 'SHELTER_UPDATE';
  title: string;
  message: string;
  targetZone: string;
  channels: string[];
  issuedAt: string;
  issuedBy: string;
  active: boolean;
  severity?: AlertSeverity;
  targetAudience?: string;
  timestamp?: string;
  recipientsReached?: number;
}

export interface IncidentEvent {
  id: string;
  time: string;
  icon: string;
  title: string;
  detail: string;
  category: 'DETECTION' | 'ACCOUNTABILITY' | 'DISTRESS' | 'RESCUE' | 'HAZARD' | 'AI_UPDATE';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  details: string;
  source?: string;
  category: 'STATUS_CHANGE' | 'TEAM_ASSIGNMENT' | 'SHELTER_CHECKIN' | 'ROAD_UPDATE' | 'ALERT_ISSUED' | 'MODE_CHANGE';
}

export interface EvacuationRoutePlan {
  fromBuildingId: string;
  toShelterId: string;
  recommendedDistanceKm: number;
  estimatedTravelMinutes: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  roadSegments: {
    name: string;
    condition: 'CLEAR' | 'HAZARD_ADJACENT' | 'CONGESTED';
    lengthKm: number;
  }[];
  hazardsAvoided: string[];
  alternativeRouteNotice?: string;
}

export type HospitalType =
  | 'TRAUMA_CENTER_LEVEL_1'
  | 'DISTRICT_GOVT_HOSPITAL'
  | 'SUPER_SPECIALITY'
  | 'EMERGENCY_CARE_CLINIC';

export type HospitalStatus =
  | 'OPERATIONAL'
  | 'HIGH_LOAD'
  | 'CRITICAL_CAPACITY'
  | 'DIVERTING_AMBULANCES';

export interface HospitalBeds {
  total: number;
  occupied: number;
  available: number;
  icuTotal: number;
  icuAvailable: number;
  ventilatorTotal: number;
  ventilatorAvailable: number;
  traumaEmergencyBedsAvailable: number;
  pediatricBedsAvailable: number;
  oxygenSupportedBedsAvailable: number;
}

export interface HospitalBloodBank {
  oNegative: 'ADEQUATE' | 'LOW' | 'CRITICAL';
  aPositive: 'ADEQUATE' | 'LOW' | 'CRITICAL';
  bPositive: 'ADEQUATE' | 'LOW' | 'CRITICAL';
  plasmaUnits: number;
}

export interface Hospital {
  id: string; // e.g. "HOSP-01"
  name: string;
  type: HospitalType;
  location: string;
  distanceKm: number;
  coordinates: LocationCoordinates;
  status: HospitalStatus;
  contactPhone: string;
  ambulanceHotline: string;
  chiefMedicalOfficer?: string;
  beds: HospitalBeds;
  bedAvailabilityIndex: number; // 0-100 calculated score
  estimatedWaitMinutes: number; // e.g. 10, 35, 60
  waitTimeReason: string; // Detailed clinical backlog reason
  triageBacklogCount: number;
  bloodBank: HospitalBloodBank;
  oxygenReserveHours: number;
  powerBackupStatus: 'GRID_PRIMARY' | 'GENERATOR_BACKUP_ONLINE' | 'BATTERY_ESSENTIALS';
  specialties: string[];
  incomingAmbulancesCount: number;
  routeCondition: 'CLEAR_ACCESS' | 'CAUTION_DEBRIS' | 'DETOUR_REQUIRED';
}

export interface FamilyMemberLink {
  personId: string;
  name: string;
  relationship: 'HEAD' | 'SPOUSE' | 'SON' | 'DAUGHTER' | 'PARENT' | 'SIBLING' | 'RELATIVE';
  age: number;
  gender?: 'M' | 'F' | 'OTHER';
  phone?: string;
  medicalConditions?: string[];
}

export interface FamilyHousehold {
  householdId: string; // e.g. "HH-814"
  familyName: string;
  contactPhone: string;
  alternatePhone?: string;
  registeredAddress: string;
  buildingId: string;
  members: FamilyMemberLink[];
  lastWelfareCheck?: string;
  notes?: string;
}

export interface WelfareCheckRequest {
  id: string;
  householdId: string;
  targetPersonName: string;
  requestedBy: string;
  relationship: string;
  requesterPhone: string;
  specialNeeds: string;
  status: 'QUEUED' | 'SEARCH_DISPATCHED' | 'LOCATED_SAFE' | 'HOSPITALIZED' | 'PENDING';
  timestamp: string;
  assignedTeamId?: string;
  notes?: string;
}

export interface BedAllocationRecord {
  voucherId: string; // e.g. "BED-VOUCHER-9241"
  hospitalId: string;
  hospitalName: string;
  patientName: string;
  patientAge?: number;
  triagePriority: 'RED_CRITICAL' | 'YELLOW_URGENT' | 'GREEN_STABLE';
  bedType: 'TRAUMA_EMERGENCY' | 'ICU_VENTILATOR' | 'OXYGEN_SUPPORTED' | 'BURN_UNIT' | 'GENERAL_ACUTE';
  assignedBay: string; // e.g. "TRAUMA BAY-03"
  attendingPhysician: string;
  dispatchedAmbulanceCallsign?: string;
  timestamp: string;
  status: 'RESERVED' | 'EN_ROUTE' | 'ADMITTED';
  barcode: string;
  notes?: string;
}

export interface MissingPersonBulletin {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'OTHER';
  householdId?: string;
  lastSeenLocation: string;
  lastSeenTime: string;
  physicalDescription: string;
  clothingDescription: string;
  contactNumber: string;
  photoUrl?: string;
  status: 'MISSING' | 'SIGHTED' | 'REUNITED';
  reportedSightings: {
    time: string;
    location: string;
    reporter: string;
    details: string;
  }[];
}

export interface BloodDroneDispatch {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: string;
  units: number;
  destinationZone: string;
  dispatchTime: string;
  etaMinutes: number;
  status: 'DISPATCHED' | 'IN_FLIGHT' | 'DELIVERED';
}

