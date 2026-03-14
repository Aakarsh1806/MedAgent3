import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePatient } from './PatientContext';


// Why changed: removed activeNav and setActiveNav from context state.
// Navigation is now handled by next/router in Sidebar.js â the context no longer
// needs to track which nav item is active. All other state is unchanged.
//
// Added (inactivity feature): nudgedPatients (Set of patient IDs) and sendNudge action.
// sendNudge marks a patient as nudged for 10 seconds, simulating a reminder being sent.
// This is purely frontend state â no backend call is made.

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // patients + selection are handled by PatientContext; we read them below
  const { patients, selectedPatientId, setSelectedPatientId, selectedPatient } = usePatient();
  const [alerts, setAlerts] = useState([]); // still static/demo only
  const [kpi, setKpi] = useState({ totalPatients: 0, critical: 0, highRisk: 0, avgRecoveryDay: 0, activeAlerts: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [isSimulating, setIsSimulating] = useState(false);
  const [newAlertId, setNewAlertId] = useState(null);
  // nudgedPatients: Set of patient IDs that have had a reminder sent in this session.
  const [nudgedPatients, setNudgedPatients] = useState(new Set());

  // selectedPatient comes from PatientContext, but we keep the variable name
  // above when we destructured usePatient();



  // sendNudge: adds patientId to nudgedPatients for 10 s, then removes it.
  // The PatientDetailPanel reads nudgedPatients to show the "Reminder Sent" badge.
  const sendNudge = useCallback((patientId) => {
    setNudgedPatients(prev => new Set([...prev, patientId]));
    setTimeout(() => {
      setNudgedPatients(prev => {
        const next = new Set(prev);
        next.delete(patientId);
        return next;
      });
    }, 10_000);
  }, []);

  // keep kpi.totalPatients updated when patient list changes
  useEffect(() => {
    if (!patients || patients.length === 0) {
      setKpi({
        totalPatients: 0,
        critical: 0,
        highRisk: 0,
        avgRecoveryDay: 0,
        activeAlerts: 0,
      });
      return;
    }

    const totalPatients = patients.length;

    const critical = patients.filter(p => p.riskScore >= 80).length;

    const highRisk = patients.filter(
      p => p.riskScore >= 60 && p.riskScore < 80
    ).length;

    const avgRecoveryDay = Math.round(patients.reduce((sum, p) => sum + (p.daysPostSurgery || 0), 0) /totalPatients);

  // If alerts come from backend later, update this accordingly
    const activeAlerts = patients.filter(p => p.riskScore >= 80).length;

    setKpi({
      totalPatients,
      critical,
      highRisk,
      avgRecoveryDay,
      activeAlerts,
    });
  }, [patients]);

  return (
    <AppContext.Provider
      value={{
        patients,
        alerts,
        kpi,
        selectedPatientId,
        setSelectedPatientId,
        selectedPatient,
        activeTab,
        setActiveTab,
        isSimulating,
        // simulateRecovery and triggerCriticalEvent removed
        newAlertId,
        nudgedPatients,
        sendNudge,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
