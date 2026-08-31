import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { User, MedicationLog, Medication } from '../../types';
import { Pill, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function CaregiverMedications() {
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [patient, setPatient] = useState<User | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [weekLogs, setWeekLogs] = useState<MedicationLog[]>([]);

  useEffect(() => { load(); }, [currentUser?.id]);

  const load = async () => {
    if (!currentUser) return;
    const pts = await db.users.where('caregiverId').equals(currentUser.id).toArray();
    if (pts.length === 0) return;
    const p = pts[0];
    setPatient(p);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const [meds, logs] = await Promise.all([
      db.medications.where('patientId').equals(p.id).and(m => m.active).toArray(),
      db.medicationLogs.where('patientId').equals(p.id)
        .and(l => l.scheduledTime >= weekAgo.toISOString().split('T')[0]).toArray(),
    ]);
    setMedications(meds);
    setWeekLogs(logs);
  };

  const weekTaken = weekLogs.filter(l => l.status === 'taken').length;
  const weekSkipped = weekLogs.filter(l => l.status === 'skipped').length;
  const weekMissed = weekLogs.filter(l => l.status === 'missed').length;
  const weekTotal = weekLogs.length;
  const adherence = weekTotal > 0 ? Math.round((weekTaken / weekTotal) * 100) : 0;

  // Per-medication stats
  const medStats = medications.map(med => {
    const medLogs = weekLogs.filter(l => l.medicationId === med.id);
    const taken = medLogs.filter(l => l.status === 'taken').length;
    return { med, total: medLogs.length, taken, pct: medLogs.length > 0 ? Math.round((taken / medLogs.length) * 100) : 0 };
  });

  // Daily breakdown
  const dailyBreakdown: { day: string; taken: number; total: number }[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const dayLogs = weekLogs.filter(l => l.scheduledTime.startsWith(dateStr));
    dailyBreakdown.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      taken: dayLogs.filter(l => l.status === 'taken').length,
      total: dayLogs.length,
    });
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">{t('medicationAdherence')}</h1>
        <p className="text-gray-500">{patient?.name} — Last 7 days</p>
      </div>

      {/* Overview */}
      <div className="card-elderly mb-6">
        <div className="grid grid-cols-4 gap-4 text-center mb-6">
          <div>
            <div className="text-3xl font-extrabold text-primary-600">{adherence}%</div>
            <div className="text-sm text-gray-500">Adherence</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600">{weekTaken}</div>
            <div className="text-sm text-gray-500">Taken</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-600">{weekSkipped}</div>
            <div className="text-sm text-gray-500">Skipped</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-red-600">{weekMissed}</div>
            <div className="text-sm text-gray-500">Missed</div>
          </div>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-primary-500 rounded-full" style={{ width: `${adherence}%` }} />
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="card-elderly mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Daily Adherence</h3>
        <div className="flex items-end gap-3 h-32">
          {dailyBreakdown.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{d.total > 0 ? `${d.taken}/${d.total}` : '-'}</span>
              <div className="w-full rounded-t-lg bg-primary-500" style={{ height: `${d.total > 0 ? (d.taken / d.total) * 100 : 2}%` }} />
              <span className="text-xs text-gray-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Medication */}
      <div className="card-elderly">
        <h3 className="font-bold text-gray-800 mb-4">Medication Details</h3>
        <div className="space-y-3">
          {medStats.map(({ med, total, taken, pct }) => (
            <div key={med.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">{med.icon || '💊'}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800">{med.name}</h4>
                <p className="text-xs text-gray-500">{med.dosage} • {taken}/{total} doses</p>
              </div>
              <div className="w-24">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
