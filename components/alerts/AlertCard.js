import clsx from 'clsx';
import { ESCALATION_TIERS } from '../../config/riskThresholds';
import { useEffect, useState } from 'react';

// Why changed: removed the {tier.emoji} span (ð´ ð  ð¡) from the card header per spec Â§3.
// Tier identity is now communicated purely through the colored badge text and background,
// which is more accessible and consistent with an enterprise SaaS aesthetic.
// The pulse dot for P1 is retained â it's functional (conveys live urgency), not decorative.
//
// Added (inactivity feature): when alert.alertType === 'non-response', a small
// "Non-Response Alert" type label is shown below the trigger phrase. This is purely
// additive â no existing conditional or style was modified.

export default function AlertCard({ alert, isNew }) {
  const tier = ESCALATION_TIERS[alert.tier];
  const [flash, setFlash] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isNew]);

  return (
    <div className={clsx(
      'rounded-2xl border p-4 transition-all duration-300 cursor-pointer group',
      'hover:shadow-card-hover hover:scale-[1.01]',
      alert.tier === 'P1'
        ? 'border-red-200 bg-red-50 hover:shadow-glow'
        : alert.tier === 'P2'
        ? 'border-orange-200 bg-orange-50'
        : 'border-yellow-200 bg-yellow-50',
      flash && 'animate-flash'
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Tier badge â text + color only, no emoji prefix */}
          <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', tier.bg, tier.text)}>
            {tier.label}
          </span>
          {/* Pulse dot retained: functional indicator of live P1 status */}
          {alert.tier === 'P1' && (
            <span className="w-2 h-2 rounded-full bg-critical animate-pulse"></span>
          )}
          {/* Non-response type tag â additive only, shown alongside tier badge */}
          {alert.alertType === 'non-response' && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              Non-Response
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{alert.timestamp}</span>
      </div>

      <div className="font-semibold text-gray-900 text-sm mb-1">{alert.patientName}</div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500">Trigger:</span>
        <span className="text-xs font-semibold text-gray-800 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
          &ldquo;{alert.triggerPhrase}&rdquo;
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{alert.message}</span>
        <span className={clsx(
          'text-xs font-bold px-2 py-1 rounded-lg ml-2 flex-shrink-0',
          alert.riskScore >= 80 ? 'bg-red-100 text-red-700' :
          alert.riskScore >= 60 ? 'bg-orange-100 text-orange-700' :
          'bg-yellow-100 text-yellow-700'
        )}>
          {alert.riskScore}
        </span>
      </div>
    </div>
  );
}
