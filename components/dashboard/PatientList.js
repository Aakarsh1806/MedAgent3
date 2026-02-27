import { useApp } from '../../context/AppContext';
import PatientCard from './PatientCard';

export default function PatientList() {
  const { patients, selectedPatientId, setSelectedPatientId } = useApp();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Patients</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{patients.length} total</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {patients.map(patient => (
          <PatientCard
            key={patient.id}
            patient={patient}
            isSelected={selectedPatientId === patient.id}
            onClick={() => setSelectedPatientId(patient.id)}
          />
        ))}
      </div>
    </div>
  );
}
