import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { User } from '../../types';
import { Users, Calendar, Pill, Brain } from 'lucide-react';

export default function CaregiverPatients() {
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [patients, setPatients] = useState<(User & { medCount?: number; cogCount?: number; age?: number })[]>([]);

  useEffect(() => { loadPatients(); }, [currentUser?.id]);

  const loadPatients = async () => {
    if (!currentUser) return;
    const pts = await db.users.where('caregiverId').equals(currentUser.id).toArray();
    const enriched = await Promise.all(pts.map(async p => {
      const [meds, cogs] = await Promise.all([
        db.medications.where('patientId').equals(p.id).and(m => m.active).count(),
        db.cognitiveSessions.where('patientId').equals(p.id).count(),
      ]);
      return { ...p, medCount: meds, cogCount: cogs };
    }));
    setPatients(enriched);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">{t('navPatients')}</h1>
        <p className="text-gray-500">{patients.length} patient(s) assigned</p>
      </div>
      <div className="space-y-4">
        {patients.map(p => (
          <div key={p.id} className="card-elderly">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 text-xl font-bold">
                {p.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{p.name}</h3>
                <p className="text-sm text-gray-500">Age: {p.age || 'N/A'} • {p.region}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <Pill className="mx-auto text-blue-600 mb-1" size={20} />
                <div className="text-lg font-bold text-gray-800">{p.medCount}</div>
                <div className="text-xs text-gray-500">Active Medicines</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <Brain className="mx-auto text-purple-600 mb-1" size={20} />
                <div className="text-lg font-bold text-gray-800">{p.cogCount}</div>
                <div className="text-xs text-gray-500">Brain Sessions</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <Calendar className="mx-auto text-emerald-600 mb-1" size={20} />
                <div className="text-lg font-bold text-gray-800">Active</div>
                <div className="text-xs text-gray-500">Status</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
