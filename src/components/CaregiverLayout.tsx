import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuthStore } from '../store/auth';
import ConnectivityBanner from './ConnectivityBanner';
import {
  LayoutDashboard, Users, Pill, Brain, Bell, FileText, Settings, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { key: 'navDashboard', path: '/caregiver', icon: LayoutDashboard },
  { key: 'navPatients', path: '/caregiver/patients', icon: Users },
  { key: 'navMedicines', path: '/caregiver/medications', icon: Pill },
  { key: 'navBrain', path: '/caregiver/cognitive', icon: Brain },
  { key: 'navAlerts', path: '/caregiver/alerts', icon: Bell },
  { key: 'navReports', path: '/caregiver/reports', icon: FileText },
  { key: 'navSettings', path: '/caregiver/settings', icon: Settings },
];

export default function CaregiverLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { currentUser, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-primary-700">MindCare AI</h1>
          <p className="text-xs text-gray-500 mt-1">{t('caregiverDashboard')}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ key, path, icon: Icon }) => {
            const isActive = path === '/caregiver'
              ? location.pathname === '/caregiver'
              : location.pathname.startsWith(path);
            return (
              <button
                key={key}
                onClick={() => { navigate(path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{t(key)}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
              {currentUser?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">{t('caregiver')}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <ConnectivityBanner />
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-bold text-primary-700">MindCare AI</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
