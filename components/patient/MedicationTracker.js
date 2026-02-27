import dynamic from 'next/dynamic';
import clsx from 'clsx';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Smartphone } from 'lucide-react';

// Why changed: replaced emoji status icons (â â â° â ï¸ ð±) with Lucide React icons
// (CheckCircle2, XCircle, Clock, AlertTriangle, Smartphone) per spec Â§3.
// Icons are sized at 16px and colored via className â consistent with the rest of the
// Lucide icon system used across the app. No other logic changed.

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const STATUS_CONFIG = {
  taken:    { Icon: CheckCircle2, label: 'Taken',    color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', iconColor: 'text-green-500' },
  missed:   { Icon: XCircle,      label: 'Missed',   color: 'text-red-700',   bg: 'bg-red-50',   border: 'border-red-200',   iconColor: 'text-red-500'   },
  upcoming: { Icon: Clock,        label: 'Upcoming', color: 'text-blue-700',  bg: 'bg-blue-50',  border: 'border-blue-200',  iconColor: 'text-blue-400'  },
};

export default function MedicationTracker({ patient }) {
  const meds = patient.medications;
  const taken = meds.filter(m => m.status === 'taken').length;
  const missed = meds.filter(m => m.status === 'missed').length;
  const upcoming = meds.filter(m => m.status === 'upcoming').length;
  const adherencePct = Math.round((taken / meds.length) * 100);

  const consecutiveMissed = (() => {
    let count = 0;
    for (let i = patient.adherenceHistory.length - 1; i >= 0; i--) {
      if (patient.adherenceHistory[i] === 0) count++;
      else break;
    }
    return count;
  })();

  const donutOptions = {
    chart: { type: 'donut', animations: { enabled: true, speed: 800 } },
    colors: ['#52C41A', '#FF4D4F', '#E5E7EB'],
    labels: ['Taken', 'Missed', 'Upcoming'],
    legend: { position: 'bottom', fontSize: '12px', labels: { colors: '#6B7280' } },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Adherence',
              fontSize: '12px',
              color: '#6B7280',
              formatter: () => `${adherencePct}%`,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: { y: { formatter: (val) => `${val} dose(s)` } },
  };

  return (
    <div className="space-y-4">
      {/* Warning banner â AlertTriangle replaces â ï¸ */}
      {consecutiveMissed >= 2 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-fade-in">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" strokeWidth={2} />
          <div>
            <div className="text-sm font-semibold text-red-700">{consecutiveMissed} Consecutive Missed Doses</div>
            <div className="text-xs text-red-500">Doctor has been notified</div>
          </div>
        </div>
      )}

      {/* Reminder badge â Smartphone replaces ð± */}
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
        <Smartphone size={15} className="text-blue-400 flex-shrink-0" strokeWidth={1.75} />
        <span className="text-sm text-blue-700 font-medium">Reminder Sent â 2:35 PM via WhatsApp</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Donut chart */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Overall Adherence</h4>
          <Chart
            type="donut"
            series={[taken, missed, upcoming]}
            options={donutOptions}
            height={220}
          />
        </div>

        {/* Medication list */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Today&apos;s Doses</h4>
          {meds.map((med, i) => {
            const cfg = STATUS_CONFIG[med.status];
            const { Icon } = cfg;
            return (
              <div
                key={i}
                className={clsx(
                  'flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:shadow-sm',
                  cfg.bg, cfg.border
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Lucide icon replaces emoji status icon */}
                  <Icon size={16} className={cfg.iconColor} strokeWidth={2} />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{med.name}</div>
                    <div className="text-xs text-gray-500">{med.time}</div>
                  </div>
                </div>
                <span className={clsx('text-xs font-semibold px-2 py-1 rounded-lg', cfg.bg, cfg.color)}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
