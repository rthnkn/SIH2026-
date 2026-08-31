import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { HydrationLog } from '../../types';
import { Plus, Droplets } from 'lucide-react';

const DAILY_TARGET = 6;

export default function HydrationPage() {
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [logs, setLogs] = useState<HydrationLog[]>([]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => { loadLogs(); }, [currentUser?.id]);

  const loadLogs = async () => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = await db.hydrationLogs
      .where('patientId').equals(currentUser.id)
      .and(h => h.timestamp.startsWith(today))
      .toArray();
    setLogs(todayLogs.sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
  };

  const addWater = async () => {
    if (!currentUser || logs.length >= DAILY_TARGET) return;
    setAnimating(true);
    await db.hydrationLogs.add({
      id: `hyd-${Date.now()}`,
      patientId: currentUser.id,
      amount: 250,
      timestamp: new Date().toISOString(),
    });
    await loadLogs();
    setTimeout(() => setAnimating(false), 500);
  };

  const count = logs.length;
  const percentage = Math.round((count / DAILY_TARGET) * 100);

  return (
    <div className="page-container slide-up">
      <div className="mb-6">
        <h1 className="text-elderly-2xl font-extrabold text-gray-900">{t('todaysHydration')}</h1>
        <p className="text-gray-500">{t('dailyTarget')}: {DAILY_TARGET} {t('glasses')}</p>
      </div>

      {/* Main Display */}
      <div className="card-elderly text-center py-10 mb-6 bg-gradient-to-b from-cyan-50 to-cream-100 border-cyan-200">
        <div className="text-8xl mb-4">💧</div>
        <div className="text-6xl font-extrabold text-cyan-600 mb-2">
          {count} <span className="text-2xl text-cyan-400">/ {DAILY_TARGET}</span>
        </div>
        <p className="text-gray-500 text-elderly-base mb-6">{t('glassesCompleted')}</p>

        {/* Water glass visualization */}
        <div className="flex justify-center gap-3 mb-8">
          {Array.from({ length: DAILY_TARGET }).map((_, i) => (
            <div
              key={i}
              className={`w-12 h-16 rounded-b-2xl rounded-t-lg border-2 transition-all duration-500 flex items-center justify-center text-2xl ${
                i < count
                  ? 'bg-cyan-400 border-cyan-500 text-white'
                  : 'bg-white border-gray-200'
              } ${i === count - 1 && animating ? 'animate-bounce' : ''}`}
            >
              {i < count ? '💧' : ''}
            </div>
          ))}
        </div>

        {/* Add Water Button */}
        <button
          onClick={addWater}
          disabled={count >= DAILY_TARGET}
          className={`btn-primary text-xl px-10 py-5 rounded-full shadow-xl ${
            count >= DAILY_TARGET ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'hover:scale-105'
          }`}
        >
          {count >= DAILY_TARGET ? '✅ Goal Reached!' : (
            <>
              <Droplets size={24} className="inline mr-2" />
              + {t('drinkWater')}
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="card-elderly mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">{t('dailyTarget')}</span>
          <span className="text-sm font-bold text-cyan-600">{percentage}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Today's Log */}
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Today's Log</h2>
      <div className="space-y-2">
        {logs.map(log => (
          <div key={log.id} className="card-elderly p-4 flex items-center gap-3">
            <span className="text-2xl">💧</span>
            <div className="flex-1">
              <p className="font-medium text-gray-800">250 ml</p>
              <p className="text-sm text-gray-400">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <span className="badge-success text-xs">✓</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No water logged yet today.</p>
            <p className="text-sm">Tap the button above to start tracking!</p>
          </div>
        )}
      </div>
    </div>
  );
}
