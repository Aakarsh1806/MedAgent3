import { getWhatsapp } from '../../lib/mockApi';

export default function WhatsAppPreview() {
  const wa = getWhatsapp();

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-xs">ð±</span>
        </div>
        <span className="text-xs font-semibold text-gray-700">WhatsApp Notification Sent</span>
        <span className="ml-auto text-xs text-gray-400">{wa.sentAt}</span>
      </div>

      {/* WhatsApp mockup */}
      <div className="bg-[#ECE5DD] rounded-xl p-3">
        <div className="bg-white rounded-xl rounded-tl-sm p-3 shadow-sm max-w-[90%]">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">M</div>
            <span className="text-xs font-bold text-primary">MedAgent</span>
          </div>
          <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
            {wa.message}
          </pre>
          <div className="flex items-center justify-end gap-1 mt-2">
            <span className="text-xs text-gray-400">{wa.sentAt}</span>
            <span className="text-blue-500 text-xs">ââ</span>
          </div>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400 text-center">
        Sent to {wa.doctorName} Â· {wa.doctorPhone}
      </div>
    </div>
  );
}
