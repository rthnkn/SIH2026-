import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { User, MedicationLog, CognitiveSession, DailyRoutine, HydrationLog, Alert } from '../../types';
import { Pill, Brain, Droplets, CheckCircle, AlertTriangle, Clock, TrendingUp, ArrowRight } from 'lucide-react';

export default function CaregiverDashboard() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [patient, setPatient] = useState<User | null>(null);
  const [medAdherence, setMedAdherence] = useState(0);
  const [cognitiveAvg, setCognitiveAvg] = useState(0);
  const [routineCompletion, setRoutineCompletion] = useState(0);
  const [hydrationCount, setHydrationCount] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [weeklyScores, setWeeklyScores] = useState<number[]>([]);

  useEffect(() => { loadDashboard(); }, [currentUser?.id]);

  const loadDashboard = async () => {
    if (!currentUser) return;
    const patients = await db.users.where('caregiverId').equals(currentUser.id).toArray();
    if (patients.length === 0) return;
    const p = patients[0];
    setPatient(p);

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Medication adherence
    const weekLogs = await db.medicationLogs
      .where('patientId').equals(p.id)
      .and(l => l.scheduledTime >= weekAgo.toISOString().split('T')[0])
      .toArray();
    const taken = weekLogs.filter(l => l.status === 'taken').length;
    setMedAdherence(weekLogs.length > 0 ? Math.round((taken / weekLogs.length) * 100) : 0);

    // Cognitive performance
    const cogSessions = await db.cognitiveSessions.where('patientId').equals(p.id).toArray();
    const recentCog = cogSessions.slice(-10);
    setCognitiveAvg(recentCog.length > 0
      ? Math.round(recentCog.reduce((a, b) => a + b.score, 0) / recentCog.length)
      : 0);

    // Weekly scores
    const dailyScores: number[] = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];
      const daySessions = cogSessions.filter(s => s.completedAt.startsWith(dateStr));
      dailyScores.push(daySessions.length > 0
        ? Math.round(daySessions.reduce((a, b) => a + b.score, 0) / daySessions.length)
        : 0);
    }
    setWeeklyScores(dailyScores);

    // Routine
    const routines = await db.dailyRoutines.where('patientId').equals(p.id).toArray();
    const completed = routines.filter(r => r.completed).length;
    setRoutineCompletion(routines.length > 0 ? Math.round((completed / routines.length) * 100) : 0);

    // Hydration
    const hydLogs = await db.hydrationLogs
      .where('patientId').equals(p.id)
      .and(h => h.timestamp.startsWith(today))
      .toArray();
    setHydrationCount(hydLogs.length);

    // Alerts
    const alerts = await db.alerts
      .where('caregiverId').equals(currentUser.id)
      .and(a => a.status === 'active')
      .toArray();
    setActiveAlerts(alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const alertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      case 'success': return '🟢';
      default: return '⚪';
    }
  };

  const maxWeeklyScore = Math.max(...weeklyScores, 1);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">{t('caregiverDashboard')}</h1>
        <p className="text-gray-500">Overview of patient care and monitoring</p>
      </div>

      {/* Patient Card */}
      {patient && (
        <div className="card-elderly mb-6 bg-gradient-to-r from-primary-50 to-cream-100 border-primary-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
              {patient.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{patient.name}</h2>
              <p className="text-gray-500 text-sm">Age: {patient.age || 'N/A'} • {patient.region}</p>
            </div>
            <button
              onClick={() => navigate('/caregiver/patients')}
              className="btn-secondary text-sm px-4 py-2"
            >
              View Details <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-elderly">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Pill className="text-blue-600" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-gray-600">{t('medicationAdherence')}</h3>
          </div>
          <div className="text-3xl font-extrabold text-gray-800">{medAdherence}%</div>
          <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full ${medAdherence >= 80 ? 'bg-emerald-500' : medAdherence >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${medAdherence}%` }} />
          </div>
        </div>

        <div className="card-elderly">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="text-purple-600" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-gray-600">{t('cognitivePerformance')}</h3>
          </div>
          <div className="text-3xl font-extrabold text-gray-800">{cognitiveAvg}</div>
          <p className="text-xs text-gray-400 mt-1">Avg score (last 10 sessions)</p>
        </div>

        <div className="card-elderly">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-emerald-600" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-gray-600">{t('activityCompletion')}</h3>
          </div>
          <div className="text-3xl font-extrabold text-gray-800">{routineCompletion}%</div>
          <p className="text-xs text-gray-400 mt-1">Daily routine today</p>
        </div>

        <div className="card-elderly">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Droplets className="text-cyan-600" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-gray-600">{t('hydration')}</h3>
          </div>
          <div className="text-3xl font-extrabold text-gray-800">{hydrationCount} <span className="text-lg text-gray-400">/ 6</span></div>
          <p className="text-xs text-gray-400 mt-1">Glasses today</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="card-elderly mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-600" />
          {t('weeklyTrends')} — {t('cognitivePerformance')}
        </h3>
        <div className="flex items-end gap-2 h-36">
          {weeklyScores.map((score, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-500">{score > 0 ? score : ''}</span>
                <div className="w-full rounded-t-lg transition-all" style={{
                  height: `${score > 0 ? (score / maxWeeklyScore) * 100 : 2}%`,
                  backgroundColor: score >= 80 ? '#10b981' : score >= 50 ? '#3b82f6' : score > 0 ? '#f59e0b' : '#e5e7eb',
                }} />
                <span className="text-xs text-gray-400">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="card-elderly">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            {t('recentAlerts')}
          </h3>
          <button
            onClick={() => navigate('/caregiver/alerts')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {t('viewAll')} →
          </button>
        </div>
        <div className="space-y-2">
          {activeAlerts.slice(0, 4).map(alert => (
            <div key={alert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">{alertIcon(alert.severity)}</span>
              <p className="flex-1 text-sm text-gray-700">{alert.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {activeAlerts.length === 0 && (
            <p className="text-center text-gray-400 py-4">No active alerts ✓</p>
          )}
        </div>
      </div>
    </div>
  );
}
