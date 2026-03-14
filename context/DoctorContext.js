import { createContext, useContext, useState, useEffect } from 'react';

const DoctorContext = createContext(null);

export function DoctorProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // load list of doctors from backend
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('http://localhost:8000/doctors/');
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        } else {
          console.error('Failed to fetch doctors', res.status);
        }
      } catch (err) {
        console.error('Error fetching doctors', err);
      }
    }
    load();
  }, []);

  // hydrate selected doctor from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('selectedDoctor');
    if (stored && !selectedDoctor) {
      try {
        setSelectedDoctor(JSON.parse(stored));
      } catch {
        localStorage.removeItem('selectedDoctor');
      }
    }
  }, [selectedDoctor]);

  const selectDoctor = doc => {
    setSelectedDoctor(doc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedDoctor', JSON.stringify(doc));
    }
  };

  const clearDoctor = () => {
    setSelectedDoctor(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedDoctor');
    }
  };

  return (
    <DoctorContext.Provider value={{ doctors, selectedDoctor, selectDoctor, clearDoctor }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error('useDoctor must be used within DoctorProvider');
  return ctx;
}
