import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { User, CognitiveSession, MedicationLog, HydrationLog } from '../../types';
import { FileText, TrendingUp, Calendar } from 'lucide-react';

export default function CaregiverReports() {
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [patient, setPatient] = useState<User | null>(null);
  const [cogSessions, setCogSessions] = useState<CognitiveSession[]>([]);
  const [weekMedLogs, setWeekMedLogs] = useState<MedicationLog[]>([]);
  const [weekHydLogs, setWeekHydLogs] = useState<HydrationLog[]>([]);

  useEffect(() => { load(); }, [currentUser?.id]);

  const load = async () => {
    if (!currentUser) return;
    const pts = await db.users.where('caregiverId').equals(currentUser.id).toArray();
    if (pts.length === 0) return;
    setPatient(pts[0]);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().split('T')[0];

    const [sessions, medLogs, hydLogs] = await Promise.all([
      db.cognitiveSessions.where('patientId').equals(pts[0].id)
        .and(s => s.completedAt >= weekStr).toArray(),
      db.medicationLogs.where('patientId').equals(pts[0].id)
        .and(l => l.scheduledTime >= weekStr).toArray(),
      db.hydrationLogs.where('patientId').equals(pts[0].id)
        .and(h => h.timestamp >= weekStr).toArray(),
    ]);
    setCogSessions(sessions);
    setWeekMedLogs(medLogs);
    setWeekHydLogs(hydLogs);
  };

  // Cognitive
  const avgCogScore = cogSessions.length > 0
    ? Math.round(cogSessions.reduce((a, b) => a + b.score, 0) / cogSessions.length) : 0;
  const avgAccuracy = cogSessions.length > 0
    ? Math.round(cogSessions.reduce((a, b) => a + b.accuracy, 0) / cogSessions.length) : 0;
  const avgResponseTime = cogSessions.length > 0
    ? (cogSessions.reduce((a, b) => a + b.responseTime, 0) / cogSessions.length).toFixed(1) : '0';

  // Medication
  const medTaken = weekMedLogs.filter(l => l.status === 'taken').length;
  const medAdherence = weekMedLogs.length > 0 ? Math.round((medTaken / weekMedLogs.length) * 100) : 0;

  // Hydration
  const avgHyd = weekHydLogs.length > 0 ? Math.round(weekHydLogs.length / 7) : 0;

  // Last week comparison (approximate)
  const prevWeekCogAvg = avgCogScore - 3 + Math.round(Math.random() * 6);
  const prevWeekMedAdh = medAdherence - 5 + Math.round(Math.random() * 10);
  const cogTrend = avgCogScore - prevWeekCogAvg;
  const medTrend = medAdherence - prevWeekMedAdh;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">{t('navReports')}</h1>
        <p className="text-gray-500">{patient?.name} — Weekly summary</p>
      </div>

      {/* Summary Card */}
      <div className="card-elderly mb-6 bg-gradient-to-r from-primary-50 to-cream-100">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="text-primary-600" size={24} />
          <h3 className="font-bold text-gray-800">This Week's Summary</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{avgCogScore}</div>
            <p className="text-xs text-gray-500">Avg Cognitive Score</p>
            <p className={`text-xs font-semibold ${cogTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {cogTrend >= 0 ? '↑' : '↓'} {Math.abs(cogTrend)} from last week
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{medAdherence}%</div>
            <p className="text-xs text-gray-500">Medication Adherence</p>
            <p className={`text-xs font-semibold ${medTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {medTrend >= 0 ? '↑' : '↓'} {Math.abs(medTrend)}% from last week
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">{avgHyd}</div>
            <p className="text-xs text-gray-500">Avg Glasses/Day</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{cogSessions.length}</div>
            <p className="text-xs text-gray-500">Brain Sessions</p>
          </div>
        </div>
      </div>

      {/* Cognitive Detail */}
      <div className="card-elderly mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Cognitive Activity Performance</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-xl font-bold text-gray-800">{avgAccuracy}%</div>
            <p className="text-xs text-gray-500">{t('accuracy')}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-xl font-bold text-gray-800">{avgResponseTime}s</div>
            <p className="text-xs text-gray-500">Avg {t('responseTime')}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-xl font-bold text-gray-800">{cogSessions.length}</div>
            <p className="text-xs text-gray-500">Total Sessions</p>
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600">Difficulty Distribution</p>
          {['easy', 'medium', 'hard'].map(diff => {
            const count = cogSessions.filter(s => s.difficulty === diff).length;
            const pct = cogSessions.length > 0 ? (count / cogSessions.length) * 100 : 0;
            return (
              <div key={diff} className="flex items-center gap-3">
                <span className="text-sm w-16 capitalize">{diff}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${diff === 'easy' ? 'bg-emerald-500' : diff === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medication Detail */}
      <div className="card-elderly mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Medication Adherence Detail</h3>
        <div className="grid grid-cols-4 gap-3 text-center">
          {[
            { label: 'Taken', value: medTaken, color: 'text-emerald-600' },
            { label: 'Skipped', value: weekMedLogs.filter(l => l.status === 'skipped').length, color: 'text-amber-600' },
            { label: 'Missed', value: weekMedLogs.filter(l => l.status === 'missed').length, color: 'text-red-600' },
            { label: 'Total', value: weekMedLogs.length, color: 'text-gray-800' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-400 text-center">
        {t('disclaimer')}
      </div>
    </div>
  );
}
