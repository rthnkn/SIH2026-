import { useI18n, languageNames } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { useNavigate } from 'react-router-dom';
import type { SupportedLanguage } from '../../types';
import { Globe, LogOut, Shield, Info, User, MapPin } from 'lucide-react';

export default function SettingsPage() {
  const { t, language, setLanguage } = useI18n();
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="page-container slide-up">
      <h1 className="text-elderly-2xl font-extrabold text-gray-900 mb-6">{t('settings')}</h1>

      {/* Profile */}
      <div className="card-elderly mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 text-2xl font-bold">
            {currentUser?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-elderly-lg font-bold text-gray-800">{currentUser?.name}</h2>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              <User size={14} /> {currentUser?.role === 'patient' ? t('patient') : t('caregiver')}
              {currentUser?.age && ` • Age ${currentUser.age}`}
            </p>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="card-elderly mb-4">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Globe size={18} className="text-primary-600" /> {t('language')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(languageNames) as [SupportedLanguage, string][]).map(([code, name]) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`p-4 rounded-2xl text-left transition-all ${
                language === code
                  ? 'bg-primary-50 border-2 border-primary-500 text-primary-700 font-semibold'
                  : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
              }`}
            >
              <span className="text-elderly-base">{name}</span>
              {language === code && <span className="ml-2 text-primary-500">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Region */}
      <div className="card-elderly mb-4">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <MapPin size={18} className="text-primary-600" /> {t('region')}
        </h3>
        <p className="text-gray-600">{currentUser?.region || t('nereRegion')}</p>
      </div>

      {/* Security */}
      <div className="card-elderly mb-4">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Shield size={18} className="text-primary-600" /> Security
        </h3>
        <p className="text-sm text-gray-500">Your data is stored locally on this device and encrypted. Role-based access ensures you can only see your own information.</p>
      </div>

      {/* About */}
      <div className="card-elderly mb-6">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Info size={18} className="text-primary-600" /> {t('about')}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          MindCare AI v1.0 — SIH26003 Prototype
        </p>
        <p className="text-xs text-gray-400">
          {t('disclaimer')}
        </p>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="btn-danger w-full">
        <LogOut size={20} /> {t('logout')}
      </button>
    </div>
  );
}
