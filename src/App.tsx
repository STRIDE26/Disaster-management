import React from 'react';
import { DisasterProvider, useDisaster } from './context/DisasterContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandCenter } from './components/CommandCenter';
import { AccountabilityView } from './components/AccountabilityView';
import { DistressRequestsView } from './components/DistressRequestsView';
import { RescuePriorityView } from './components/RescuePriorityView';
import { LiveMap } from './components/LiveMap';
import { PeopleView } from './components/PeopleView';
import { BuildingsView } from './components/BuildingsView';
import { SheltersView } from './components/SheltersView';
import { RescueTeamsView } from './components/RescueTeamsView';
import { RoadsEvacuationView } from './components/RoadsEvacuationView';
import { AlertsView } from './components/AlertsView';
import { ReportsView } from './components/ReportsView';
import { SettingsAuditView } from './components/SettingsAuditView';
import { CitizenInterface } from './components/CitizenInterface';
import { BroadcastModal } from './components/BroadcastModal';
import { PersonDetailModal } from './components/PersonDetailModal';
import { VoiceAssistant } from './components/VoiceAssistant';
import { HospitalsView } from './components/HospitalsView';
import { FamilyPortalView } from './components/FamilyPortalView';
import { AuthModal } from './components/AuthModal';
import { EmergencyBedAllocationModal } from './components/EmergencyBedAllocationModal';
import { MissingPersonsModal } from './components/MissingPersonsModal';
import { BloodBankDroneModal } from './components/BloodBankDroneModal';
import { SurvivalToolsModal } from './components/SurvivalToolsModal';
import {
  LayoutDashboard,
  Map as MapIcon,
  HeartPulse,
  Users,
  Smartphone,
  Menu,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isCitizenView,
    setIsCitizenView,
    isAuthModalOpen,
    setIsAuthModalOpen,
    hospitals,
  } = useDisaster();

  // If in Citizen Mobile SOS View, show the minimal high-contrast citizen UI
  if (isCitizenView) {
    return (
      <div className="min-h-screen bg-[#070b12] text-slate-100 font-sans pb-16 lg:pb-0">
        <CitizenInterface />
        <VoiceAssistant />
        <EmergencyBedAllocationModal />
        <MissingPersonsModal />
        <BloodBankDroneModal />
        <SurvivalToolsModal />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  // Render the selected view for Command Center
  const renderContent = () => {
    switch (activeTab) {
      case 'command':
        return <CommandCenter />;
      case 'accountability':
        return <AccountabilityView />;
      case 'distress':
        return <DistressRequestsView />;
      case 'priority':
        return <RescuePriorityView />;
      case 'map':
        return (
          <div className="h-[calc(100vh-65px)] w-full">
            <LiveMap isMini={false} />
          </div>
        );
      case 'hospitals':
        return <HospitalsView />;
      case 'family':
        return <FamilyPortalView />;
      case 'people':
        return <PeopleView />;
      case 'buildings':
        return <BuildingsView />;
      case 'shelters':
        return <SheltersView />;
      case 'teams':
        return <RescueTeamsView />;
      case 'roads':
        return <RoadsEvacuationView />;
      case 'alerts':
        return <AlertsView />;
      case 'reports':
        return <ReportsView />;
      case 'audit':
      case 'settings':
        return <SettingsAuditView />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-black pb-16 md:pb-0">
      {/* Top Tactical Command Header */}
      <Header />

      {/* Main workspace with Tactical Sidebar and Active View Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#070b14]">
          {renderContent()}
        </main>
      </div>

      {/* Mobile & Phone Quick Bottom Bar (Visible on screens < 768px for easy thumb navigation) */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#090e17]/95 border-t border-slate-800 backdrop-blur-md z-40 md:hidden flex items-center justify-around px-2 py-1.5 text-[10px] font-mono">
        <button
          onClick={() => setActiveTab('command')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'command' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>HQ</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'map' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Map</span>
        </button>

        <button
          onClick={() => setActiveTab('hospitals')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors relative ${
            activeTab === 'hospitals' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HeartPulse className="w-4 h-4 text-rose-400" />
          <span>Hospitals</span>
          <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        </button>

        <button
          onClick={() => setActiveTab('family')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'family' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Family</span>
        </button>

        <button
          onClick={() => setIsCitizenView(true)}
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-emerald-400 font-bold"
        >
          <Smartphone className="w-4 h-4" />
          <span>SOS</span>
        </button>
      </nav>

      {/* Global Application Modals & Voice Assistant */}
      <BroadcastModal />
      <PersonDetailModal />
      <VoiceAssistant />
      <EmergencyBedAllocationModal />
      <MissingPersonsModal />
      <BloodBankDroneModal />
      <SurvivalToolsModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <DisasterProvider>
      <MainLayout />
    </DisasterProvider>
  );
}
