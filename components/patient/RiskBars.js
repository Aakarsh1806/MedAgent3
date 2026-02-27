import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { getEngagementColor } from '../../config/riskThresholds';

// Why changed: removed emoji icons (ð©º ð§  ð ð ð) from the INDICATORS array per spec Â§3.
// Labels now use clean typography only â no decorative glyphs next to risk indicators.
// The `icon` field and its <span> render have been deleted; the label <span> now stands alone.
//
// Added (inactivity feature): imported getEngagementColor and added a 6th bar â
// "Engagement Level" â rendered after the existing 5 bars using the same RiskBar
// component. The bar reads patient.engagementScore (0â100) and uses the engagement
// color helper so its color thresholds (>70 green, 40â70 amber, <40 red) are
// config-driven, not hardcoded here.

const INDICATORS = [
  { key: 'painScore',           label: 'Pain Score Trend',        max: 10  },
  { key: 'bertSeverity',        label: 'Symptom Severity (BERT)', max: 100 },
  { key: 'medicationAdherence', label: 'Medication Adherence',    max: 100, invert: true },
  { key: 'daysPostSurgery',     label: 'Days Post Surgery',       max: 14  },
  { key: 'complaintFrequency',  label: 'Complaint Frequency',     max: 100 },
];

function getBarColor(pct, invert = false) {
  const effective = invert ? 100 - pct : pct;
  if (effective >= 80) return 'bg-critical';
  if (effective >= 60) return 'bg-high-risk';
  if (effective >= 40) return 'bg-moderate';
  return 'bg-stable';
}

function RiskBar({ label, value, max, invert, animate, customColor }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct, animate]);

  // customColor allows the engagement bar to supply its own color class
  // without changing the color logic for the existing 5 bars.
  const barColor = customColor ?? getBarColor(pct, invert);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        {/* Label only â no emoji prefix */}
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold text-gray-800">{value}{max === 100 ? '%' : `/${max}`}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-1000 ease-out', barColor)}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function RiskBars({ patient }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [patient.id]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Risk Indicators</h3>
      {INDICATORS.map(ind => (
        <RiskBar
          key={ind.key}
          label={ind.label}
          value={ind.key === 'daysPostSurgery' ? patient.daysPostSurgery : patient[ind.key]}
          max={ind.max}
          invert={ind.invert}
          animate={animate}
        />
      ))}

      {/* Engagement Level bar â added for inactivity monitoring feature.
          Rendered after the existing 5 bars so their order is unchanged.
          Only shown when engagementScore is present in the patient data. */}
      {patient.engagementScore != null && (
        <>
          <div className="border-t border-gray-100 pt-1" />
          <RiskBar
            label="Engagement Level"
            value={patient.engagementScore}
            max={100}
            animate={animate}
            customColor={getEngagementColor(patient.engagementScore)}
          />
        </>
      )}
    </div>
  );
}
