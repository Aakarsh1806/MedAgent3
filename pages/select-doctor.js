import { useEffect } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useDoctor } from '../context/DoctorContext';
import { useRouter } from 'next/router';

export default function SelectDoctorPage() {
  const { doctors, selectDoctor, selectedDoctor } = useDoctor();
  const router = useRouter();

  useEffect(() => {
    // if a doctor is already selected (from storage hydration) go to dashboard
    if (selectedDoctor) {
      router.replace('/');
    }
  }, [selectedDoctor, router]);

  const handleClick = (doc) => {
    selectDoctor(doc);
    router.replace('/');
  };

  return (
    <PageLayout title="Select Doctor">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem-3rem)]">
        <h2 className="text-lg font-semibold mb-4">Choose a doctor to continue</h2>
        <div className="grid grid-cols-1 gap-4 w-full max-w-lg">
          {doctors.map(doc => (
            <button
              key={doc.id}
              onClick={() => handleClick(doc)}
              className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              <div className="font-medium">{doc.name}</div>
              <div className="text-xs text-gray-500">{doc.specialization || ''}</div>
            </button>
          ))}
          {doctors.length === 0 && (
            <div className="text-gray-500 text-center py-8">Loading doctors...</div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
