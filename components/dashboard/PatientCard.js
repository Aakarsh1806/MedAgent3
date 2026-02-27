import clsx from 'clsx';
import { getRiskLevel, INACTIVITY_LEVELS } from '../../config/riskThresholds';
import PatientSparkline from './PatientSparkline';

// Added: import INACTIVITY_LEVELS to drive the last-response row and inactivity badge.
// No existing JSX structure was removed â the new rows are appended inside the card
// below the existing check-in/sparkline row.

// Derives a human-readable "X h ago" string from an ISO timestamp.
// This keeps the display logic self-contained in the card without touching mockApi.
function hoursAgoLabel(isoString) {
  if (!isoString) return null;
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffM = Math.floor((diffMs % 3_600_000) / 60_000);
  if (diffH === 0) return `${diffM}m ago`;
  if (diffM === 0) return `${diffH}h ago`;
  return `${diffH}h ${diffM}m ago`;
}

export default function PatientCard({ patient, isSelected, onClick }) {
  const risk = getRiskLevel(patient.riskScore);

  const borderColors = {
    Critical: 'border-l-critical',
    'High Risk': 'border-l-high-risk',
    Moderate: 'border-l-moderate',
    Stable: 'border-l-stable',
  };

  // Resolve inactivity display config; fall back to 'active' if field is missing.
  const inactivity = INACTIVITY_LEVELS[patient.inactivityLevel] ?? INACTIVITY_LEVELS.active;
  const responseLabel = hoursAgoLabel(patient.lastResponseAt);

  // Only show the inactivity badge for delayed or non-responsive patients â
  // active patients don't need a badge (green text on the response line is enough).
  const showBadge = patient.inactivityLevel === 'non-responsive' || patient.inactivityLevel === 'delayed';

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-4 rounded-2xl border-l-4 border border-gray-100 transition-all duration-200 group',
        borderColors[risk.label],
        isSelected
          ? 'bg-blue-50 border-r-blue-100 border-t-blue-100 border-b-blue-100 shadow-card-hover'
          : 'bg-white hover:bg-gray-50 hover:shadow-card'
      )}
    >
      {/* Row 1: name + risk badge â unchanged */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">{patient.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{patient.surgeryType}</div>
        </div>
        <span className={clsx(
          'ml-2 flex-shrink-0 text-xs font-bold px-2 py-1 rounded-lg',
          risk.badge
        )}>
          {patient.riskScore}
        </span>
      </div>

      {/* Row 2: day + last check-in + sparkline â unchanged */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>Day {patient.daysPostSurgery}</span>
          <span>â¢</span>
          <span>{patient.lastCheckIn}</span>
        </div>
        <PatientSparkline data={patient.sparkline} color={risk.color} />
      </div>

      {/* Row 3 (NEW): last response time + inactivity badge.
          Rendered only when lastResponseAt is present in the data.
          The response time text color changes with inactivity level (green/amber/red).
          The badge appears only for delayed and non-responsive patients. */}
      {responseLabel && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <span className={clsx('text-xs font-medium', inactivity.responseColor)}>
            Last response: {responseLabel}
          </span>
          {showBadge && (
            <span className={clsx(
              'text-xs font-semibold px-2 py-0.5 rounded-full leading-tight',
              inactivity.badgeClass
            )}>
              {patient.inactivityLevel === 'non-responsive' ? 'Non-Responsive' : 'Needs Follow-Up'}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
