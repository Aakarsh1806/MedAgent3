import clsx from 'clsx';
import { Bot, FileText, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// Why changed (spec Â§2):
// - Removed ALL animation logic: TypingDots component, SEQUENCE_DELAYS array,
//   playSequence(), clearTimers(), visibleCount state, showTyping state,
//   isPlaying state, timersRef, and the useEffect that auto-played on mount.
// - Removed the "Replay Conversation" button and the "BERT Severity Updated" badge
//   that appeared at the end of the animation sequence.
// - Removed the fake read-only input bar at the bottom (it implied interactivity).
// - Replaced with a static, fully-visible transcript view â all messages shown at once.
// - Added "Conversation Transcript â Doctor Reference View" badge at the top.
// - Replaced ð¤ emoji avatar with Lucide Bot icon for consistency.
// - This view is calm, read-only, and clinical â appropriate for a doctor reference panel.

function ChatBubble({ msg }) {
  const isBot = msg.sender === 'bot';
  return (
    <div className={clsx('flex gap-2', isBot ? 'justify-start' : 'justify-end')}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot size={14} className="text-primary" strokeWidth={2} />
        </div>
      )}
      <div className={clsx(
        'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm',
        isBot
          ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
          : 'bg-primary text-white rounded-tr-sm'
      )}>
        {msg.message}
        <div className={clsx('text-xs mt-1', isBot ? 'text-gray-400' : 'text-blue-200')}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

export default function BotChat({ patient }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef();

  // fetch history when patient changes
  useEffect(() => {
    if (!patient) return;
    async function load() {
      try {
        const res = await fetch(`http://localhost:8000/messages/${patient.id}`);
        if (res.ok) {
          const data = await res.json();
          // transform to display format
          const formatted = data.map(m => ({
            sender: m.sender,
            message: m.message_text,
            time: new Date(m.timestamp).toLocaleTimeString(),
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error('failed to load messages', err);
      }
    }
    load();
  }, [patient]);

  // scroll to bottom whenever messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !patient) return;
    const text = input.trim();
    // optimistically add patient message
    setMessages(prev => [
      ...prev,
      { sender: 'patient', message: text, time: new Date().toLocaleTimeString() },
    ]);
    setInput('');
    try {
      const res = await fetch('http://localhost:8000/webhook/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_number: patient.phone,
          message_body: text,
        }),
      });
      const json = await res.json();
      if (json.reply) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', message: json.reply, time: new Date().toLocaleTimeString() },
        ]);
      }
    } catch (err) {
      console.error('whatsapp webhook error', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <FileText size={15} className="text-gray-400" strokeWidth={1.75} />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Conversation
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 bg-gray-50 rounded-2xl p-4 min-h-0"
      >
        {messages.map((msg, i) => (
          <ChatBubble key={i} msg={msg} />
        ))}
      </div>

      {/* Input bar */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
          onKeyDown={e => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-primary rounded-xl text-white hover:bg-primary-dark transition"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
