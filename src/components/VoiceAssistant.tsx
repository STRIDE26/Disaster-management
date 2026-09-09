import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Mic,
  Volume2,
  VolumeX,
  Send,
  X,
  Bot,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Radio,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: {
    type: 'NAVIGATE' | 'VIEW_RECORD' | 'INFO';
    targetTab?: string;
    label?: string;
    requestId?: string;
    personId?: string;
    buildingId?: string;
  };
}

const PAGE_TITLES: Record<string, string> = {
  command: 'Incident Command Center',
  map: 'Tactical Live Map',
  accountability: 'Accountability Overview',
  distress: 'Distress Requests & SOS Queue',
  priority: 'AI Rescue Priority Matrix',
  people: 'People & Evacuees Registry',
  buildings: 'Buildings & Structural Damage',
  shelters: 'Evacuation Shelters Directory',
  teams: 'Rescue Squads & Resource Deployment',
  roads: 'Roads & Evacuation Corridors',
  alerts: 'Emergency Broadcasts Dispatch',
  reports: 'Post-Incident Reports & Logs',
  settings: 'System Settings & Audit Trail',
  audit: 'System Settings & Audit Trail',
  citizen: 'Citizen Emergency SOS Portal',
};

export const VoiceAssistant: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isCitizenView,
    setIsCitizenView,
    people,
    distressRequests,
    buildings,
    shelters,
    rescueTeams,
    blockedRoads,
    setSelectedPerson,
    setSelectedRequest,
    setSelectedBuilding,
    isOnline,
    lastSyncTime,
    pingLatency,
  } = useDisaster();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>('');

  // Top navigation confirmation toast
  const [navigationToast, setNavigationToast] = useState<{
    message: string;
    targetTab: string;
    timestamp: number;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello! I'm your RESQ Voice & Navigation Assistant. You can speak or type to navigate views (e.g. "go to live map", "show distress queue", "citizen portal") or ask disaster casualty counts & protocols. Where would you like to go?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Auto-dismiss navigation toast after 4 seconds
  useEffect(() => {
    if (navigationToast) {
      const timer = setTimeout(() => setNavigationToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [navigationToast]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalTranscript.trim()) {
          setInterimTranscript('');
          handleProcessCommand(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setInterimTranscript('');
        if (event.error === 'not-allowed') {
          setMicError('Microphone access was denied. Please allow microphone permissions or type commands below.');
        } else if (event.error !== 'no-speech') {
          setMicError(`Voice error (${event.error}). Please try again or type below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Text-To-Speech function
  const speakResponse = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags or tab links so TTS speaks clean English
      const cleanText = text
        .replace(/\[(.*?)\]\((tab:[a-zA-Z0-9_-]+)\)/g, '$1')
        .replace(/[*#_`]/g, '')
        .replace(/👉/g, '')
        .replace(/⚡/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!speechSupported) {
      setMicError('Speech recognition is not supported in this browser. You can type commands below.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      setMicError(null);
      try {
        recognitionRef.current?.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  // Robust centralized navigation executor
  const executeNavigation = (
    targetTab: string,
    options?: {
      label?: string;
      closeAssistant?: boolean;
      requestId?: string;
      personId?: string;
      buildingId?: string;
    }
  ) => {
    // 1. Switch context
    if (targetTab === 'citizen') {
      setIsCitizenView(true);
    } else {
      setIsCitizenView(false);
      const cleanTab = targetTab === 'audit' ? 'settings' : targetTab;
      setActiveTab(cleanTab);
    }

    // 2. Select entity if provided
    if (options?.requestId) {
      const req = distressRequests.find((r) => r.id === options.requestId);
      if (req) setSelectedRequest(req);
    }
    if (options?.personId) {
      const p = people.find((item) => item.id === options.personId);
      if (p) setSelectedPerson(p);
    }
    if (options?.buildingId) {
      const b = buildings.find((item) => item.id === options.buildingId);
      if (b) setSelectedBuilding(b);
    }

    // 3. Scroll page to top so user sees the newly opened view
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const displayLabel = options?.label || PAGE_TITLES[targetTab] || targetTab;

    // 4. Trigger high-visibility Toast Notification
    setNavigationToast({
      message: `Navigated to ${displayLabel}`,
      targetTab,
      timestamp: Date.now(),
    });

    // 5. Close/minimize assistant window so the user immediately sees the target page
    // Defaults to true unless closeAssistant is explicitly false
    if (options?.closeAssistant !== false) {
      setIsOpen(false);
    }
  };

  // Live disaster statistics calculated for queries
  const stats = useMemo(() => {
    const unaccounted = people.filter((p) => p.status === 'UNACCOUNTED').length;
    const safe = people.filter((p) => p.status === 'SAFE_AT_SHELTER' || p.status === 'SAFE_HOME').length;
    const distress = people.filter((p) => p.status === 'DISTRESS').length;
    const activeReqs = distressRequests.filter((r) => r.status !== 'RESCUED' && r.status !== 'RESOLVED').length;
    const criticalReqs = distressRequests.filter((r) => r.status === 'CRITICAL' || r.urgencyScore >= 85).length;
    const totalBeds = shelters.reduce((sum, s) => sum + (s.capacity - s.currentOccupancy), 0);
    const availableTeams = rescueTeams.filter((t) => t.status === 'AVAILABLE').length;
    const deployedTeams = rescueTeams.filter((t) => t.status === 'DEPLOYED').length;
    const blockedCount = blockedRoads.filter((r) => r.status === 'BLOCKED').length;

    return {
      unaccounted,
      safe,
      distress,
      totalPeople: people.length,
      activeReqs,
      criticalReqs,
      totalBeds,
      availableTeams,
      deployedTeams,
      totalTeams: rescueTeams.length,
      blockedCount,
    };
  }, [people, distressRequests, shelters, rescueTeams, blockedRoads]);

  // Core NLP Query Engine for Navigation, Status, and Problem Solutions
  const handleProcessCommand = (query: string) => {
    const q = query.trim().toLowerCase();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message to thread
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeNow,
    };

    let replyText = '';
    let action: ChatMessage['action'] | undefined = undefined;

    // 1. Navigation Commands
    if (
      q.includes('map') ||
      q.includes('gis') ||
      q.includes('satellite') ||
      q.includes('gps') ||
      q.includes('live map')
    ) {
      replyText = `Navigating to the [Tactical Live Map](tab:map). You can view real-time GPS pings, collapsed zones, search perimeters, and active rescue squads.`;
      action = { type: 'NAVIGATE', targetTab: 'map', label: 'View Live Map' };
      executeNavigation('map', { label: 'Tactical Live Map', closeAssistant: false });
    } else if (
      q.includes('distress') ||
      q.includes('sos') ||
      q.includes('request') ||
      q.includes('emergency call')
    ) {
      replyText = `Opening [Distress Requests & SOS Queue](tab:distress). There are currently ${stats.activeReqs} active requests with ${stats.criticalReqs} rated as critical urgency.`;
      action = { type: 'NAVIGATE', targetTab: 'distress', label: 'Open SOS Queue' };
      executeNavigation('distress', { label: 'Distress Requests Queue', closeAssistant: false });
    } else if (
      q.includes('priority') ||
      q.includes('triage') ||
      q.includes('scoring') ||
      q.includes('matrix')
    ) {
      replyText = `Switching to the [AI Rescue Priority Matrix](tab:priority), ranked by the Multi-Factor Urgency Index (vulnerability, ingress, trapped count).`;
      action = { type: 'NAVIGATE', targetTab: 'priority', label: 'Open Priority Matrix' };
      executeNavigation('priority', { label: 'AI Rescue Priority Matrix', closeAssistant: false });
    } else if (
      q.includes('accountability') ||
      q.includes('census') ||
      q.includes('headcount')
    ) {
      replyText = `Opening the [Accountability Overview](tab:accountability). ${stats.safe} people verified safe, ${stats.unaccounted} unaccounted, and ${stats.distress} active in distress.`;
      action = { type: 'NAVIGATE', targetTab: 'accountability', label: 'Open Accountability' };
      executeNavigation('accountability', { label: 'Accountability Overview', closeAssistant: false });
    } else if (
      q.includes('people') ||
      q.includes('citizen') && !q.includes('portal') && !q.includes('view') && !q.includes('mode') ||
      q.includes('evacuee') ||
      q.includes('missing person') ||
      q.includes('unaccounted person') ||
      q.includes('registry')
    ) {
      replyText = `Opening the [People & Evacuee Registry](tab:people). You can cross-reference names, Aadhaar IDs, and verify safe statuses.`;
      action = { type: 'NAVIGATE', targetTab: 'people', label: 'Open People Registry' };
      executeNavigation('people', { label: 'People Registry', closeAssistant: false });
    } else if (
      q.includes('building') ||
      q.includes('sector') ||
      q.includes('structure') ||
      q.includes('damage')
    ) {
      replyText = `Opening [Structural Intelligence & Building Damage](tab:buildings) assessments across sectors A, B, and C.`;
      action = { type: 'NAVIGATE', targetTab: 'buildings', label: 'Open Buildings' };
      executeNavigation('buildings', { label: 'Buildings & Damage', closeAssistant: false });
    } else if (
      q.includes('shelter') ||
      q.includes('relief camp') ||
      q.includes('bed')
    ) {
      replyText = `Opening [Evacuation Shelters](tab:shelters) directory. There are ${stats.totalBeds.toLocaleString()} available beds across all designated relief shelters.`;
      action = { type: 'NAVIGATE', targetTab: 'shelters', label: 'Open Shelters' };
      executeNavigation('shelters', { label: 'Evacuation Shelters', closeAssistant: false });
    } else if (
      q.includes('team') ||
      q.includes('squad') ||
      q.includes('rescue team') ||
      q.includes('unit') ||
      q.includes('ndrf')
    ) {
      replyText = `Opening [Rescue Squads & Resource Deployment](tab:teams). ${stats.availableTeams} squads are available, and ${stats.deployedTeams} are deployed on-scene.`;
      action = { type: 'NAVIGATE', targetTab: 'teams', label: 'Open Rescue Teams' };
      executeNavigation('teams', { label: 'Rescue Squads', closeAssistant: false });
    } else if (
      q.includes('road') ||
      q.includes('route') ||
      q.includes('evacuation route') ||
      q.includes('traffic') ||
      q.includes('blocked')
    ) {
      replyText = `Opening [Roads & Evacuation Corridors](tab:roads). ${stats.blockedCount} roads are currently impassable due to deep water or structural debris.`;
      action = { type: 'NAVIGATE', targetTab: 'roads', label: 'Open Evacuation Routes' };
      executeNavigation('roads', { label: 'Roads & Evacuation', closeAssistant: false });
    } else if (
      q.includes('alert') ||
      q.includes('broadcast') ||
      q.includes('warning') ||
      q.includes('sms') ||
      q.includes('siren')
    ) {
      replyText = `Opening [Emergency Broadcast & Alert Dispatch](tab:alerts). You can transmit multi-channel sirens, SMS, and Cell Broadcasts.`;
      action = { type: 'NAVIGATE', targetTab: 'alerts', label: 'Open Broadcasts' };
      executeNavigation('alerts', { label: 'Emergency Alerts', closeAssistant: false });
    } else if (
      q.includes('report') ||
      q.includes('export') ||
      q.includes('audit report')
    ) {
      replyText = `Opening [Post-Incident Reports](tab:reports) and Operational Audit Logs for download and compliance review.`;
      action = { type: 'NAVIGATE', targetTab: 'reports', label: 'Open Reports' };
      executeNavigation('reports', { label: 'Reports & Analytics', closeAssistant: false });
    } else if (
      q.includes('audit') ||
      q.includes('setting') ||
      q.includes('security')
    ) {
      replyText = `Opening [Security Audit Trails & System Settings](tab:settings).`;
      action = { type: 'NAVIGATE', targetTab: 'settings', label: 'Open System Settings' };
      executeNavigation('settings', { label: 'System Settings', closeAssistant: false });
    } else if (
      q.includes('citizen') ||
      q.includes('switch to citizen') ||
      q.includes('citizen portal') ||
      q.includes('citizen view') ||
      q.includes('citizen mode') ||
      q.includes('civilian')
    ) {
      replyText = `Switching to the [Citizen Emergency Distress Portal](tab:citizen) with 1-tap SOS transmission and GPS tracking.`;
      action = { type: 'NAVIGATE', targetTab: 'citizen', label: 'Open Citizen SOS Portal' };
      executeNavigation('citizen', { label: 'Citizen SOS Portal', closeAssistant: false });
    } else if (
      q.includes('command') ||
      q.includes('commander view') ||
      q.includes('admin view') ||
      q.includes('overview') ||
      q.includes('dashboard') ||
      q.includes('home')
    ) {
      replyText = `Switching to the [Incident Command Center](tab:command) overview dashboard.`;
      action = { type: 'NAVIGATE', targetTab: 'command', label: 'Return to Command' };
      executeNavigation('command', { label: 'Command Center', closeAssistant: false });
    }

    // 2. Specific Entity Queries (e.g. #182, Shanti Towers)
    else if (q.includes('182')) {
      replyText = `Incident #182 involves Person P182 (Aditi Rao, age 28) and SOS #R182. Located near [Shanti Towers](tab:buildings) (Sector A) with 4 trapped individuals, severe water ingress (1.4m), and a senior citizen requiring oxygen. Priority Score: 98 (CRITICAL). Alpha Squad is dispatched.`;
      action = {
        type: 'NAVIGATE',
        targetTab: 'distress',
        label: 'Inspect SOS #R182',
        requestId: 'REQ-001',
        personId: 'P182',
      };
    } else if (q.includes('shanti tower') || q.includes('bld-a') || q.includes('building a')) {
      replyText = `Shanti Towers ([Building BLD-A](tab:buildings)) suffered Severe structural failure with partial staircase collapse and 4 unaccounted individuals. Alpha Squad is conducting secondary perimeter sweeps with K9 and acoustic sensors.`;
      action = {
        type: 'NAVIGATE',
        targetTab: 'buildings',
        label: 'Inspect Shanti Towers',
        buildingId: 'BLD-A',
      };
    }

    // 3. Problem Solutions & Disaster Emergency Protocols
    else if (
      q.includes('flood') ||
      q.includes('water rising') ||
      q.includes('drown') ||
      q.includes('submerged')
    ) {
      replyText = `🌊 FLOOD EMERGENCY PROTOCOL:\n1. Evacuate immediately to higher floors or high ground. Do NOT enter attics without roof exits.\n2. Disconnect electricity at main breaker if safe before water rises.\n3. NEVER walk, swim, or drive through moving water (just 15cm can sweep you away).\n4. Turn on your phone's battery saver mode. Use your phone's flashlight or a white cloth to signal rescue crews from a window or roof.\n5. Boil tap water or drink sealed bottled water only.\nCheck [Safe Evacuation Routes](tab:roads).`;
      action = { type: 'NAVIGATE', targetTab: 'roads', label: 'Check Flood Evacuation Routes' };
    } else if (
      q.includes('trapped') ||
      q.includes('debris') ||
      q.includes('collapsed') ||
      q.includes('rubble')
    ) {
      replyText = `🧱 TRAPPED IN DEBRIS PROTOCOL:\n1. Protect airway: Cover your nose and mouth with a shirt or cloth to filter airborne concrete dust.\n2. Avoid unnecessary movement to prevent shifting debris.\n3. Acoustic signaling: Tap rhythmically on an exposed pipe or wall (3 short taps every minute). Rescue teams listen with seismic microphones.\n4. Conserve voice: Do NOT shout continuously to save oxygen; shout only when hearing searchers directly above you.\n5. Keep your phone on with Bluetooth enabled—RESQ mesh relays pick up peer pings even without cell towers.\nTransmit via [Citizen SOS Portal](tab:citizen).`;
      action = { type: 'NAVIGATE', targetTab: 'citizen', label: 'Transmit Distress Beacon' };
    } else if (
      q.includes('no network') ||
      q.includes('no signal') ||
      q.includes('offline') ||
      q.includes('cell service') ||
      q.includes('no internet')
    ) {
      replyText = `📡 OFFLINE COMMUNICATIONS PROTOCOL:\nThe RESQ platform features decentralized Bluetooth Low Energy (BLE) and Wi-Fi Direct mesh relays. Even without cellular service or Wi-Fi, your distress packet hops between nearby phones until reaching a command drone or responder vehicle. Keep device power above 10%.\nOpen [Citizen SOS Portal](tab:citizen).`;
      action = { type: 'NAVIGATE', targetTab: 'citizen', label: 'Open Citizen SOS Portal' };
    } else if (
      q.includes('bleed') ||
      q.includes('first aid') ||
      q.includes('injury') ||
      q.includes('wound') ||
      q.includes('hypothermia')
    ) {
      replyText = `🩹 EMERGENCY FIRST AID:\n1. Severe Bleeding: Apply firm, continuous direct pressure with a clean cloth. Elevate the wounded limb above heart level.\n2. Hypothermia: Remove soaked clothing immediately. Wrap patient in dry blankets or silver space sheets. Keep head covered.\n3. Fractures: Immobilize the injured limb with splints (cardboard/wood); do NOT attempt to re-align bone.\n4. Unresponsive: Check airway and start CPR (100–120 chest compressions per minute).`;
    } else if (
      q.includes('how to send sos') ||
      q.includes('how to report') ||
      q.includes('help me') ||
      q.includes('save me')
    ) {
      replyText = `🚨 HOW TO TRANSMIT DISTRESS:\n1. Switch to the [Citizen SOS Portal](tab:citizen) or click the red SOS button.\n2. Allow GPS coordinates or tap a nearby landmark (e.g. Shanti Towers).\n3. Specify number of trapped occupants and any medical conditions.\n4. Tap "Transmit Distress Beacon". Your request enters the tactical command priority queue immediately.`;
      action = { type: 'NAVIGATE', targetTab: 'citizen', label: 'Go to Citizen SOS Portal' };
    }

    // 4. Live Statistics Queries
    else if (
      q.includes('how many unaccounted') ||
      q.includes('unaccounted count') ||
      q.includes('missing count') ||
      q.includes('how many missing')
    ) {
      replyText = `There are currently ${stats.unaccounted} unaccounted individuals out of ${stats.totalPeople} registered citizens. The largest concentration is in Sector A around Shanti Towers.\nView details in [People Registry](tab:people).`;
      action = { type: 'NAVIGATE', targetTab: 'people', label: 'View Unaccounted People' };
    } else if (
      q.includes('how many safe') ||
      q.includes('safe count') ||
      q.includes('people safe')
    ) {
      replyText = `${stats.safe} people have been verified safe across relief centers and designated checkpoints.\nView in [Accountability Overview](tab:accountability).`;
      action = { type: 'NAVIGATE', targetTab: 'accountability', label: 'View Safe Headcount' };
    } else if (
      q.includes('how many distress') ||
      q.includes('sos count') ||
      q.includes('active requests')
    ) {
      replyText = `There are ${stats.activeReqs} active distress requests in the dispatch pipeline. ${stats.criticalReqs} are marked Critical Priority.\nInspect [Distress Requests Queue](tab:distress).`;
      action = { type: 'NAVIGATE', targetTab: 'distress', label: 'View SOS Queue' };
    } else if (
      q.includes('shelter capacity') ||
      q.includes('available beds') ||
      q.includes('nearest shelter')
    ) {
      replyText = `Relief shelters have ${stats.totalBeds.toLocaleString()} available beds. Central Transit Shelter (SH-12) currently has the highest open capacity.\nView all [Evacuation Shelters](tab:shelters).`;
      action = { type: 'NAVIGATE', targetTab: 'shelters', label: 'View Shelters' };
    } else if (
      q.includes('rescue team') ||
      q.includes('squads status') ||
      q.includes('how many teams')
    ) {
      replyText = `Total rescue squads: ${stats.totalTeams}. ${stats.availableTeams} squads are on standby, and ${stats.deployedTeams} are deployed in active search operations.\nView [Rescue Squads](tab:teams).`;
      action = { type: 'NAVIGATE', targetTab: 'teams', label: 'View Squads' };
    } else if (
      q.includes('connection') ||
      q.includes('server status') ||
      q.includes('are we online') ||
      q.includes('is data synced') ||
      q.includes('sync status') ||
      q.includes('uplink')
    ) {
      replyText = isOnline
        ? `🟢 Command Server Connection is ONLINE with active bi-directional streaming to Node #BLR-HQ-01. Roundtrip latency is ${pingLatency}ms. Last synchronized at ${lastSyncTime}.`
        : `🔴 System is currently OFFLINE. Operating under decentralized local mesh buffer. Distress requests and dispatch events are being cached locally and will auto-sync once uplink restores.`;
    } else {
      // General fallback with helpful interactive navigation links
      replyText = `I understand you asked: "${query}". You can command me to navigate to [Live Map](tab:map), [Distress Requests](tab:distress), [Shelters](tab:shelters), [Rescue Teams](tab:teams), or [Citizen Portal](tab:citizen), ask live casualty counts, or get disaster emergency protocols.`;
    }

    const assistantMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: timeNow,
      action,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    speakResponse(replyText);
  };

  // Render markdown style [Label](tab:tabId) as interactive clickable links
  const renderFormattedText = (rawText: string) => {
    const regex = /\[(.*?)\]\((tab:([a-zA-Z0-9_-]+))\)/g;
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(rawText.substring(lastIndex, match.index));
      }
      const label = match[1];
      const targetTab = match[3];
      parts.push(
        <button
          key={`link-${match.index}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            executeNavigation(targetTab, { label, closeAssistant: true });
          }}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/90 hover:bg-cyan-800 text-cyan-300 hover:text-white border border-cyan-600/70 font-mono font-bold text-[11px] underline underline-offset-2 mx-0.5 transition-all active:scale-95 shadow-sm group"
          title={`Click to navigate to ${label}`}
        >
          <span>{label}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-80 group-hover:opacity-100" />
        </button>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < rawText.length) {
      parts.push(rawText.substring(lastIndex));
    }

    return parts.length > 0 ? parts : rawText;
  };

  // Handle text input submission
  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    handleProcessCommand(text);
  };

  // Reset conversation
  const clearChat = () => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. I am ready for your next voice or text command. Try: "go to live map", "open distress requests", or "how many unaccounted?".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Quick navigation prompt chips
  const quickPrompts = [
    { label: 'Live Map', cmd: 'navigate to live map' },
    { label: 'Distress Queue', cmd: 'open distress requests' },
    { label: 'Missing Count', cmd: 'how many unaccounted?' },
    { label: 'Shelter Beds', cmd: 'shelter capacity and beds' },
    { label: 'Rescue Squads', cmd: 'rescue teams status' },
    { label: 'Evac Routes', cmd: 'check flood evacuation routes' },
    { label: 'Citizen SOS', cmd: 'switch to citizen portal' },
  ];

  return (
    <>
      {/* 1. Global Navigation Toast Banner */}
      {navigationToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 bg-[#08101d]/95 text-slate-100 border border-cyan-500/70 px-4 py-2.5 rounded-xl shadow-2xl shadow-cyan-950/80 backdrop-blur-md">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xs font-medium">
              <span className="font-bold text-white font-mono">{navigationToast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="ml-2 text-[11px] font-mono px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 transition-colors"
            >
              Reopen Assistant
            </button>
            <button
              type="button"
              onClick={() => setNavigationToast(null)}
              className="text-slate-400 hover:text-white p-0.5 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Corner Floating Trigger Pill with "Need any help?" Caption */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 group">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 150);
            }}
            className="flex items-center gap-2.5 bg-[#0c1322]/95 border border-cyan-500/60 hover:border-cyan-400 text-slate-100 px-3.5 py-2.5 rounded-full shadow-2xl shadow-black/90 backdrop-blur-md transition-all hover:scale-105 active:scale-95 group"
          >
            {/* Pulsing Voice Avatar */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-md">
              <Bot className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>

            {/* Requested Caption */}
            <div className="text-left pr-1">
              <div className="text-xs font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                Need any help?
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {navigationToast
                  ? `Viewing: ${activeTab.toUpperCase()} • Reopen`
                  : 'Voice & Text Assistant'}
              </div>
            </div>

            {/* Mic indicator badge */}
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
              <Mic className="w-3 h-3" />
            </div>
          </button>
        </div>
      )}

      {/* 3. Expanded Voice & Text Assistant Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[430px] lg:w-[470px] h-[580px] max-h-[85vh] bg-[#090e18] border border-cyan-500/60 rounded-2xl shadow-2xl shadow-black/95 flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0d1b2f] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-4 h-4" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090e18]"></span>
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>RESQ Voice Assistant</span>
                  <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-1.5 py-0.5 rounded uppercase">
                    Live
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <span>Voice & Text Navigation Dispatcher</span>
                </div>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-1.5">
              {/* TTS Mute/Unmute */}
              <button
                type="button"
                onClick={() => {
                  setSpeechEnabled(!speechEnabled);
                  if (speechEnabled && typeof window !== 'undefined') {
                    window.speechSynthesis?.cancel();
                  }
                }}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  speechEnabled
                    ? 'bg-slate-800 text-cyan-400 border-cyan-800 hover:bg-slate-700'
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
                }`}
                title={speechEnabled ? 'Mute Assistant Audio' : 'Unmute Assistant Audio'}
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Reset chat */}
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Minimize/Close */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (typeof window !== 'undefined') {
                    window.speechSynthesis?.cancel();
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs transition-colors"
                title="Minimize assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="bg-slate-950/80 px-3 py-2 border-b border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 text-[10px] font-mono shrink-0 uppercase tracking-wider">
              Quick:
            </span>
            {quickPrompts.map((p) => (
              <button
                key={p.cmd}
                type="button"
                onClick={() => handleProcessCommand(p.cmd)}
                className="whitespace-nowrap px-2 py-1 rounded-full bg-slate-900 hover:bg-cyan-950/80 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-700 transition-colors shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-cyan-900/60 border border-cyan-700 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl p-3 space-y-2 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none shadow-md font-medium'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  <div className="text-[11px] break-words">
                    {m.sender === 'assistant' ? renderFormattedText(m.text) : m.text}
                  </div>

                  {/* Primary Navigation / Action Button */}
                  {m.action && m.action.targetTab && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          executeNavigation(m.action!.targetTab!, {
                            label: m.action!.label,
                            closeAssistant: true,
                            requestId: m.action!.requestId,
                            personId: m.action!.personId,
                            buildingId: m.action!.buildingId,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-cyan-950/80 transition-all hover:scale-105 active:scale-95 group/nav"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{m.action.label || 'Open & View Page'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/nav:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          executeNavigation(m.action!.targetTab!, {
                            label: m.action!.label,
                            closeAssistant: false,
                            requestId: m.action!.requestId,
                            personId: m.action!.personId,
                            buildingId: m.action!.buildingId,
                          })
                        }
                        className="text-[10px] text-cyan-400 hover:text-cyan-200 underline font-mono px-1 py-0.5 transition-colors"
                        title="Switch page in background without minimizing assistant"
                      >
                        (keep chat open)
                      </button>
                    </div>
                  )}

                  <div
                    className={`text-[9px] font-mono text-right ${
                      m.sender === 'user' ? 'text-cyan-200/80' : 'text-slate-500'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* Listening Live Transcript Banner */}
            {isListening && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-700/60 text-red-200 space-y-1.5 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                  <Radio className="w-4 h-4 animate-spin text-red-400" />
                  <span>Listening... Speak your command or question</span>
                </div>
                <div className="text-xs italic text-red-100 font-mono">
                  &ldquo;{interimTranscript || 'Waiting for speech...'}&rdquo;
                </div>
              </div>
            )}

            {/* Mic Error Banner */}
            {micError && (
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">{micError}</div>
                <button
                  type="button"
                  onClick={() => setMicError(null)}
                  className="text-amber-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Voice Pulse / Visualizer Bar while listening */}
          {isListening && (
            <div className="bg-red-950/70 border-t border-red-800 px-4 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="font-mono text-red-300 text-[11px]">Recording audio...</span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="text-[10px] font-mono uppercase bg-red-900/80 hover:bg-red-800 text-red-200 px-2 py-0.5 rounded border border-red-700"
              >
                Stop Listening
              </button>
            </div>
          )}

          {/* Input Bar with Mic & Text */}
          <form
            onSubmit={handleSendText}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            {/* Large Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-400 shadow-lg shadow-red-600/50 animate-bounce'
                  : 'bg-slate-900 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 border-slate-700 hover:border-cyan-500'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice command'}
            >
              {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input Field */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isListening
                    ? 'Listening to voice...'
                    : 'Type command ("go to map") or question...'
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white disabled:text-slate-600 border border-cyan-500 disabled:border-slate-800 transition-all shrink-0"
              title="Send text command"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
