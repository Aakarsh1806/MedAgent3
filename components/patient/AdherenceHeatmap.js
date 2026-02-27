import clsx from 'clsx';

const DAY_LABELS = ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','D14'];

function getSquareClass(val) {
  if (val === 1) return 'bg-stable';
  if (val === 0) return 'bg-critical';
  return 'bg-gray-200';
}

export default function AdherenceHeatmap({ history = [] }) {
  const safeHistory = history || [];

  const taken = safeHistory.filter(v => v === 1).length;

  const pct = safeHistory.length
    ? Math.round((taken / safeHistory.length) * 100)
    : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Adherence</span>
        <span>{pct}%</span>
      </div>

      {/* Squares */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: 'repeat(14, 1fr)' }}
      >
        {safeHistory.map((val, i) => (
          <div
            key={i}
            title={`Day ${i + 1}: ${
              val === 1 ? 'Taken' : val === 0 ? 'Missed' : 'Upcoming'
            }`}
            className={`h-4 rounded ${
              val === 1
                ? 'bg-green-500'
                : val === 0
                ? 'bg-red-400'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}