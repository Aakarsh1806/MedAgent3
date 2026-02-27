import { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useApp } from '../context/AppContext';
import { ESCALATION_TIERS } from '../config/riskThresholds';
import clsx from 'clsx';

// Alerts page: dedicated escalation center with P1/P2/P3 filter tabs,
// status (Open/Resolved), and escalation log history.

const TIER_FILTERS = ['All', 'P1', 'P2', 'P3'];
const STATUS_FILTERS = ['All', 'Open', 'Resolved'];

export default function AlertsPage() {
  const { alerts } = useApp();
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Augment alerts with a mock status field for display purposes
  const augmented = alerts.map((a, i) => ({
    ...a,
    status: i % 3 === 2 ? 'Resolved' : 'Open',
  }));

  const filtered = augmented.filter(a => {
    const matchTier = tierFilter === 'All' || a.tier === tierFilter;
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchTier && matchStatus;
  });

  const TIER_COLORS = {
    P1: { badge: 'bg-red-100 text-red-700', row: 'border-l-critical bg-red-50/40' },
    P2: { badge: 'bg-orange-100 text-orange-700', row: 'border-l-high-risk bg-orange-50/40' },
    P3: { badge: 'bg-yellow-100 text-yellow-700', row: 'border-l-moderate bg-yellow-50/20' },
  };

  const STATUS_COLORS = {
    Open:     'bg-green-100 text-green-700',
    Resolved: 'bg-gray-100 text-gray-500',
  };

  return (
    <PageLayout title="Alerts">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          {/* Tier filter */}
          <div className="flex gap-1">
            {TIER_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setTierFilter(f)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  tierFilter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200" />

          {/* Status filter */}
          <div className="flex gap-1">
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  statusFilter === f ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs text-gray-400">{filtered.length} alert{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tier</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trigger Phrase</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk Score</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(alert => {
              const tc = TIER_COLORS[alert.tier];
              return (
                <tr
                  key={alert.id}
                  className={clsx('border-l-4 transition-colors hover:bg-gray-50', tc.row)}
                >
                  <td className="px-5 py-3">
                    <span className={clsx('text-xs font-bold px-2 py-1 rounded-lg', tc.badge)}>
                      {ESCALATION_TIERS[alert.tier].label}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">{alert.patientName}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded-lg">
                      &ldquo;{alert.triggerPhrase}&rdquo;
                    </span>
                  </td>
                  <td className="px-5 py-3 font-bold text-gray-900">{alert.riskScore}</td>
                  <td className="px-5 py-3">
                    <span className={clsx('text-xs font-semibold px-2 py-1 rounded-lg', STATUS_COLORS[alert.status])}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{alert.timestamp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No alerts match the current filters.</div>
        )}
      </div>
    </PageLayout>
  );
}
