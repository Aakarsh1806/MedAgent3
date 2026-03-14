import { useState, useEffect } from 'react';
import { X, Activity, Pill, Stethoscope, FileText, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export default function MedicationsModal({ patientId, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchMedicalReport() {
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:8000/patients/${patientId}/full-medical-report`);
                if (!res.ok) throw new Error('Failed to fetch medical report');
                const json = await res.json();
                setData(json);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchMedicalReport();
    }, [patientId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4 sm:p-6">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Full Medical Report</h2>
                            <p className="text-sm text-gray-500">Patient ID: {patientId}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
                            <AlertTriangle size={20} />
                            <p>{error}</p>
                        </div>
                    ) : data ? (
                        <>
                            {/* Section 1: Patient & Medical Overview */}
                            <section>
                                <h3 className="flex items-center gap-2 text-md font-bold text-gray-900 mb-4 border-b pb-2">
                                    <Stethoscope size={18} className="text-gray-500" />
                                    Medical Overview
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Patient</p>
                                        <p className="font-medium">{data.patient_info?.name} ({data.patient_info?.age} yrs, {data.patient_info?.gender})</p>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                        <p className="text-xs text-amber-600 mb-1 font-semibold uppercase tracking-wider">Medical Problem</p>
                                        <p className="font-medium text-amber-900">{data.surgery_report?.medical_problem || 'None explicitly documented'}</p>
                                    </div>
                                    <div className="md:col-span-2 bg-red-50 p-4 rounded-xl border border-red-100">
                                        <p className="text-xs text-red-600 mb-1 font-semibold uppercase tracking-wider">Symptoms</p>
                                        <p className="font-medium text-red-900">{data.surgery_report?.symptoms || 'No symptoms documented'}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Surgery Report */}
                            <section>
                                <h3 className="flex items-center gap-2 text-md font-bold text-gray-900 mb-4 border-b pb-2">
                                    <FileText size={18} className="text-gray-500" />
                                    Surgery Report
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                        <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Summary</p>
                                        <p className="text-sm text-gray-800 leading-relaxed">{data.surgery_report?.report_summary}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                                            <p className="text-xs text-rose-600 mb-2 font-semibold uppercase tracking-wider">Complications</p>
                                            <p className="text-sm text-rose-900 leading-relaxed">{data.surgery_report?.complications}</p>
                                        </div>
                                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                                            <p className="text-xs text-green-600 mb-2 font-semibold uppercase tracking-wider">Recovery Plan</p>
                                            <p className="text-sm text-green-900 leading-relaxed">{data.surgery_report?.recovery_plan}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3: Prescriptions */}
                            <section>
                                <h3 className="flex items-center gap-2 text-md font-bold text-gray-900 mb-4 border-b pb-2">
                                    <Pill size={18} className="text-gray-500" />
                                    Prescriptions
                                </h3>
                                {data.medications?.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.medications.map((med) => (
                                            <div key={med.id} className="flex items-center justify-between bg-white border border-gray-100 shadow-sm p-4 rounded-xl">
                                                <div>
                                                    <p className="font-bold text-gray-900">{med.medicine_name}</p>
                                                    <p className="text-sm text-gray-500">{med.dosage} &bull; {med.frequency}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={clsx(
                                                        "px-2.5 py-1 rounded-full text-xs font-semibold",
                                                        med.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                                    )}>
                                                        {med.is_active ? 'Active' : 'Archived'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center text-gray-500">
                                        No active prescriptions found for this patient.
                                    </div>
                                )}
                            </section>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
