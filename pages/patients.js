import { useState, useMemo } from 'react';
import PageLayout from '../components/layout/PageLayout';
import PatientDetailPanel from '../components/patient/PatientDetailPanel';
import { useApp } from '../context/AppContext';
import { getRiskLevel } from '../config/riskThresholds';
import { Search, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';

// Patients page: full searchable, filterable patient table with click-to-detail panel.
// Uses the existing PatientDetailPanel component â no duplication.

const RISK_FILTERS = ['All', 'Critical', 'High Risk', 'Moderate', 'Stable'];
const SURGERY_TYPES = ['All', 'Cardiac Bypass', 'Knee Replacement', 'Appendectomy', 'Hip Replacement', 'Spinal Fusion', 'Cholecystectomy', 'Hernia Repair'];

export default function PatientsPage() {
  const { patients, selectedPatientId, setSelectedPatientId } = useApp();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [surgeryFilter, setSurgeryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('riskScore');

  const filtered = useMemo(() => {
    return patients
      .filter(p => {
        const matchSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.surgeryType.toLowerCase().includes(search.toLowerCase());
        const matchRisk = riskFilter === 'All' || getRiskLevel(p.riskScore).label === riskFilter;
        const matchSurgery = surgeryFilter === 'All' || p.surgeryType === surgeryFilter;
        return matchSearch && matchRisk && matchSurgery;
      })
      .sort((a, b) => {
        if (sortBy === 'riskScore') return b.riskScore - a.riskScore;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'daysPostSurgery') return b.daysPostSurgery - a.daysPostSurgery;
        return 0;
      });
  }, [patients, search, riskFilter, surgeryFilter, sortBy]);

  const RISK_BADGE_COLORS = {
    Critical:  'bg-red-100 text-red-700',
    'High Risk': 'bg-orange-100 text-orange-700',
    Moderate:  'bg-yellow-100 text-yellow-700',
    Stable:    'bg-green-100 text-green-700',
  };

  const RISK_BORDER = {
    Critical:  'border-l-critical',
    'High Risk': 'border-l-high-risk',
    Moderate:  'border-l-moderate',
    Stable:    'border-l-stable',
  };

  return (
    <PageLayout title="Patients">
      <div className="flex gap-5 h-[calc(100vh-4rem-3rem)]">
        {/* Left: table panel */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-gray-400" strokeWidth={1.75} />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-700"
                >
                  <option value="riskScore">Sort: Risk Score</option>
                  <option value="name">Sort: Name</option>
                  <option value="daysPostSurgery">Sort: Days Post-Op</option>
                </select>
              </div>

              {/* Surgery filter */}
              <select
                value={surgeryFilter}
                onChange={e => setSurgeryFilter(e.target.value)}
                className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-700"
              >
                {SURGERY_TYPES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Risk filter tabs */}
            <div className="flex gap-1">
              {RISK_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setRiskFilter(f)}
                  className={clsx(
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                    riskFilter === f
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Surgery</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Day Post-Op</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const risk = getRiskLevel(p.riskScore);
                  const isSelected = p.id === selectedPatientId;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={clsx(
                        'cursor-pointer transition-colors border-l-4',
                        RISK_BORDER[risk.label],
                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.ward} Â· {p.doctor}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.surgeryType}</td>
                      <td className="px-4 py-3 text-gray-600">Day {p.daysPostSurgery}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-900">{p.riskScore}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('text-xs font-bold px-2 py-1 rounded-lg', RISK_BADGE_COLORS[risk.label])}>
                          {risk.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.lastCheckIn}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">No patients match the current filters.</div>
            )}
          </div>
        </div>

        {/* Right: detail panel */}
        <div className="w-96 bg-white rounded-2xl shadow-card p-5 overflow-hidden flex flex-col flex-shrink-0">
          <PatientDetailPanel />
        </div>
      </div>
    </PageLayout>
  );
}
