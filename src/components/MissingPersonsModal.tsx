import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { MissingPersonBulletin } from '../types';
import {
  Users,
  Search,
  Plus,
  MapPin,
  Clock,
  Phone,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Share2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const MissingPersonsModal: React.FC = () => {
  const {
    isMissingPersonsModalOpen,
    setIsMissingPersonsModalOpen,
    missingBulletins,
    reportMissingSighting,
    addMissingBulletin,
  } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'REPORT_NEW'>('DIRECTORY');
  const [selectedBulletin, setSelectedBulletin] = useState<MissingPersonBulletin | null>(null);

  // Form states for new bulletin
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState<number>(28);
  const [newGender, setNewGender] = useState<'M' | 'F' | 'OTHER'>('M');
  const [newLastLocation, setNewLastLocation] = useState('');
  const [newLastTime, setNewLastTime] = useState('');
  const [newPhysical, setNewPhysical] = useState('');
  const [newClothing, setNewClothing] = useState('');
  const [newContact, setNewContact] = useState('');

  // Sighting state
  const [sightingLocation, setSightingLocation] = useState('');
  const [sightingReporter, setSightingReporter] = useState('');
  const [sightingDetails, setSightingDetails] = useState('');
  const [sightingSubmittedNotice, setSightingSubmittedNotice] = useState(false);

  if (!isMissingPersonsModalOpen) return null;

  const filtered = missingBulletins.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.lastSeenLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.clothingDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateBulletin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLastLocation.trim()) return;

    addMissingBulletin({
      name: newName.trim(),
      age: newAge,
      gender: newGender,
      lastSeenLocation: newLastLocation.trim(),
      lastSeenTime: newLastTime.trim() || 'Approx 1 hour ago',
      physicalDescription: newPhysical.trim() || 'No distinct physical markers noted',
      clothingDescription: newClothing.trim() || 'Casual attire',
      contactNumber: newContact.trim() || '+91 98450 00000',
    });

    setNewName('');
    setNewLastLocation('');
    setNewLastTime('');
    setNewPhysical('');
    setNewClothing('');
    setNewContact('');
    setActiveTab('DIRECTORY');
  };

  const handleSightingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBulletin || !sightingLocation.trim() || !sightingReporter.trim()) return;

    reportMissingSighting(selectedBulletin.id, {
      location: sightingLocation.trim(),
      reporter: sightingReporter.trim(),
      details: sightingDetails.trim() || 'Sighted at specified location.',
    });

    setSightingLocation('');
    setSightingReporter('');
    setSightingDetails('');
    setSightingSubmittedNotice(true);
    setTimeout(() => setSightingSubmittedNotice(false), 3500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[92vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Disaster Missing Persons Registry</span>
                <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                  SEARCH & RESCUE TRACE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Community bulletin to locate missing relatives and verify recent field sightings
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMissingPersonsModalOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 bg-slate-950/60 p-2 border-b border-slate-800 gap-1.5 text-xs font-mono">
          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'DIRECTORY'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Missing Bulletins ({missingBulletins.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('REPORT_NEW')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'REPORT_NEW'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Missing Person Alert</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeTab === 'DIRECTORY' ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search missing relatives by name, clothing, or last seen landmark..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>

              {/* Sighting Notice */}
              {sightingSubmittedNotice && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sighting logged successfully. NDRF and Field Search Coordinators have been notified.</span>
                </div>
              )}

              {/* Bulletins Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((bulletin) => (
                  <div
                    key={bulletin.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl space-y-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {bulletin.photoUrl ? (
                          <img
                            src={bulletin.photoUrl}
                            alt={bulletin.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm border border-slate-700">
                            {bulletin.name[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{bulletin.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({bulletin.age}y, {bulletin.gender})
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Last seen: {bulletin.lastSeenTime}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          bulletin.status === 'SIGHTED'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                        }`}
                      >
                        {bulletin.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <div className="text-slate-300 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{bulletin.lastSeenLocation}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        <span className="text-slate-500">Clothing: </span>
                        {bulletin.clothingDescription}
                      </div>
                      {bulletin.physicalDescription && (
                        <div className="text-slate-400 text-[11px]">
                          <span className="text-slate-500">Details: </span>
                          {bulletin.physicalDescription}
                        </div>
                      )}
                    </div>

                    {/* Sighting history */}
                    {bulletin.reportedSightings.length > 0 && (
                      <div className="bg-amber-950/20 border border-amber-500/30 p-2 rounded-lg text-xs space-y-1">
                        <span className="text-[10px] font-mono font-bold text-amber-300 block">
                          ⚡ RECENT SIGHTING REPORT ({bulletin.reportedSightings[0].time})
                        </span>
                        <p className="text-[11px] text-amber-100/90 font-mono">
                          {bulletin.reportedSightings[0].location} — "{bulletin.reportedSightings[0].details}"
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                      <a
                        href={`tel:${bulletin.contactNumber.replace(/[^0-9]/g, '')}`}
                        className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{bulletin.contactNumber}</span>
                      </a>

                      <button
                        onClick={() => setSelectedBulletin(bulletin)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded text-xs font-mono transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Report Sighting</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sighting Reporting Popup inside modal */}
              {selectedBulletin && (
                <div className="p-4 bg-slate-950 border-2 border-amber-500/60 rounded-xl space-y-3 animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>LOG SIGHTING FOR: {selectedBulletin.name} ({selectedBulletin.id})</span>
                    </h3>
                    <button
                      onClick={() => setSelectedBulletin(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSightingSubmit} className="space-y-2.5 text-xs font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1">Your Name / Organization</label>
                        <input
                          type="text"
                          value={sightingReporter}
                          onChange={(e) => setSightingReporter(e.target.value)}
                          placeholder="e.g. Volunteer Suresh (Civil Defense)"
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Sighting Location</label>
                        <input
                          type="text"
                          value={sightingLocation}
                          onChange={(e) => setSightingLocation(e.target.value)}
                          placeholder="e.g. Brigade Road Shelter Entry Gate"
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Visual Details / State of Person</label>
                      <input
                        type="text"
                        value={sightingDetails}
                        onChange={(e) => setSightingDetails(e.target.value)}
                        placeholder="e.g. Walking towards medical tent, conscious with bandage on left arm"
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2 rounded font-mono text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>CONFIRM & TRANSMIT SIGHTING RECORD</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* Register New Bulletin Form */
            <form onSubmit={handleCreateBulletin} className="space-y-3.5 text-xs font-sans">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-300 font-medium block mb-1">Full Name of Missing Person</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Aarav Patil"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Age</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(parseInt(e.target.value) || 0)}
                    min={1}
                    max={110}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Last Seen Landmark / Address</label>
                  <input
                    type="text"
                    value={newLastLocation}
                    onChange={(e) => setNewLastLocation(e.target.value)}
                    placeholder="e.g. St. Joseph ground flood relief point"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Last Seen Time</label>
                  <input
                    type="text"
                    value={newLastTime}
                    onChange={(e) => setNewLastTime(e.target.value)}
                    placeholder="e.g. 14:15 IST"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Clothing Description</label>
                  <input
                    type="text"
                    value={newClothing}
                    onChange={(e) => setNewClothing(e.target.value)}
                    placeholder="e.g. Red hoodie, grey sweatpants"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="e.g. +91 98450 12345"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Distinguishing Physical Features</label>
                <input
                  type="text"
                  value={newPhysical}
                  onChange={(e) => setNewPhysical(e.target.value)}
                  placeholder="e.g. Height 5ft 8in, spectacles, scar near right eyebrow"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3 rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>PUBLISH MISSING PERSON BULLETIN TO SEARCH NETWORK</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
