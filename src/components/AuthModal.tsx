import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { UserRole } from '../types';
import {
  ShieldAlert,
  User,
  Users,
  Lock,
  Phone,
  CheckCircle2,
  X,
  Sparkles,
  Key,
  Building,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Mail,
  Eye,
  EyeOff,
  Tent,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUserRole,
    switchRole,
    setSelectedHouseholdId,
    shelters,
    selectedShelterAdminId,
    setSelectedShelterAdminId,
    setActiveTab: setGlobalActiveTab,
  } = useDisaster();

  const [activeTab, setActiveTab] = useState<'ADMIN' | 'USER' | 'FAMILY' | 'SHELTER'>(
    currentUserRole === 'ADMINISTRATOR' || currentUserRole === 'CONTROL_ROOM_OPERATOR'
      ? 'ADMIN'
      : currentUserRole === 'SHELTER_STAFF'
      ? 'SHELTER'
      : currentUserRole === 'FAMILY_MEMBER'
      ? 'FAMILY'
      : 'USER'
  );

  // Admin login credentials (no hardcoded prefill or credentials display)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  // Shelter Administrator credentials
  const [shelterId, setShelterId] = useState(selectedShelterAdminId || 'SH-12');
  const [shelterStaffBadge, setShelterStaffBadge] = useState('');
  const [shelterPasscode, setShelterPasscode] = useState('');
  const [shelterAuthError, setShelterAuthError] = useState<string | null>(null);

  // User / Citizen credentials
  const [userPhone, setUserPhone] = useState('+91 94481 00182');
  const [userOtp, setUserOtp] = useState('4829');

  // Family Member credentials
  const [familyHouseholdId, setFamilyHouseholdId] = useState('HH-814');
  const [familyPin, setFamilyPin] = useState('8140');

  if (!isOpen) return null;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.trim().toUpperCase() !== 'STRIDE') {
      setAdminAuthError('Clearance failed: Invalid command authorization passcode.');
      return;
    }
    setAdminAuthError(null);
    switchRole('ADMINISTRATOR');
    onClose();
  };

  const handleShelterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedShelterAdminId(shelterId);
    switchRole('SHELTER_STAFF');
    setGlobalActiveTab('shelters');
    onClose();
  };

  const handleCitizenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole('CITIZEN');
    onClose();
  };

  const handleFamilyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedHouseholdId(familyHouseholdId.trim().toUpperCase());
    switchRole('FAMILY_MEMBER');
    setGlobalActiveTab('family');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Role-Based Authentication & Access
              </h2>
              <p className="text-xs text-slate-400">
                Secure portal switching: Admin HQ, Shelter Admin, Family Portal, and Citizen SOS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Tabs (4 roles) */}
        <div className="grid grid-cols-4 bg-slate-950/60 p-2 border-b border-slate-800 gap-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg font-bold transition-all ${
              activeTab === 'ADMIN'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Admin</span>
          </button>

          <button
            onClick={() => setActiveTab('SHELTER')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg font-bold transition-all ${
              activeTab === 'SHELTER'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Tent className="w-3.5 h-3.5 text-amber-400" />
            <span>Shelter</span>
          </button>

          <button
            onClick={() => setActiveTab('FAMILY')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg font-bold transition-all ${
              activeTab === 'FAMILY'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Family</span>
          </button>

          <button
            onClick={() => setActiveTab('USER')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg font-bold transition-all ${
              activeTab === 'USER'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Citizen</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4">
          {/* 1. ADMIN TAB */}
          {activeTab === 'ADMIN' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-200 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Disaster Control Center Access</div>
                  <div className="text-[11px] text-rose-300/80 mt-0.5">
                    Authorized command personnel only. Full operational clearance to dispatch teams, broadcast municipal alerts, and manage triage.
                  </div>
                </div>
              </div>

              {adminAuthError && (
                <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/70 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{adminAuthError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Administrator Email / ID</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => {
                        setAdminEmail(e.target.value);
                        setAdminAuthError(null);
                      }}
                      required
                      placeholder="e.g. admin@disaster-control.gov.in"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium">Command Clearance Password</label>
                  </div>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        setAdminAuthError(null);
                      }}
                      required
                      placeholder="Enter command authorization passcode"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-10 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-200"
                      tabIndex={-1}
                    >
                      {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/80 active:scale-[0.99]"
              >
                <span>LOG IN AS DISASTER ADMINISTRATOR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. SHELTER ADMINISTRATION TAB */}
          {activeTab === 'SHELTER' && (
            <form onSubmit={handleShelterLogin} className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-2.5">
                <Tent className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Shelter Administration & Warden Portal</div>
                  <div className="text-[11px] text-amber-300/80 mt-0.5">
                    Dedicated login for relief camp officers. Manage live bed availability, intake registration, dormitory categories, and humanitarian supply requests.
                  </div>
                </div>
              </div>

              {shelterAuthError && (
                <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/70 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{shelterAuthError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Assigned Relief Shelter</label>
                  <select
                    value={shelterId}
                    onChange={(e) => setShelterId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  >
                    {shelters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.availableBeds} beds available)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Warden Staff Badge ID</label>
                  <input
                    type="text"
                    value={shelterStaffBadge}
                    onChange={(e) => setShelterStaffBadge(e.target.value)}
                    placeholder="e.g. SH-STAFF-12 / WARDEN-05"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Shelter Admin Access Key</label>
                  <input
                    type="password"
                    value={shelterPasscode}
                    onChange={(e) => setShelterPasscode(e.target.value)}
                    placeholder="Enter shelter officer passcode"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/80 active:scale-[0.99]"
              >
                <span>ENTER SHELTER ADMINISTRATION PORTAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. REGISTERED FAMILY MEMBER TAB */}
          {activeTab === 'FAMILY' && (
            <form onSubmit={handleFamilyLogin} className="space-y-4">
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 text-xs flex items-start gap-2.5">
                <Users className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Registered Family Member Portal</div>
                  <div className="text-[11px] text-cyan-300/80 mt-0.5">
                    Real-time spatial tracking of each relative on live interactive map, verified shelter check-ins, hospital allocations, and welfare requests.
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Registered Household ID</label>
                  <input
                    type="text"
                    value={familyHouseholdId}
                    onChange={(e) => setFamilyHouseholdId(e.target.value)}
                    placeholder="e.g. HH-814, HH-311, HH-108"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 uppercase"
                  />
                </div>

                {/* Quick Household selection helper */}
                <div className="text-[11px] text-slate-400">
                  <span>Registered Demo Households: </span>
                  {[
                    { id: 'HH-814', name: 'Rao Family (4)' },
                    { id: 'HH-311', name: 'Das Family (3)' },
                    { id: 'HH-108', name: 'Sharma Family (3)' },
                  ].map((hh) => (
                    <button
                      type="button"
                      key={hh.id}
                      onClick={() => setFamilyHouseholdId(hh.id)}
                      className="ml-1 text-cyan-400 hover:underline font-mono"
                    >
                      {hh.id}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Family Verification PIN</label>
                  <input
                    type="password"
                    value={familyPin}
                    onChange={(e) => setFamilyPin(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold py-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/80 active:scale-[0.99]"
              >
                <span>ACCESS FAMILY MEMBER PORTAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 4. CITIZEN / USER TAB */}
          {activeTab === 'USER' && (
            <form onSubmit={handleCitizenLogin} className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 text-xs flex items-start gap-2.5">
                <User className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Public Citizen & Evacuee Access</div>
                  <div className="text-[11px] text-emerald-300/80 mt-0.5">
                    Fast mobile-friendly SOS distress reporting, 1-tap "I am Safe" check-in, shelter locator, and nearby hospital status.
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Mobile Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">One-Time Passcode (OTP)</label>
                  <input
                    type="text"
                    value={userOtp}
                    onChange={(e) => setUserOtp(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/80 active:scale-[0.99]"
              >
                <span>ENTER AS CITIZEN (PUBLIC SOS)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Current Active Persona Footer Indicator */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Current Active Persona:</span>
            <span className="font-mono text-cyan-300 font-bold">
              {currentUserRole.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
