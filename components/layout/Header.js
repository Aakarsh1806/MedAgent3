import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useDoctor } from '../../context/DoctorContext';
import { Search, Bell, Volume2, VolumeX, Moon, Sun, Zap, Play } from 'lucide-react';
import { useRouter } from 'next/router';

// Why changed:
// 1. Replaced all emoji icons (ð ð ð âï¸ ð ð¨ â¶) with semantic Lucide React icons
//    (Search, Bell, Volume2, VolumeX, Moon, Sun, Zap, Play) â cleaner, scalable, no
//    platform-dependent emoji rendering.
// 2. Kept all existing functionality (triggerCriticalEvent, simulateRecovery, sound toggle,
//    dark mode toggle UI) â only the icon rendering changed.

export default function Header() {
  const { triggerCriticalEvent, simulateRecovery } = useApp();
  const [soundOn, setSoundOn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const { selectedDoctor, clearDoctor } = useDoctor();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-100 flex items-center px-6 z-20 shadow-sm">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search patients, alerts..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Demo Buttons */}
      <div className="flex items-center gap-2 mx-4">
        <button
          onClick={triggerCriticalEvent}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-critical text-xs font-semibold rounded-lg border border-red-200 transition-all hover:shadow-sm active:scale-95"
        >
          {/* Zap replaces ð¨ â conveys urgency without emoji */}
          <Zap size={13} strokeWidth={2.5} />
          <span>Trigger Critical</span>
        </button>
        <button
          onClick={simulateRecovery}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary text-xs font-semibold rounded-lg border border-blue-200 transition-all hover:shadow-sm active:scale-95"
        >
          {/* Play replaces â¶ text character */}
          <Play size={13} strokeWidth={2.5} />
          <span>Simulate Recovery</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Sound Toggle */}
        <button
          onClick={() => setSoundOn(!soundOn)}
          title={soundOn ? 'Mute notifications' : 'Enable notification sound'}
          className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all border border-gray-200"
        >
          {soundOn
            ? <Volume2 size={16} strokeWidth={1.75} />
            : <VolumeX size={16} strokeWidth={1.75} />
          }
        </button>

        {/* Dark Mode Toggle (UI only) */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle dark mode (UI only)"
          className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all border border-gray-200"
        >
          {darkMode
            ? <Sun size={16} strokeWidth={1.75} />
            : <Moon size={16} strokeWidth={1.75} />
          }
        </button>

        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all border border-gray-200">
          <Bell size={16} strokeWidth={1.75} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full border border-white"></span>
        </button>

        {/* Doctor Avatar with dropdown */}
        <div ref={menuRef} className="relative">
          <div
            onClick={() => setMenuOpen(prev => !prev)}
            className="flex items-center gap-2 pl-2 border-l border-gray-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {selectedDoctor ? selectedDoctor.name.split(' ').map(n => n[0]).join('') : ''}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-gray-800">
                {selectedDoctor?.name || 'Loading...'}
              </div>
              <div className="text-xs text-gray-400">
                {selectedDoctor?.specialization || ''}
              </div>
            </div>
          </div>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  clearDoctor();
                  router.replace('/select-doctor');
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Switch Doctor
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
