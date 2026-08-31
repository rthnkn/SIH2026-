import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuthStore } from '../store/auth';
import { Brain, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { login, loadDemo } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const user = await login(email, password);
    if (user) {
      navigate(user.role === 'caregiver' ? '/caregiver' : '/app');
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  const handleDemo = async (role: 'patient' | 'caregiver') => {
    setLoading(true);
    await loadDemo();
    if (role === 'caregiver') {
      // Switch to caregiver user
      const { db } = await import('../data/db');
      const caregiver = await db.users.get('caregiver-1');
      if (caregiver) {
        useAuthStore.getState().logout();
        useAuthStore.setState({ currentUser: caregiver, isAuthenticated: true });
      }
    }
    navigate(role === 'caregiver' ? '/caregiver' : '/app');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-cream-50 to-cream-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Brain className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('appName')}</h1>
          <p className="text-gray-500 mt-1">{t('loginSubtitle')}</p>
        </div>

        {/* Login Form */}
        <div className="card-elderly p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-elderly"
                placeholder="ramesh@demo.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-elderly pr-12"
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-medium">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
              {loading ? t('loading') : t('login')}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center mb-4 font-medium">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDemo('patient')}
                disabled={loading}
                className="btn-secondary text-sm py-3"
              >
                👤 {t('patient')}
                <span className="block text-xs text-gray-400 font-normal">ramesh@demo.com</span>
              </button>
              <button
                onClick={() => handleDemo('caregiver')}
                disabled={loading}
                className="btn-secondary text-sm py-3"
              >
                👨‍⚕️ {t('caregiver')}
                <span className="block text-xs text-gray-400 font-normal">anita@demo.com</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">{t('disclaimer')}</p>
      </div>
    </div>
  );
}
