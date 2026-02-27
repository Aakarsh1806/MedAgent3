import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import {
  LayoutDashboard,
  UserRound,
  BarChart3,
  Pill,
  Siren,
  Settings,
  HeartPulse,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDoctor } from '../../context/DoctorContext';

// Why changed:
// 1. Replaced all emoji/symbol icons (â ð¥ ð ð ð¨ âï¸) with semantic Lucide React
//    icons (LayoutDashboard, UserRound, BarChart3, Pill, Siren, Settings) per spec Â§1B.
// 2. Converted from setActiveNav() context state to next/router Link-based navigation
//    so each nav item routes to its own page (spec Â§4).
// 3. Active route is derived from router.pathname â no manual state needed.
// 4. Removed the ð¥ emoji from the logo mark; replaced with HeartPulse Lucide icon
//    for a professional medical SaaS look.

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',   href: '/',             Icon: LayoutDashboard },
  { id: 'patients',    label: 'Patients',    href: '/patients',     Icon: UserRound },
  { id: 'analytics',   label: 'Analytics',   href: '/analytics',    Icon: BarChart3 },
  { id: 'medications', label: 'Medications', href: '/medications',  Icon: Pill },
  { id: 'alerts',      label: 'Alerts',      href: '/alerts',       Icon: Siren },
  { id: 'settings',    label: 'Settings',    href: '/settings',     Icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();
  const { alerts } = useApp();
  const { selectedDoctor } = useDoctor();
  const p1Count = alerts.filter(a => a.tier === 'P1').length;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-30 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-glow-blue">
            {/* HeartPulse replaces the ð¥ emoji â more professional, monochrome-safe */}
            <HeartPulse size={18} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-base leading-tight">MedAgent</div>
            <div className="text-xs text-gray-400 font-medium">AI Monitoring System</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, href, Icon }) => {
          // Active when pathname matches exactly (dashboard = '/') or starts with href
          const isActive =
            href === '/'
              ? router.pathname === '/'
              : router.pathname.startsWith(href);

          return (
            <Link
              key={id}
              href={href}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-primary shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )}
            >
              {/* Icon animates slightly on hover via group-hover scale â subtle, not distracting */}
              <Icon
                size={18}
                strokeWidth={isActive ? 2 : 1.75}
                className={clsx(
                  'flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-primary' : 'text-gray-400'
                )}
              />
              <span>{label}</span>
              {id === 'alerts' && p1Count > 0 && (
                <span className="ml-auto bg-critical text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {p1Count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {selectedDoctor ? selectedDoctor.name.split(' ').map(n => n[0]).join('') : ''}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">
              {selectedDoctor?.name || 'Loading...'}
            </div>
            <div className="text-xs text-gray-400">
              {selectedDoctor?.specialization || ''}
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-stable flex-shrink-0"></div>
        </div>
      </div>
    </aside>
  );
}
