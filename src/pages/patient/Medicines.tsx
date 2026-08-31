import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { Medication, MedicationLog } from '../../types';
import { Plus, Clock, Check, X, Edit3, Trash2, AlertTriangle, Bell } from 'lucide-react';
import Modal from '../../components/Modal';

export default function MedicinesPage() {
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [reminderMed, setReminderMed] = useState<{ med: Medication; log: MedicationLog } | null>(null);
  const [view, setView] = useState<'today' | 'all' | 'history'>('today');

  // Form state
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formFrequency, setFormFrequency] = useState<Medication['frequency']>('daily');
  const [formTimes, setFormTimes] = useState('08:00');
  const [formInstructions, setFormInstructions] = useState('');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    const [meds, logs] = await Promise.all([
      db.medications.where('patientId').equals(currentUser.id).toArray(),
      db.medicationLogs.where('patientId').equals(currentUser.id).and(l => l.scheduledTime.startsWith(today)).toArray(),
    ]);
    setMedications(meds);
    setTodayLogs(logs);
  }, [currentUser?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Check for reminders periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMin = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHour}:${currentMin}`;

      const pendingLog = todayLogs.find(l => {
        if (l.status !== 'pending') return false;
        const logTime = l.scheduledTime.split('T')[1]?.substring(0, 5);
        return logTime === currentTime;
      });

      if (pendingLog) {
        const med = medications.find(m => m.id === pendingLog.medicationId);
        if (med) setReminderMed({ med, log: pendingLog });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [todayLogs, medications]);

  const resetForm = () => {
    setFormName(''); setFormDosage(''); setFormFrequency('daily');
    setFormTimes('08:00'); setFormInstructions(''); setFormStartDate(new Date().toISOString().split('T')[0]);
    setEditingMed(null); setShowAddForm(false);
  };

  const handleSave = async () => {
    if (!currentUser || !formName.trim()) return;
    const times = formTimes.split(',').map(t => t.trim()).filter(Boolean);

    if (editingMed) {
      await db.medications.update(editingMed.id, {
        name: formName, dosage: formDosage, frequency: formFrequency,
        times, instructions: formInstructions, startDate: formStartDate,
      });
    } else {
      const id = `med-${Date.now()}`;
      await db.medications.add({
        id, patientId: currentUser.id, name: formName, dosage: formDosage,
        frequency: formFrequency, times, instructions: formInstructions,
        startDate: formStartDate, icon: '💊', active: true,
        createdAt: new Date().toISOString(),
      });
      // Create today's logs
      const today = new Date().toISOString().split('T')[0];
      for (const time of times) {
        await db.medicationLogs.add({
          id: `log-${id}-${today}-${time}`,
          medicationId: id, patientId: currentUser.id,
          scheduledTime: `${today}T${time}:00`, status: 'pending',
        });
      }
    }
    resetForm();
    loadData();
  };

  const handleEdit = (med: Medication) => {
    setEditingMed(med);
    setFormName(med.name);
    setFormDosage(med.dosage);
    setFormFrequency(med.frequency);
    setFormTimes(med.times.join(', '));
    setFormInstructions(med.instructions);
    setFormStartDate(med.startDate);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    await db.medications.update(id, { active: false });
    loadData();
  };

  const handleMarkTaken = async (logId: string) => {
    await db.medicationLogs.update(logId, { status: 'taken', takenAt: new Date().toISOString() });
    setReminderMed(null);
    loadData();
  };

  const handleSkip = async (logId: string) => {
    await db.medicationLogs.update(logId, { status: 'skipped' });
    setReminderMed(null);
    loadData();
  };

  const handleRemindLater = () => {
    setReminderMed(null);
  };

  const todayTaken = todayLogs.filter(l => l.status === 'taken').length;
  const todayTotal = todayLogs.length;

  return (
    <div className="page-container slide-up">
      {/* Reminder Modal */}
      {reminderMed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center slide-up">
            <div className="text-5xl mb-4 animate-bounce">💊</div>
            <h2 className="text-elderly-xl font-bold text-gray-900 mb-2">{t('medicineReminder')}</h2>
            <p className="text-gray-500 text-elderly-base mb-2">
              {reminderMed.med.name} — {reminderMed.med.dosage}
            </p>
            <p className="text-gray-500 text-lg mb-6">{t('timeToTake')}</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleMarkTaken(reminderMed.log.id)} className="btn-success w-full text-lg">
                ✓ {t('takeNow')}
              </button>
              <button onClick={handleRemindLater} className="btn-secondary w-full text-lg">
                ⏰ {t('remindLater')}
              </button>
              <button onClick={() => handleSkip(reminderMed.log.id)} className="btn-elderly bg-gray-100 text-gray-600 hover:bg-gray-200 w-full text-lg">
                {t('skipDose')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-elderly-2xl font-extrabold text-gray-900">{t('myMedicines')}</h1>
          <p className="text-gray-500">{todayTaken} / {todayTotal} {t('taken')} {t('today')}</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddForm(true); }} className="btn-primary px-4 py-3">
          <Plus size={20} /> {t('add')}
        </button>
      </div>

      {/* Adherence Bar */}
      <div className="card-elderly mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">{t('adherence')} — {t('today')}</span>
          <span className="text-sm font-bold text-primary-600">
            {todayTotal > 0 ? Math.round((todayTaken / todayTotal) * 100) : 0}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${todayTotal > 0 ? (todayTaken / todayTotal) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        {(['today', 'all', 'history'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              view === v ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {v === 'today' ? t('today') : v === 'all' ? t('myMedicines') : t('medicationHistory')}
          </button>
        ))}
      </div>

      {/* Today Timeline */}
      {view === 'today' && (
        <div className="space-y-3">
          {todayLogs.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Pill size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-elderly-base">{t('noMedicines')}</p>
            </div>
          )}
          {todayLogs.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)).map(log => {
            const med = medications.find(m => m.id === log.medicationId);
            if (!med) return null;
            const time = log.scheduledTime.split('T')[1]?.substring(0, 5);
            const isTaken = log.status === 'taken';
            const isSkipped = log.status === 'skipped';
            return (
              <div key={log.id} className={`card-elderly flex items-center gap-4 ${isTaken ? 'bg-emerald-50 border-emerald-200' : ''}`}>
                <div className="text-center min-w-[60px]">
                  <div className="text-elderly-base font-bold text-gray-800">{time}</div>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-xl">
                  {med.icon || '💊'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-elderly-base">{med.name}</h3>
                  <p className="text-sm text-gray-500">{med.dosage} • {med.instructions}</p>
                </div>
                <div>
                  {isTaken ? (
                    <span className="badge-success">✅ {t('taken')}</span>
                  ) : isSkipped ? (
                    <span className="badge-warning">⏭️ {t('skipped')}</span>
                  ) : (
                    <button onClick={() => handleMarkTaken(log.id)} className="btn-success text-sm px-4 py-2">
                      ✓ {t('markTaken')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All Medications */}
      {view === 'all' && (
        <div className="space-y-3">
          {medications.filter(m => m.active).map(med => (
            <div key={med.id} className="card-elderly flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-xl">
                {med.icon || '💊'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800">{med.name}</h3>
                <p className="text-sm text-gray-500">{med.dosage} • {med.times.join(', ')}</p>
                <p className="text-xs text-gray-400 mt-1">{med.instructions}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(med)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit3 size={18} className="text-gray-400" />
                </button>
                <button onClick={() => handleDelete(med.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {view === 'history' && (
        <div className="text-center py-12 text-gray-400">
          <Clock size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-elderly-base">{t('medicationHistory')}</p>
          <p className="text-sm mt-1">Detailed history available in caregiver reports</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddForm && (
        <Modal onClose={resetForm} title={editingMed ? t('editMedicine') : t('addMedicine')}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('medicineName')}</label>
              <input value={formName} onChange={e => setFormName(e.target.value)} className="input-elderly" placeholder="e.g., Metformin" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('dosage')}</label>
              <input value={formDosage} onChange={e => setFormDosage(e.target.value)} className="input-elderly" placeholder="e.g., 500mg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('frequency')}</label>
              <select value={formFrequency} onChange={e => setFormFrequency(e.target.value as Medication['frequency'])} className="input-elderly">
                <option value="daily">{t('daily')}</option>
                <option value="twice">{t('twice')}</option>
                <option value="thrice">{t('thrice')}</option>
                <option value="weekly">{t('weekly')}</option>
                <option value="asNeeded">{t('asNeeded')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('scheduledTimes')} (comma-separated)</label>
              <input value={formTimes} onChange={e => setFormTimes(e.target.value)} className="input-elderly" placeholder="08:00, 20:00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('instructions')}</label>
              <input value={formInstructions} onChange={e => setFormInstructions(e.target.value)} className="input-elderly" placeholder="e.g., Take with food" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('startDate')}</label>
              <input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="input-elderly" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="btn-primary flex-1">{t('save')}</button>
              <button onClick={resetForm} className="btn-secondary flex-1">{t('cancel')}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Simple Pill icon (if not imported)
function Pill({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/>
      <path d="m8.5 8.5 7 7"/>
    </svg>
  );
}
