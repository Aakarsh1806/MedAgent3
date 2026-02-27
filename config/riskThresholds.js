export const RISK_THRESHOLDS = {
  CRITICAL: { min: 80, max: 100, label: 'Critical', color: '#FF4D4F', bg: 'bg-red-50', border: 'border-critical', text: 'text-critical', badge: 'bg-red-100 text-red-700' },
  HIGH:     { min: 60, max: 79,  label: 'High Risk', color: '#FA8C16', bg: 'bg-orange-50', border: 'border-high-risk', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  MODERATE: { min: 40, max: 59,  label: 'Moderate',  color: '#FADB14', bg: 'bg-yellow-50', border: 'border-moderate', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
  STABLE:   { min: 0,  max: 39,  label: 'Stable',    color: '#52C41A', bg: 'bg-green-50', border: 'border-stable', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
};

export function getRiskLevel(score) {
  if (score >= RISK_THRESHOLDS.CRITICAL.min) return RISK_THRESHOLDS.CRITICAL;
  if (score >= RISK_THRESHOLDS.HIGH.min)     return RISK_THRESHOLDS.HIGH;
  if (score >= RISK_THRESHOLDS.MODERATE.min) return RISK_THRESHOLDS.MODERATE;
  return RISK_THRESHOLDS.STABLE;
}

export const ESCALATION_TIERS = {
  P1: { label: 'P1 Immediate', emoji: 'ð´', color: '#FF4D4F', bg: 'bg-red-50', text: 'text-red-700' },
  P2: { label: 'P2 Scheduled', emoji: 'ð ', color: '#FA8C16', bg: 'bg-orange-50', text: 'text-orange-700' },
  P3: { label: 'P3 Monitor',   emoji: 'ð¡', color: '#FADB14', bg: 'bg-yellow-50', text: 'text-yellow-700' },
};

// Added: inactivity monitoring thresholds and display config.
// Used by PatientCard (badge), RiskBars (engagement bar color), and InactivityLegend.
// Thresholds are in hours; label/badge classes follow the existing Tailwind color system.
export const INACTIVITY_LEVELS = {
  active: {
    label: 'Active',
    maxHours: 2,
    badgeClass: 'bg-green-100 text-green-700',
    dotClass: 'bg-green-500',
    responseColor: 'text-green-600',
  },
  delayed: {
    label: 'Inactive â Needs Follow-Up',
    minHours: 2,
    maxHours: 6,
    badgeClass: 'bg-orange-100 text-orange-700',
    dotClass: 'bg-orange-400',
    responseColor: 'text-orange-500',
  },
  'non-responsive': {
    label: 'Non-Responsive',
    minHours: 6,
    badgeClass: 'bg-red-100 text-red-700',
    dotClass: 'bg-red-500',
    responseColor: 'text-red-600',
  },
};

// Engagement score bar color thresholds (mirrors getBarColor logic in RiskBars).
// >70 = green (good), 40â70 = amber (watch), <40 = red (poor).
export function getEngagementColor(score) {
  if (score > 70) return 'bg-stable';
  if (score >= 40) return 'bg-moderate';
  return 'bg-critical';
}
