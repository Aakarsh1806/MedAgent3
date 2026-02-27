import { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { RISK_THRESHOLDS } from '../config/riskThresholds';
import { Save, Building2 } from 'lucide-react';
import clsx from 'clsx';

// Settings page: risk threshold sliders, escalation rule config, notification toggles,
// demo mode toggle, and hospital info form. Frontend only â no backend persistence.

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 border border-gray-100">
      <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0',
          checked ? 'bg-primary' : 'bg-gray-200'
        )}
        aria-pressed={checked}
      >
        <span className={clsx(
          'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )} />
      </button>
    </div>
  );
}

function ThresholdSlider({ label, value, min, max, color, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={clsx('font-bold', color)}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-gray-200 accent-primary cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [criticalMin, setCriticalMin] = useState(RISK_THRESHOLDS.CRITICAL.min);
  const [highMin, setHighMin] = useState(RISK_THRESHOLDS.HIGH.min);
  const [moderateMin, setModerateMin] = useState(RISK_THRESHOLDS.MODERATE.min);

  const [notifications, setNotifications] = useState({
    whatsapp: true,
    email: true,
    sms: false,
    inApp: true,
  });

  const [escalation, setEscalation] = useState({
    autoEscalateP1: true,
    requireAck: true,
    notifyOnMissedDose: true,
    dailySummary: false,
  });

  const [demoMode, setDemoMode] = useState(true);

  const [hospital, setHospital] = useState({
    name: 'City General Hospital',
    department: 'Post-Surgical Care Unit',
    contact: 'admin@citygeneral.org',
    timezone: 'America/New_York',
  });

  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <PageLayout title="Settings">
      <div className="max-w-3xl space-y-5">

        {/* Risk Thresholds */}
        <SectionCard title="Risk Score Thresholds">
          <div className="space-y-5">
            <ThresholdSlider
              label="Critical threshold (min score)"
              value={criticalMin}
              min={70}
              max={95}
              color="text-critical"
              onChange={setCriticalMin}
            />
            <ThresholdSlider
              label="High Risk threshold (min score)"
              value={highMin}
              min={50}
              max={criticalMin - 1}
              color="text-orange-500"
              onChange={setHighMin}
            />
            <ThresholdSlider
              label="Moderate threshold (min score)"
              value={moderateMin}
              min={20}
              max={highMin - 1}
              color="text-yellow-600"
              onChange={setModerateMin}
            />
            <p className="text-xs text-gray-400">
              Stable: 0 â {moderateMin - 1} &nbsp;Â·&nbsp;
              Moderate: {moderateMin} â {highMin - 1} &nbsp;Â·&nbsp;
              High Risk: {highMin} â {criticalMin - 1} &nbsp;Â·&nbsp;
              Critical: {criticalMin}+
            </p>
          </div>
        </SectionCard>

        {/* Escalation Rules */}
        <SectionCard title="Escalation Rules">
          <Toggle
            label="Auto-escalate P1 alerts"
            description="Immediately notify attending physician for P1 events"
            checked={escalation.autoEscalateP1}
            onChange={v => setEscalation(e => ({ ...e, autoEscalateP1: v }))}
          />
          <Toggle
            label="Require acknowledgement"
            description="Alerts remain open until manually acknowledged by a clinician"
            checked={escalation.requireAck}
            onChange={v => setEscalation(e => ({ ...e, requireAck: v }))}
          />
          <Toggle
            label="Notify on missed dose"
            description="Trigger alert when patient misses 2+ consecutive doses"
            checked={escalation.notifyOnMissedDose}
            onChange={v => setEscalation(e => ({ ...e, notifyOnMissedDose: v }))}
          />
          <Toggle
            label="Daily summary report"
            description="Send a daily digest of all patient statuses at 8:00 AM"
            checked={escalation.dailySummary}
            onChange={v => setEscalation(e => ({ ...e, dailySummary: v }))}
          />
        </SectionCard>

        {/* Notification Channels */}
        <SectionCard title="Notification Channels">
          <Toggle label="WhatsApp" description="Send alerts via WhatsApp Business API" checked={notifications.whatsapp} onChange={v => setNotifications(n => ({ ...n, whatsapp: v }))} />
          <Toggle label="Email" description="Send alerts to registered physician email" checked={notifications.email} onChange={v => setNotifications(n => ({ ...n, email: v }))} />
          <Toggle label="SMS" description="Send SMS fallback for critical alerts" checked={notifications.sms} onChange={v => setNotifications(n => ({ ...n, sms: v }))} />
          <Toggle label="In-app notifications" description="Show notification bell alerts in dashboard" checked={notifications.inApp} onChange={v => setNotifications(n => ({ ...n, inApp: v }))} />
        </SectionCard>

        {/* Demo Mode */}
        <SectionCard title="Demo Mode">
          <Toggle
            label="Enable demo mode"
            description="Show demo buttons (Trigger Critical, Simulate Recovery) in the header"
            checked={demoMode}
            onChange={setDemoMode}
          />
        </SectionCard>

        {/* Hospital Info */}
        <SectionCard title="Hospital Information">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={15} className="text-gray-400" strokeWidth={1.75} />
              <span className="text-xs text-gray-500">Frontend only â changes are not persisted</span>
            </div>
            {[
              { key: 'name', label: 'Hospital Name' },
              { key: 'department', label: 'Department' },
              { key: 'contact', label: 'Admin Contact Email' },
              { key: 'timezone', label: 'Timezone' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  type="text"
                  value={hospital[key]}
                  onChange={e => setHospital(h => ({ ...h, [key]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-800"
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
              saved
                ? 'bg-stable text-white'
                : 'bg-primary text-white hover:bg-blue-600 active:scale-95'
            )}
          >
            <Save size={15} strokeWidth={2} />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
