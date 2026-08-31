import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { User, CognitiveSession } from '../../types';
import { Brain, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';

export default function CaregiverCognitive() {
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [patient, setPatient] = useState<User | null>(null);
  const [sessions, setSessions] = useState<CognitiveSession[]>([]);

  useEffect(() => { load(); }, [currentUser?.id]);

  const load = async () => {
    if (!currentUser) return;
    const pts = await db.users.where('caregiverId').equals(currentUser.id).toArray();
    if (pts.length === 0) return;
    setPatient(pts[0]);
    const s = await db.cognitiveSessions.where('patientId').equals(pts[0].id).toArray();
    setSessions(s.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()));
  };

  const recent = sessions.slice(0, 20);
  const avgScore = recent.length > 0 ? Math.round(recent.reduce((a, b) => a + b.score, 0) / recent.length) : 0;
  const avgAccuracy = recent.length > 0 ? Math.round(recent.reduce((a, b) => a + b.accuracy, 0) / recent.length) : 0;

  // Trend
  const older = sessions.slice(20, 40);
  const olderAvg = older.length > 0 ? Math.round(older.reduce((a, b) => a + b.score, 0) / older.length) : avgScore;
  const trend = avgScore > olderAvg + 3 ? 'improving' : avgScore < olderAvg - 3 ? 'declining' : 'stable';

  // Difficulty levels
  const currentDifficulty = recent.length > 0 ? recent[0].difficulty : 'easy';
  const diffCounts = { easy: 0, medium: 0, hard: 0 };
  recent.forEach(s => { diffCounts[s.difficulty]++; });

  // Per-activity
  const activityStats: Record<string, { count: number; avgScore: number }> = {};
  recent.forEach(s => {
    const name = s.activityType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    if (!activityStats[name]) activityStats[name] = { count: 0, avgScore: 0 };
    activityStats[name].count++;
    activityStats[name].avgScore += s.score;
  });
  Object.keys(activityStats).forEach(k => {
    activityStats[k].avgScore = Math.round(activityStats[k].avgScore / activityStats[k].count);
  });

  // Weekly scores
  const weeklyScores: number[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const daySessions = sessions.filter(s => s.completedAt.startsWith(dateStr));
    weeklyScores.push(daySessions.length > 0
      ? Math.round(daySessions.reduce((a, b) => a + b.score, 0) / daySessions.length) : 0);
  }
  const maxScore = Math.max(...weeklyScores, 1);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">{t('cognitivePerformance')}</h1>
        <p className="text-gray-500">{patient?.name} — Activity performance tracking</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-elderly text-center">
          <div className="text-3xl font-extrabold text-purple-600">{avgScore}</div>
          <div className="text-sm text-gray-500">{t('score')}</div>
        </div>
        <div className="card-elderly text-center">
          <div className="text-3xl font-extrabold text-blue-600">{avgAccuracy}%</div>
          <div className="text-sm text-gray-500">{t('accuracy')}</div>
        </div>
        <div className="card-elderly text-center">
          <div className="text-3xl font-extrabold text-primary-600">{recent.length}</div>
          <div className="text-sm text-gray-500">Sessions</div>
        </div>
        <div className="card-elderly text-center">
          <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${
            trend === 'improving' ? 'text-emerald-600' : trend === 'declining' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'improving' ? <TrendingUp size={24} /> : trend === 'declining' ? <TrendingDown size={24} /> : <Minus size={24} />}
            {t(trend)}
          </div>
          <div className="text-sm text-gray-500">Performance Trend</div>
        </div>
      </div>

      {/* Current Level */}
      <div className="card-elderly mb-6 bg-gradient-to-r from-purple-50 to-cream-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Zap className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Activity Level</p>
            <p className="text-xl font-bold text-gray-800 capitalize">{currentDifficulty}</p>
          </div>
          <div className="flex-1" />
          <div className="text-right">
            <p className="text-sm text-gray-500">Recent Performance</p>
            <p className={`text-xl font-bold ${trend === 'improving' ? 'text-emerald-600' : trend === 'declining' ? 'text-red-600' : 'text-gray-600'}`}>
              {t(trend)}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="card-elderly mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Weekly Performance</h3>
        <div className="flex items-end gap-2 h-36">
          {weeklyScores.map((score, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-500">{score > 0 ? score : ''}</span>
                <div className="w-full rounded-t-lg transition-all" style={{
                  height: `${score > 0 ? (score / maxScore) * 100 : 2}%`,
                  backgroundColor: score >= 80 ? '#10b981' : score >= 50 ? '#3b82f6' : score > 0 ? '#f59e0b' : '#e5e7eb',
                }} />
                <span className="text-xs text-gray-400">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="card-elderly mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Activity Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(activityStats).map(([name, stats]) => (
            <div key={name} className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{name}</span>
                <span className="text-sm font-bold text-primary-600">{stats.avgScore}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${stats.avgScore}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{stats.count} sessions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card-elderly">
        <h3 className="font-bold text-gray-800 mb-4">Recent Sessions</h3>
        <div className="space-y-2">
          {recent.slice(0, 10).map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">
                {s.activityType === 'memory_match' ? '🃏' : s.activityType === 'pattern_recognition' ? '🔮' :
                 s.activityType === 'object_recognition' ? '🖼️' : '📋'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {s.activityType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(s.completedAt).toLocaleString()} • {s.difficulty}
                </p>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${s.score >= 80 ? 'text-emerald-600' : s.score >= 50 ? 'text-blue-600' : 'text-amber-600'}`}>
                  {s.score}
                </span>
                <p className="text-xs text-gray-400">{Math.round(s.accuracy)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
