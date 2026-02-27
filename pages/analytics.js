import dynamic from 'next/dynamic';
import PageLayout from '../components/layout/PageLayout';
import { useApp } from '../context/AppContext';
import { getRiskLevel } from '../config/riskThresholds';

// Analytics page: risk distribution, recovery benchmark comparison, adherence trend,
// and readmission reduction projection. All charts use ApexCharts via dynamic import.

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const { patients } = useApp();

  // Risk distribution counts
  const riskCounts = patients.reduce((acc, p) => {
    const label = getRiskLevel(p.riskScore).label;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const riskDistOptions = {
    chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: true } },
    colors: ['#FF4D4F', '#FA8C16', '#FADB14', '#52C41A'],
    plotOptions: { bar: { borderRadius: 8, distributed: true, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: ['Critical', 'High Risk', 'Moderate', 'Stable'],
      labels: { style: { colors: '#6B7280', fontSize: '12px' } },
    },
    yaxis: { labels: { style: { colors: '#6B7280', fontSize: '12px' } } },
    grid: { borderColor: '#F3F4F6', strokeDashArray: 4 },
    tooltip: { y: { formatter: v => `${v} patient${v !== 1 ? 's' : ''}` } },
  };

  const riskDistSeries = [{
    name: 'Patients',
    data: [
      riskCounts['Critical'] || 0,
      riskCounts['High Risk'] || 0,
      riskCounts['Moderate'] || 0,
      riskCounts['Stable'] || 0,
    ],
  }];

  // Recovery benchmark comparison â average patient vs benchmark across 14 days
  const avgSymptom = Array.from({ length: 14 }, (_, i) =>
    Math.round(patients.reduce((s, p) => s + (p.symptomHistory[i] || 0), 0) / patients.length)
  );
  const avgBenchmark = Array.from({ length: 14 }, (_, i) =>
    Math.round(patients.reduce((s, p) => s + (p.benchmarkHistory[i] || 0), 0) / patients.length)
  );
  const days = Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`);

  const recoveryOptions = {
    chart: { type: 'line', toolbar: { show: false }, animations: { enabled: true } },
    colors: ['#FF4D4F', '#52C41A'],
    stroke: { width: [2.5, 2], dashArray: [0, 6], curve: 'smooth' },
    xaxis: { categories: days, labels: { style: { colors: '#6B7280', fontSize: '11px' } } },
    yaxis: { labels: { style: { colors: '#6B7280', fontSize: '11px' } }, title: { text: 'Risk Score', style: { color: '#9CA3AF', fontSize: '11px' } } },
    legend: { position: 'top', labels: { colors: '#6B7280' } },
    grid: { borderColor: '#F3F4F6', strokeDashArray: 4 },
    tooltip: { shared: true, intersect: false },
    markers: { size: 0 },
  };

  const recoverySeries = [
    { name: 'Avg Patient Symptom Score', data: avgSymptom },
    { name: 'Benchmark Recovery', data: avgBenchmark },
  ];

  // Adherence trend â per-patient adherence %
  const adherenceData = patients.map(p => {
    const history = p.adherenceHistory || [];
    const taken = history.filter(v => v === 1).length;

    return history.length? Math.round((taken / history.length) * 100): 0;
  });

  const adherenceOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    colors: ['#1677FF'],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: patients.map(p => p.name.split(' ')[0]),
      labels: { style: { colors: '#6B7280', fontSize: '11px' } },
    },
    yaxis: {
      max: 100,
      labels: { formatter: v => `${v}%`, style: { colors: '#6B7280', fontSize: '11px' } },
    },
    grid: { borderColor: '#F3F4F6', strokeDashArray: 4 },
    tooltip: { y: { formatter: v => `${v}%` } },
  };

  // Readmission reduction projection â mock 6-month trend
  const projectionOptions = {
    chart: { type: 'area', toolbar: { show: false }, animations: { enabled: true } },
    colors: ['#1677FF'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.02 } },
    stroke: { width: 2.5, curve: 'smooth' },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      labels: { style: { colors: '#6B7280', fontSize: '12px' } },
    },
    yaxis: {
      labels: { formatter: v => `${v}%`, style: { colors: '#6B7280', fontSize: '12px' } },
      title: { text: 'Readmission Rate', style: { color: '#9CA3AF', fontSize: '11px' } },
    },
    grid: { borderColor: '#F3F4F6', strokeDashArray: 4 },
    dataLabels: { enabled: false },
    markers: { size: 4, colors: ['#1677FF'], strokeWidth: 0 },
    tooltip: { y: { formatter: v => `${v}%` } },
  };

  const projectionSeries = [{ name: 'Readmission Rate', data: [18, 15, 13, 11, 9, 7] }];

  return (
    <PageLayout title="Analytics">
      <div className="space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-5">
          <SectionCard
            title="Risk Distribution"
            subtitle="Current patient population by risk tier"
          >
            <Chart type="bar" series={riskDistSeries} options={riskDistOptions} height={220} />
          </SectionCard>

          <SectionCard
            title="Recovery Benchmark Comparison"
            subtitle="Average patient symptom score vs expected recovery curve"
          >
            <Chart type="line" series={recoverySeries} options={recoveryOptions} height={220} />
          </SectionCard>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-5">
          <SectionCard
            title="Medication Adherence by Patient"
            subtitle="14-day adherence rate per patient"
          >
            <Chart type="bar" series={[{ name: 'Adherence', data: adherenceData }]} options={adherenceOptions} height={220} />
          </SectionCard>

          <SectionCard
            title="Readmission Reduction Projection"
            subtitle="Projected 30-day readmission rate with AI monitoring (mock)"
          >
            <Chart type="area" series={projectionSeries} options={projectionOptions} height={220} />
          </SectionCard>
        </div>
      </div>
    </PageLayout>
  );
}
