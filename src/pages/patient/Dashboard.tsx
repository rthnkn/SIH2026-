import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { Medication, DailyRoutine, MedicationLog, HydrationLog, Appointment } from '../../types';
import { Pill, Brain, Droplets, Calendar, Mic, Clock, Check } from 'lucide-react';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);
  const [hydrationCount, setHydrationCount] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [markingMed, setMarkingMed] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [currentUser?.id]);

  const loadData = async () => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    const [meds, logs, rtns, hyd, apts] = await Promise.all([
      db.medications.where('patientId').equals(currentUser.id).and(m => m.active).toArray(),
      db.medicationLogs.where('patientId').equals(currentUser.id).and(l => l.scheduledTime.startsWith(today)).toArray(),
      db.dailyRoutines.where('patientId').equals(currentUser.id).toArray(),
      db.hydrationLogs.where('patientId').equals(currentUser.id).and(h => h.timestamp.startsWith(today)).toArray(),
      db.appointments.where('patientId').equals(currentUser.id).toArray(),
    ]);
    setMedications(meds);
    setTodayLogs(logs);
    setRoutines(rtns);
    setHydrationCount(hyd.length);
    setAppointments(apts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const firstName = currentUser?.name?.split(' ')[0] || '';

  // Calculate medication stats
  const totalMedsToday = todayLogs.length;
  const takenMedsToday = todayLogs.filter(l => l.status === 'taken').length;

  // Find next upcoming medication
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const pendingLogs = todayLogs
    .filter(l => l.status === 'pending')
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  const nextMed = pendingLogs[0];
  const nextMedInfo = nextMed ? medications.find(m => m.id === nextMed.medicationId) : null;

  // Routine stats
  const completedRoutines = routines.filter(r => r.completed).length;
  const totalRoutines = routines.length;

  // Next appointment
  const upcomingApt = appointments.find(a => new Date(a.date) >= new Date(now.toISOString().split('T')[0]));

  const handleMarkTaken = async (logId: string) => {
    setMarkingMed(logId);
    const now = new Date().toISOString();
    await db.medicationLogs.update(logId, { status: 'taken', takenAt: now });
    await loadData();
    setMarkingMed(null);
  };

  return (
    <div className="page-container slide-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-elderly-3xl font-extrabold text-gray-900">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-elderly-base">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Next Up */}
      {nextMedInfo && (
        <div className="card-elderly bg-gradient-to-r from-primary-50 to-cream-100 border-primary-200 mb-6">
          <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-3">{t('nextUp')}</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              💊
            </div>
            <div className="flex-1">
              <h3 className="text-elderly-lg font-bold text-gray-800">{nextMedInfo.name}</h3>
              <p className="text-gray-500 text-elderly-base">{nextMedInfo.dosage} • {nextMed.scheduledTime}</p>
            </div>
            <button
              onClick={() => handleMarkTaken(nextMed.id)}
              disabled={markingMed === nextMed.id}
              className="btn-success text-base px-6"
            >
              {markingMed === nextMed.id ? '...' : t('markTaken')} ✓
            </button>
          </div>
        </div>
      )}

      {/* Today's Care */}
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('todaysCare')}</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Medicines */}
        <button onClick={() => navigate('/app/medicines')} className="card-interactive p-5 text-left">
          <div className="text-2xl mb-2">💊</div>
          <h3 className="font-bold text-gray-800 text-elderly-base">{t('myMedicines')}</h3>
          <p className="text-gray-500 text-sm mt-1">
            {takenMedsToday} / {totalMedsToday} {t('medicinesCompleted')}
          </p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${totalMedsToday > 0 ? (takenMedsToday / totalMedsToday) * 100 : 0}%` }}
            />
          </div>
        </button>

        {/* Hydration */}
        <button onClick={() => navigate('/app/hydration')} className="card-interactive p-5 text-left">
          <div className="text-2xl mb-2">💧</div>
          <h3 className="font-bold text-gray-800 text-elderly-base">{t('hydration')}</h3>
          <p className="text-gray-500 text-sm mt-1">{hydrationCount} / 6 {t('glassesCompleted')}</p>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full ${i < hydrationCount ? 'bg-cyan-400' : 'bg-gray-100'}`} />
            ))}
          </div>
        </button>

        {/* Brain Activity */}
        <button onClick={() => navigate('/app/brain')} className="card-interactive p-5 text-left">
          <div className="text-2xl mb-2">🧠</div>
          <h3 className="font-bold text-gray-800 text-elderly-base">{t('brainActivity')}</h3>
          <p className="text-gray-500 text-sm mt-1">
            {completedRoutines < totalRoutines ? `1 ${t('activityRemaining')}` : t('routineComplete')}
          </p>
        </button>

        {/* Appointment */}
        <button onClick={() => navigate('/app/appointments')} className="card-interactive p-5 text-left">
          <div className="text-2xl mb-2">📅</div>
          <h3 className="font-bold text-gray-800 text-elderly-base">{t('appointment')}</h3>
          <p className="text-gray-500 text-sm mt-1">
            {upcomingApt
              ? `${upcomingApt.date} • ${upcomingApt.time}`
              : t('noAppointments')
            }
          </p>
        </button>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('quickActions')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: t('myMedicines'), icon: '💊', path: '/app/medicines', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
          { label: t('brainCare'), icon: '🧠', path: '/app/brain', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
          { label: t('drinkWater'), icon: '💧', path: '/app/hydration', color: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700' },
          { label: t('navAppointments'), icon: '📅', path: '/app/appointments', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' },
          { label: t('askAssistant'), icon: '🔊', path: '/app/assistant', color: 'bg-rose-50 hover:bg-rose-100 text-rose-700' },
          { label: t('navRoutine'), icon: '📋', path: '/app/routine', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
        ].map(({ label, icon, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl transition-all active:scale-[0.97] ${color}`}
          >
            <span className="text-3xl">{icon}</span>
            <span className="font-semibold text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* Medical Disclaimer */}
      <div className="mt-8 p-4 bg-gray-50 rounded-2xl text-xs text-gray-400 text-center">
        {t('disclaimer')}
      </div>
    </div>
  );
}
