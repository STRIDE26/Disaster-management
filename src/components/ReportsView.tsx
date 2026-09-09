import React from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  UserCheck,
  Download,
  FileSpreadsheet,
  FileText,
  PieChart as PieIcon,
  Shield,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { eventInfo, distressRequests, shelters, buildings } = useDisaster();

  // Chart data: hourly progression
  const hourlyProgression = [
    { time: '14:05', safe: 120, unaccounted: 4140, distress: 15 },
    { time: '14:15', safe: 680, unaccounted: 3450, distress: 130 },
    { time: '14:25', safe: 1540, unaccounted: 2470, distress: 250 },
    { time: '14:35', safe: 2410, unaccounted: 1530, distress: 320 },
    { time: '14:45', safe: 2890, unaccounted: 1020, distress: 350 },
  ];

  // Shelter Occupancy Bar Chart data
  const shelterData = (shelters || []).map((s) => ({
    name: s?.name ? (s.name.split(' ')[0] + ' ' + (s.name.split(' ')[1] || '')) : 'Shelter',
    Occupied: s?.currentOccupancy || 0,
    Available: s?.availableBeds || 0,
  }));

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Disaster Name,${eventInfo.name}\n` +
      `Total Registered,${eventInfo.totalRegistered}\n` +
      `Expected in Area,${eventInfo.expectedInAffectedArea}\n` +
      `Confirmed Safe,${eventInfo.confirmedSafe}\n` +
      `Unaccounted,${eventInfo.unaccounted}\n` +
      `In Distress,${eventInfo.inDistress}\n` +
      `Safely Rescued,${eventInfo.totalRescuedToday}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `resq_incident_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono">
              INCIDENT SITUATION INTELLIGENCE & TELEMETRY ANALYTICS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Accountability curve velocity, shelter saturation indexes, and emergency response performance.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shadow"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT CSV SITREP</span>
        </button>
      </div>

      {/* KPI Performance Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>ACCOUNTABILITY CONVERGENCE</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            {eventInfo?.expectedInAffectedArea ? Math.round(((eventInfo.confirmedSafe || 0) / eventInfo.expectedInAffectedArea) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-500">2,890 of 4,260 accounted</div>
        </div>

        <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>AVG RESCUE RESPONSE TIME</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-cyan-300">18.4 min</div>
          <div className="text-[11px] text-slate-500">From SOS ping to squad arrival</div>
        </div>

        <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>EXTRACTION SUCCESS RATE</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">96.2%</div>
          <div className="text-[11px] text-slate-500">74 of 77 missions successful</div>
        </div>
      </div>

      {/* Chart 1: Accountability Progression Velocity */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h3 className="font-bold text-white text-sm font-mono">
              ACCOUNTABILITY STATUS CONVERGENCE (TIMELINE VELOCITY)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Post-Detection Minutes</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyProgression}>
              <defs>
                <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUnaccounted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area
                type="monotone"
                dataKey="safe"
                name="Confirmed Safe"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSafe)"
              />
              <Area
                type="monotone"
                dataKey="unaccounted"
                name="Unaccounted"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorUnaccounted)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Shelter Capacity Distribution */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h3 className="font-bold text-white text-sm font-mono">
              SHELTER BED OCCUPANCY VS CAPACITY
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Active Evacuation Hubs</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shelterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Occupied" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Available" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
