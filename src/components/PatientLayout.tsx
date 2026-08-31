import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import ConnectivityBanner from './ConnectivityBanner';
import { Home, Pill, Brain, Droplets, Calendar, BarChart3, Mic, Settings } from 'lucide-react';

const navItems = [
  { key: 'navHome', path: '/app', icon: Home },
  { key: 'navMedicines', path: '/app/medicines', icon: Pill },
  { key: 'navBrain', path: '/app/brain', icon: Brain },
  { key: 'navRoutine', path: '/app/routine', icon: Calendar },
  { key: 'navHydration', path: '/app/hydration', icon: Droplets },
  { key: 'navProgress', path: '/app/progress', icon: BarChart3 },
  { key: 'navAssistant', path: '/app/assistant', icon: Mic },
  { key: 'navSettings', path: '/app/settings', icon: Settings },
];

export default function PatientLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const isGame = location.pathname.includes('/brain/memory-match') ||
    location.pathname.includes('/brain/pattern') ||
    location.pathname.includes('/brain/object') ||
    location.pathname.includes('/brain/routine-recall');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ConnectivityBanner />
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>
      {!isGame && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="max-w-lg mx-auto flex justify-around items-center py-1 px-1">
            {navItems.map(({ key, path, icon: Icon }) => {
              const isActive = path === '/app'
                ? location.pathname === '/app'
                : location.pathname.startsWith(path);
              return (
                <button
                  key={key}
                  onClick={() => navigate(path)}
                  className={`flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl transition-all min-w-[64px]
                    ${isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-400 hover:text-primary-500'
                    }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium leading-tight">{t(key)}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
