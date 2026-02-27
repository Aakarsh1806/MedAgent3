import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function PatientSparkline({ data, color }) {
  const options = {
    chart: {
      type: 'line',
      sparkline: { enabled: true },
      animations: { enabled: true, speed: 800 },
    },
    stroke: { curve: 'smooth', width: 2 },
    colors: [color],
    tooltip: { enabled: false },
  };

  return (
    <div className="w-20 h-8">
      <Chart
        type="line"
        series={[{ data }]}
        options={options}
        height={32}
        width={80}
      />
    </div>
  );
}
