import dynamic from 'next/dynamic';
import { useApp } from '../../context/AppContext';
import { useEffect, useState } from 'react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const DAYS = Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`);

function isBehindRecovery(symptom, benchmark) {
  const last3Symptom = symptom.slice(-3);
  const last3Bench = benchmark.slice(-3);
  return last3Symptom.some((v, i) => v > last3Bench[i] + 10);
}

export default function RecoveryChart({ patient }) {
  const { isSimulating } = useApp();
  const [visibleDays, setVisibleDays] = useState(14);

  useEffect(() => {
    if (isSimulating) {
      setVisibleDays(1);
      let day = 1;
      const interval = setInterval(() => {
        day++;
        setVisibleDays(day);
        if (day >= 14) clearInterval(interval);
      }, 250);
      return () => clearInterval(interval);
    } else {
      setVisibleDays(14);
    }
  }, [isSimulating]);

  const symptomSlice = patient.symptomHistory.slice(0, visibleDays);
  const benchmarkSlice = patient.benchmarkHistory.slice(0, visibleDays);
  const daysSlice = DAYS.slice(0, visibleDays);
  const behind = isBehindRecovery(patient.symptomHistory, patient.benchmarkHistory);

  const options = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      animations: { enabled: true, speed: 400 },
      background: 'transparent',
    },
    stroke: {
      curve: 'smooth',
      width: [3, 2],
      dashArray: [0, 6],
    },
    colors: ['#FF4D4F', '#52C41A'],
    xaxis: {
      categories: daysSlice,
      labels: { style: { fontSize: '11px', colors: '#9CA3AF' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: { style: { fontSize: '11px', colors: '#9CA3AF' } },
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 4,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      labels: { colors: '#6B7280' },
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => `${val} pts` },
    },
    markers: { size: 0 },
  };

  const series = [
    { name: 'Patient Symptoms', data: symptomSlice },
    { name: 'Benchmark Recovery', data: benchmarkSlice },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">14-Day Recovery Analytics</h3>
        {behind && (
          <span className="flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full animate-fade-in">
            â ï¸ Behind Expected Recovery
          </span>
        )}
      </div>
      <Chart
        type="line"
        series={series}
        options={options}
        height={200}
      />
    </div>
  );
}
