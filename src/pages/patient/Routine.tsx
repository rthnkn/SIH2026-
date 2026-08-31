import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { DailyRoutine } from '../../types';
import { Check, Clock } from 'lucide-react';

export default function RoutinePage() {
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);

  useEffect(() => { loadRoutines(); }, [currentUser?.id]);

  const loadRoutines = async () => {
    if (!currentUser) return;
    const rtns = await db.dailyRoutines.where('patientId').equals(currentUser.id).toArray();
    setRoutines(rtns.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)));
  };

  const toggleComplete = async (id: string, current: boolean) => {
    await db.dailyRoutines.update(id, {
      completed: !current,
      completedAt: !current ? new Date().toISOString() : undefined,
    });
    loadRoutines();
  };

  const completedCount = routines.filter(r => r.completed).length;
  const totalRoutines = routines.length;
  const now = new Date();
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMin = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHour}:${currentMin}`;

  return (
    <div className="page-container slide-up">
      <div className="mb-6">
        <h1 className="text-elderly-2xl font-extrabold text-gray-900">{t('dailyRoutine')}</h1>
        <p className="text-gray-500">{t('routineSubtitle')}</p>
      </div>

      {/* Progress */}
      <div className="card-elderly mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">{t('completed')}</span>
          <span className="text-sm font-bold text-primary-600">{completedCount}/{totalRoutines}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${totalRoutines > 0 ? (completedCount / totalRoutines) * 100 : 0}%` }}
          />
        </div>
        {completedCount === totalRoutines && totalRoutines > 0 && (
          <p className="text-center text-emerald-600 font-semibold mt-3">🎉 {t('routineComplete')}</p>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[26px] top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-1">
          {routines.map((routine) => {
            const isPast = routine.scheduledTime <= currentTime;
            const isNext = !routine.completed && isPast;
            return (
              <div key={routine.id} className="flex items-center gap-4 relative">
                {/* Timeline dot */}
                <div className={`relative z-10 w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 border-3 ${
                  routine.completed
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : isNext
                    ? 'bg-primary-500 text-white border-primary-400 animate-pulse'
                    : 'bg-white text-gray-300 border-gray-200'
                }`}>
                  {routine.completed ? (
                    <Check size={22} strokeWidth={3} />
                  ) : (
                    <span className="text-xl">{routine.icon}</span>
                  )}
                </div>

                {/* Content */}
                <button
                  onClick={() => toggleComplete(routine.id, routine.completed)}
                  className={`flex-1 card-elderly p-4 flex items-center gap-3 text-left ${
                    routine.completed ? 'bg-emerald-50 border-emerald-200' : isNext ? 'ring-2 ring-primary-300' : ''
                  }`}
                >
                  <span className="text-2xl">{routine.icon}</span>
                  <div className="flex-1">
                    <h3 className={`font-bold ${routine.completed ? 'text-emerald-700' : 'text-gray-800'} text-elderly-base`}>
                      {routine.name}
                    </h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {routine.scheduledTime}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${
                    routine.completed ? 'text-emerald-600' : isNext ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    {routine.completed ? t('completed') : isNext ? '►' : routine.scheduledTime}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
