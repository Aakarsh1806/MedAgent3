import dynamic from 'next/dynamic';
import clsx from 'clsx';
import { getRiskLevel } from '../../config/riskThresholds';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function RiskGauge({ score, trendAlert }) {
  const risk = getRiskLevel(score);
  const isCritical = score >= 80;

  const options = {
    chart: {
      type: 'radialBar',
      animations: { enabled: true, speed: 1000, animateGradually: { enabled: true, delay: 150 } },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: '60%' },
        track: { background: '#F5F7FA', strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: '28px',
            fontWeight: '700',
            color: risk.color,
            offsetY: 8,
            formatter: (val) => Math.round(val),
          },
        },
      },
    },
    fill: { colors: [risk.color] },
    stroke: { lineCap: 'round' },
    labels: ['Risk Score'],
  };

  return (
    <div className="flex flex-col items-center">
      <div className={clsx(
        'relative rounded-full',
        isCritical && 'animate-pulse-critical'
      )}>
        <Chart
          type="radialBar"
          series={[score]}
          options={options}
          height={200}
          width={200}
        />
      </div>
      <div className="text-center -mt-2">
        <span className={clsx('text-sm font-bold px-3 py-1 rounded-full', risk.badge)}>
          {risk.label}
        </span>
        {trendAlert && (
          <div className="mt-2 flex items-center gap-1.5 bg-red-50 border border-red-200 text-critical text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
            <span>â ï¸</span>
            <span>TREND ALERT</span>
          </div>
        )}
      </div>
    </div>
  );
}
