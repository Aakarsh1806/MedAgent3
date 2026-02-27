import dynamic from 'next/dynamic';
import PageLayout from '../components/layout/PageLayout';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function PatientMedCard({ patient }) {
  const meds = patient.medications || [];

  const active = meds.filter(m => m.is_active).length;
  const inactive = meds.filter(m => !m.is_active).length;

  const total = meds.length;
  const adherencePct = total === 0 ? 0 : Math.round((active / total) * 100);

  const donutOptions = {
    chart: { type: 'donut', sparkline: { enabled: true } },
    colors: ['#52C41A', '#FF4D4F'],
    labels: ['Active', 'Inactive'],
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 0 },
    tooltip: { enabled: false },
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-semibold text-gray-900">{patient.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {patient.doctor?.name}
          </div>
        </div>

        <div className="w-14 h-14">
          <Chart
            type="donut"
            series={[active, inactive]}
            options={donutOptions}
            height={56}
            width={56}
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Adherence</span>
          <span className="font-semibold text-gray-800">
            {adherencePct}%
          </span>
        </div>

        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-700',
              adherencePct >= 80
                ? 'bg-stable'
                : adherencePct >= 60
                ? 'bg-moderate'
                : 'bg-critical'
            )}
            style={{ width: `${adherencePct}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {meds.map((med) => (
          <div
            key={med.id}
            className={clsx(
              'flex items-center justify-between px-3 py-2 rounded-xl border text-sm',
              med.is_active
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            )}
          >
            <div className="flex items-center gap-2">
              {med.is_active ? (
                <CheckCircle2 size={14} className="text-green-500" />
              ) : (
                <XCircle size={14} className="text-red-500" />
              )}

              <span className="font-medium text-gray-800">
                {med.medicine_name}
              </span>
            </div>

            <div className="text-xs text-gray-400">
              {med.frequency}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MedicationsPage() {
  const { patients } = useApp();

  const totalActive = patients.reduce(
    (s, p) => s + (p.medications || []).filter(m => m.is_active).length,
    0
  );

  const totalInactive = patients.reduce(
    (s, p) => s + (p.medications || []).filter(m => !m.is_active).length,
    0
  );

  const totalMeds = patients.reduce(
    (s, p) => s + (p.medications || []).length,
    0
  );

  const overallAdherence =
    totalMeds === 0 ? 0 : Math.round((totalActive / totalMeds) * 100);

  return (
    <PageLayout title="Medications">
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl shadow-card p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">
            {overallAdherence}%
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            Overall Adherence
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-4 border border-red-100">
          <div className="text-2xl font-bold text-critical">
            {totalInactive}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            Inactive Medications
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-4 border border-green-100">
          <div className="text-2xl font-bold text-stable">
            {totalActive}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            Active Medications
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
        {patients.map(p => (
          <PatientMedCard key={p.id} patient={p} />
        ))}
      </div>
    </PageLayout>
  );
}