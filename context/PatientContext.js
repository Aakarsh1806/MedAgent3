import { createContext, useContext, useState, useEffect } from 'react';
import { useDoctor } from './DoctorContext';
//import mockData from '../data/mockData.json';

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const { selectedDoctor } = useDoctor();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // whenever the selected doctor changes we "fetch" patient list
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selectedDoctor) {
      setPatients([]);
      setSelectedPatientId(null);
      return;
    }

    async function loadPatients() {
      try {
      const res = await fetch(
        `http://localhost:8000/patients/?doctor_id=${selectedDoctor.id}`
      );

      const data = await res.json();

    // 🔥 Transform backend data into UI structure
      const transformed = data.map((p, index) => ({
        id: p.id,
        name: p.name,

  // UI-only display fields
        ward: `Ward-${(index % 3) + 1}`,
        doctor: selectedDoctor.name,
        surgeryType: "General Surgery",
        daysPostSurgery: Math.floor(Math.random() * 10) + 1,
        riskScore: Math.floor(Math.random() * 100),
        lastCheckIn: new Date().toLocaleTimeString(),

  // Recovery chart fields
        symptomHistory: Array.from({ length: 14 }, () =>
          Math.floor(Math.random() * 10) + 1
        ),
        benchmarkHistory: Array.from({ length: 14 }, () => 5),

  // Medication tracker / heatmap
        medicationHistory: Array.from({ length: 14 }, () =>
          Math.random() > 0.3 ? 1 : 0
        ),

  // 🔥 REQUIRED for analytics page
        adherenceHistory: Array.from({ length: 14 }, () =>
          Math.random() > 0.3 ? 1 : 0
        ),
      }));

      setPatients(transformed);
      setSelectedPatientId(transformed[0]?.id || null);
    } catch (err) {
      console.error("failed to load patients", err);
      setPatients([]);
      setSelectedPatientId(null);
    }
  }

    loadPatients();
  }, [selectedDoctor]);

  const selectedPatient =
    patients.find(p => p.id === selectedPatientId) || null;

  return (
    <PatientContext.Provider
      value={{ patients, selectedPatientId, setSelectedPatientId, selectedPatient }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient must be used within PatientProvider');
  return ctx;
}
