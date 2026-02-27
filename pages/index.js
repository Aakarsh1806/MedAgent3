import PageLayout from '../components/layout/PageLayout';
import KpiCards from '../components/dashboard/KpiCard';
import PatientList from '../components/dashboard/PatientList';
import PatientDetailPanel from '../components/patient/PatientDetailPanel';
import EscalationPanel from '../components/alerts/EscalationPanel';
import { useApp } from '../context/AppContext';
import { useDoctor } from '../context/DoctorContext';
import { usePatient } from '../context/PatientContext';

// Why changed: replaced the inline Sidebar + Header + Head shell with the shared
// PageLayout wrapper (spec Â§5). The dashboard content itself is unchanged.

export default function Dashboard() {
  const { kpi } = useApp();
  const { patients } = usePatient();
  const { selectedDoctor } = useDoctor();

  // ensure kpi.totalPatients remains accurate (AppContext syncs via effect)

  return (
    <PageLayout title="Dashboard">
      <div className="h-[calc(100vh-4rem-3rem)] flex flex-col gap-5">
        {/* KPI Row */}
        <KpiCards kpi={kpi} />

        {/* Main 3-column layout */}
        <div className="flex-1 grid grid-cols-12 gap-5 min-h-0">
          {/* Patient List â 3 cols */}
          <div className="col-span-3 bg-white rounded-2xl shadow-card p-4 overflow-hidden flex flex-col">
            <PatientList />
          </div>

          {/* Patient Detail â 6 cols */}
          <div className="col-span-6 bg-white rounded-2xl shadow-card p-5 overflow-hidden flex flex-col">
            <PatientDetailPanel />
          </div>

          {/* Escalation Panel â 3 cols */}
          <div className="col-span-3 bg-white rounded-2xl shadow-card p-4 overflow-hidden flex flex-col">
            <EscalationPanel />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
