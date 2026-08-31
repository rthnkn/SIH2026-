import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { CognitiveSession, MedicationLog } from '../../types';
import { BarChart3, TrendingUp, Brain, Pill, Droplets } from 'lucide-react';

export default function ProgressPage() {
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [cognitiveSessions, setCognitiveSessions] = useState<CognitiveSession[]>([]);
  const [medLogs, setMedLogs] = useState<MedicationLog[]>([]);
  const [activeTab, setActiveTab] = useState<'cognitive' | 'medication'>('cognitive');

  useEffect(() => { loadData(); }, [currentUser?.id]);

  const loadData = async () => {
    if (!currentUser) return;
    const [sessions, logs] = await Promise.all([
      db.cognitiveSessions.where('patientId').equals(currentUser.id).toArray(),
      db.medicationLogs.where('patientId').equals(currentUser.id).toArray(),
    ]);
    setCognitiveSessions(sessions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()));
    setMedLogs(logs);
  };

  // Cognitive stats
  const recentSessions = cognitiveSessions.slice(0, 20);
  const avgScore = recentSessions.length > 0
    ? Math.round(recentSessions.reduce((a, b) => a + b.score, 0) / recentSessions.length)
    : 0;
  const avgAccuracy = recentSessions.length > 0
    ? Math.round(recentSessions.reduce((a, b) => a + b.accuracy, 0) / recentSessions.length)
    : 0;
  const totalSessions = cognitiveSessions.length;

  // Medication adherence
  const today = new Date().toISOString().split('T')[0];
  const thisWeek = medLogs.filter(l => {
    const logDate = l.scheduledTime.split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo.toISOString().split('T')[0];
  });
  const weekTaken = thisWeek.filter(l => l.status === 'taken').length;
  const weekAdherence = thisWeek.length > 0 ? Math.round((weekTaken / thisWeek.length) * 100) : 0;

  // Weekly score chart (last 7 days)
  const dailyScores: { day: string; score: number }[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
    const daySessions = cognitiveSessions.filter(s => s.completedAt.startsWith(dateStr));
    const avgDayScore = daySessions.length > 0
      ? Math.round(daySessions.reduce((a, b) => a + b.score, 0) / daySessions.length)
      : 0;
    dailyScores.push({ day: dayLabel, score: avgDayScore });
  }
  const maxScore = Math.max(...dailyScores.map(d => d.score), 1);

  // Difficulty distribution
  const difficultyCount = { easy: 0, medium: 0, hard: 0 };
  recentSessions.forEach(s => { difficultyCount[s.difficulty]++; });

  // Activity breakdown
  const activityBreakdown: Record<string, number> = {};
  recentSessions.forEach(s => {
    const name = s.activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    activityBreakdown[name] = (activityBreakdown[name] || 0) + 1;
  });

  return (
    <div className="page-container slide-up">
      <div className="mb-6">
        <h1 className="text-elderly-2xl font-extrabold text-gray-900">{t('navProgress')}</h1>
        <p className="text-gray-500">Your activity overview</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('cognitive')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'cognitive' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Brain size={16} /> {t('brainCare')}
        </button>
        <button
          onClick={() => setActiveTab('medication')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'medication' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Pill size={16} /> {t('myMedicines')}
        </button>
      </div>

      {activeTab === 'cognitive' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card-elderly text-center p-4">
              <div className="text-2xl font-bold text-purple-600">{avgScore}</div>
              <div className="text-xs text-gray-500">{t('score')}</div>
            </div>
            <div className="card-elderly text-center p-4">
              <div className="text-2xl font-bold text-blue-600">{avgAccuracy}%</div>
              <div className="text-xs text-gray-500">{t('accuracy')}</div>
            </div>
            <div className="card-elderly text-center p-4">
              <div className="text-2xl font-bold text-emerald-600">{totalSessions}</div>
              <div className="text-xs text-gray-500">Sessions</div>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="card-elderly">
            <h3 className="font-bold text-gray-800 mb-4">{t('performanceLast7Days')}</h3>
            <div className="flex items-end gap-2 h-40">
              {dailyScores.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-500">{d.score > 0 ? d.score : ''}</span>
                  <div className="w-full rounded-t-lg transition-all duration-500" style={{
                    height: `${d.score > 0 ? (d.score / maxScore) * 100 : 2}%`,
                    backgroundColor: d.score >= 80 ? '#10b981' : d.score >= 50 ? '#3b82f6' : d.score > 0 ? '#f59e0b' : '#e5e7eb',
                  }} />
                  <span className="text-xs font-medium text-gray-500">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="card-elderly">
            <h3 className="font-bold text-gray-800 mb-3">{t('difficulty')} Distribution</h3>
            <div className="space-y-2">
              {[
                { label: t('easy'), count: difficultyCount.easy, color: 'bg-emerald-500' },
                { label: t('medium'), count: difficultyCount.medium, color: 'bg-amber-500' },
                { label: t('hard'), count: difficultyCount.hard, color: 'bg-red-500' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16">{label}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${totalSessions > 0 ? (count / totalSessions) * 100 : 0}%` }} />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="card-elderly">
            <h3 className="font-bold text-gray-800 mb-3">Activities Completed</h3>
            <div className="space-y-2">
              {Object.entries(activityBreakdown).map(([name, count]) => (
                <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-700 text-sm">{name}</span>
                  <span className="badge bg-purple-100 text-purple-700">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="card-elderly">
            <h3 className="font-bold text-gray-800 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recentSessions.slice(0, 8).map(session => (
                <div key={session.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="text-xl">
                    {session.activityType === 'memory_match' ? '🃏' :
                     session.activityType === 'pattern_recognition' ? '🔮' :
                     session.activityType === 'object_recognition' ? '🖼️' : '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {session.activityType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(session.completedAt).toLocaleDateString()} • {session.difficulty}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${
                    session.score >= 80 ? 'text-emerald-600' : session.score >= 50 ? 'text-blue-600' : 'text-amber-600'
                  }`}>
                    {session.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'medication' && (
        <div className="space-y-6">
          {/* Adherence Stats */}
          <div className="card-elderly bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Pill className="text-blue-600" size={28} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-blue-600">{weekAdherence}%</div>
                <p className="text-sm text-gray-500">{t('medicationAdherence')} — This Week</p>
              </div>
            </div>
          </div>

          {/* Weekly breakdown */}
          <div className="card-elderly">
            <h3 className="font-bold text-gray-800 mb-3">This Week</h3>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dateStr = date.toISOString().split('T')[0];
                const dayLogs = medLogs.filter(l => l.scheduledTime.startsWith(dateStr));
                const dayTaken = dayLogs.filter(l => l.status === 'taken').length;
                const dayTotal = dayLogs.length;
                const pct = dayTotal > 0 ? (dayTaken / dayTotal) * 100 : 0;
                return (
                  <div key={i} className="text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="h-16 bg-gray-100 rounded-lg overflow-hidden flex flex-col justify-end">
                      <div
                        className="bg-blue-500 rounded-t transition-all duration-500"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <div className="text-xs font-medium text-gray-500 mt-1">
                      {dayTotal > 0 ? `${dayTaken}/${dayTotal}` : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
