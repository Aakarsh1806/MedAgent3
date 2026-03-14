import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getRiskLevel, INACTIVITY_LEVELS } from '../../config/riskThresholds';
import RiskGauge from './RiskGauge';
import RiskBars from './RiskBars';
import RecoveryChart from './RecoveryChart';
import AdherenceHeatmap from './AdherenceHeatmap';
import BotChat from './BotChat';
import MedicationTracker from './MedicationTracker'; // Kept as fallback if needed for route
import MedicationsModal from './MedicationsModal';
import { UserRound, Send } from 'lucide-react';
import clsx from 'clsx';

// Why changed:
// 1. Removed emoji icons (ð ð¤ ð) from the TABS array per spec Â§3 â tabs now use
//    clean text labels only, consistent with the enterprise SaaS visual standard.
// 2. Replaced the ð¤ emoji in the empty-state placeholder with a Lucide UserRound icon.
//
// Added (inactivity feature):
// - Imported INACTIVITY_LEVELS and Send icon.
// - In the overview tab, when the selected patient is delayed or non-responsive,
//   a small inactivity status row is shown below the patient header with a
//   "Send Reminder" button. Clicking it calls sendNudge() from context.
// - When nudgedPatients contains this patient's ID, a "Reminder Sent" badge
//   replaces the button. This is purely additive â no existing JSX was modified.

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'chat', label: 'Bot Chat' },
  { id: 'medications', label: 'Medications' },
];

export default function PatientDetailPanel() {
  const { selectedPatient, activeTab, setActiveTab, nudgedPatients, sendNudge } = useApp();
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);

  if (!selectedPatient) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          {/* Lucide icon replaces ð¤ emoji */}
          <UserRound size={40} className="mx-auto mb-2 text-gray-300" strokeWidth={1.25} />
          <div className="text-sm">Select a patient to view details</div>
        </div>
      </div>
    );
  }

  const risk = getRiskLevel(selectedPatient.riskScore);
  const inactivity = INACTIVITY_LEVELS[selectedPatient.inactivityLevel];
  const isInactive = selectedPatient.inactivityLevel === 'delayed' || selectedPatient.inactivityLevel === 'non-responsive';
  const isNudged = nudgedPatients.has(selectedPatient.id);

  return (
    <div className="flex flex-col h-full animate-slide-in">
      {/* Patient Header â unchanged */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white',
            selectedPatient.riskScore >= 80 ? 'bg-critical' :
              selectedPatient.riskScore >= 60 ? 'bg-high-risk' :
                selectedPatient.riskScore >= 40 ? 'bg-moderate' : 'bg-stable'
          )}>
            {selectedPatient.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-gray-900">{selectedPatient.name}</div>
            <div className="text-sm text-gray-500">{selectedPatient.surgeryType} Â· {selectedPatient.ward}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              Day {selectedPatient.daysPostSurgery} Â· {selectedPatient.doctor} Â· Last: {selectedPatient.lastCheckIn}
            </div>
          </div>
        </div>
        <span className={clsx('text-xs font-bold px-3 py-1.5 rounded-xl', risk.badge)}>
          {risk.label}
        </span>
      </div>

      {/* Inactivity status row (NEW) â only rendered for delayed/non-responsive patients.
          Sits between the patient header and the tab bar so it's always visible in
          the overview context without disrupting the tab layout below. */}
      {isInactive && inactivity && (
        <div className={clsx(
          'flex items-center justify-between px-3 py-2 rounded-xl mb-3 border text-xs',
          selectedPatient.inactivityLevel === 'non-responsive'
            ? 'bg-red-50 border-red-200'
            : 'bg-orange-50 border-orange-200'
        )}>
          <div className="flex items-center gap-2">
            <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', inactivity.dotClass)} />
            <span className={clsx('font-semibold', inactivity.responseColor)}>
              {inactivity.label}
            </span>
            <span className="text-gray-400">Â· Engagement: {selectedPatient.engagementScore}%</span>
          </div>
          {/* Nudge button / Reminder Sent badge */}
          {isNudged ? (
            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-green-100 text-green-700">
              Reminder Sent
            </span>
          ) : (
            <button
              onClick={() => sendNudge(selectedPatient.id)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Send size={11} />
              Send Reminder
            </button>
          )}
        </div>
      )}

      {/* Tabs â text only, no emoji icons */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'medications') {
                setIsMedModalOpen(true);
              } else {
                setActiveTab(tab.id);
              }
            }}
            className={clsx(
              'flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200',
              (activeTab === tab.id && tab.id !== 'medications') || (isMedModalOpen && tab.id === 'medications')
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content â unchanged */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Risk Gauge + Bars */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-4">
                <RiskGauge score={selectedPatient.riskScore} trendAlert={selectedPatient.trendAlert} />
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <RiskBars patient={selectedPatient} />
              </div>
            </div>

            {/* Recovery Chart */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
              <RecoveryChart patient={selectedPatient} />
            </div>

            {/* Adherence Heatmap */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
              <AdherenceHeatmap history={selectedPatient.adherenceHistory} />
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-full flex flex-col animate-fade-in" style={{ minHeight: '400px' }}>
            <BotChat patient={selectedPatient} />
          </div>
        )}

        {activeTab === 'medications' && !isMedModalOpen && (
          <div className="animate-fade-in">
            <MedicationTracker patient={selectedPatient} />
          </div>
        )}
      </div>

      {/* Medications Modal Overlay */}
      {isMedModalOpen && (
        <MedicationsModal
          patientId={selectedPatient.id}
          onClose={() => setIsMedModalOpen(false)}
        />
      )}
    </div>
  );
}
