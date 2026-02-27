import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Users, AlertTriangle, Activity, CalendarDays, Bell } from 'lucide-react';

// Why changed: replaced emoji icon strings with Lucide React icon components
// (Users, AlertTriangle, Activity, CalendarDays, Bell) per spec Â§1A.
// Removed the rounded-xl bg blob wrapper â icon now sits inline with the label row,
// keeping the card minimal and semantically meaningful.

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const CARD_CONFIGS = {
  totalPatients: {
    label: 'Total Patients',
    Icon: Users,
    color: 'text-primary',
    border: 'border-blue-100',
  },
  critical: {
    label: 'Critical',
    Icon: AlertTriangle,
    color: 'text-critical',
    border: 'border-red-100',
  },
  highRisk: {
    label: 'High Risk',
    Icon: Activity,
    color: 'text-orange-500',
    border: 'border-orange-100',
  },
  avgRecoveryDay: {
    label: 'Avg Recovery Day',
    Icon: CalendarDays,
    color: 'text-purple-600',
    border: 'border-purple-100',
  },
  activeAlerts: {
    label: 'Active Alerts',
    Icon: Bell,
    color: 'text-critical',
    border: 'border-red-100',
  },
};

function KpiCard({ metricKey, value, suffix = '' }) {
  const count = useCountUp(value);
  const cfg = CARD_CONFIGS[metricKey];
  const { Icon } = cfg;

  return (
    <div className={clsx(
      'bg-white rounded-2xl p-5 border shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in',
      cfg.border
    )}>
      {/* Icon + Live badge row â icon is semantic Lucide, no decorative blob */}
      <div className="flex items-center justify-between mb-3">
        <Icon size={20} className="text-gray-400" strokeWidth={1.75} />
        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Live</span>
      </div>
      <div className={clsx('text-3xl font-bold mb-1', cfg.color)}>
        {count}{suffix}
      </div>
      <div className="text-sm text-gray-500 font-medium">{cfg.label}</div>
    </div>
  );
}

export default function KpiCards({ kpi }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <KpiCard metricKey="totalPatients" value={kpi.totalPatients} />
      <KpiCard metricKey="critical" value={kpi.critical} />
      <KpiCard metricKey="highRisk" value={kpi.highRisk} />
      <KpiCard metricKey="avgRecoveryDay" value={kpi.avgRecoveryDay} suffix=" days" />
      <KpiCard metricKey="activeAlerts" value={kpi.activeAlerts} />
    </div>
  );
}
