import { useApp } from '../../context/AppContext';
import AlertCard from './AlertCard';
import WhatsAppPreview from './WhatsAppPreview';

// Added (inactivity feature): InactivityLegend component rendered below WhatsAppPreview.
// It is a self-contained, minimal legend â no props needed, no state.
// The existing alert feed and WhatsApp preview are completely unchanged.

function InactivityLegend() {
  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        Response Status
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
          <span><span className="font-medium">Active</span> â responded within 2 h</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 flex-shrink-0" />
          <span><span className="font-medium">Delayed</span> â 2â6 h since last response</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
          <span><span className="font-medium">Non-Responsive</span> â over 6 h</span>
        </div>
      </div>
    </div>
  );
}

export default function EscalationPanel() {
  const { alerts, newAlertId } = useApp();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-700">Live Alerts</h2>
          <span className="w-2 h-2 rounded-full bg-critical animate-pulse"></span>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{alerts.length} active</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {alerts.map(alert => (
          <AlertCard
            key={alert.id}
            alert={alert}
            isNew={alert.id === newAlertId}
          />
        ))}
      </div>

      <WhatsAppPreview />

      {/* Inactivity legend â additive, placed after WhatsApp preview */}
      <InactivityLegend />
    </div>
  );
}
