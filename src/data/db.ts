import Dexie, { type Table } from 'dexie';
import type {
  User, Medication, MedicationLog, CognitiveSession,
  DailyRoutine, HydrationLog, Appointment, Alert, OfflineQueueItem
} from '../types';

class MindCareDB extends Dexie {
  users!: Table<User>;
  medications!: Table<Medication>;
  medicationLogs!: Table<MedicationLog>;
  cognitiveSessions!: Table<CognitiveSession>;
  dailyRoutines!: Table<DailyRoutine>;
  hydrationLogs!: Table<HydrationLog>;
  appointments!: Table<Appointment>;
  alerts!: Table<Alert>;
  offlineQueue!: Table<OfflineQueueItem>;

  constructor() {
    super('MindCareDB');
    this.version(1).stores({
      users: 'id, email, role, caregiverId',
      medications: 'id, patientId, active',
      medicationLogs: 'id, medicationId, patientId, scheduledTime, status',
      cognitiveSessions: 'id, patientId, activityType, completedAt',
      dailyRoutines: 'id, patientId, scheduledTime',
      hydrationLogs: 'id, patientId, timestamp',
      appointments: 'id, patientId, date',
      alerts: 'id, patientId, caregiverId, type, status',
      offlineQueue: 'id, type, timestamp',
    });
  }
}

export const db = new MindCareDB();

export async function initializeDatabase() {
  const userCount = await db.users.count();
  if (userCount > 0) return;

  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  // Create demo users
  await db.users.bulkAdd([
    {
      id: 'patient-1',
      name: 'Ramesh Kumar',
      email: 'ramesh@demo.com',
      password: 'demo123',
      role: 'patient',
      age: 68,
      language: 'en',
      region: 'North Eastern Region, India',
      caregiverId: 'caregiver-1',
      createdAt: now,
    },
    {
      id: 'caregiver-1',
      name: 'Anita Kumar',
      email: 'anita@demo.com',
      password: 'demo123',
      role: 'caregiver',
      language: 'en',
      region: 'North Eastern Region, India',
      createdAt: now,
    },
  ]);

  // Seed medications
  const meds = [
    { id: 'med-1', patientId: 'patient-1', name: 'Metformin', dosage: '500mg', frequency: 'twice' as const, times: ['08:00', '20:00'], instructions: 'Take with food', startDate: '2026-01-01', icon: '💊', active: true, createdAt: now },
    { id: 'med-2', patientId: 'patient-1', name: 'Amlodipine', dosage: '5mg', frequency: 'daily' as const, times: ['08:00'], instructions: 'Take in the morning', startDate: '2026-01-01', icon: '💊', active: true, createdAt: now },
    { id: 'med-3', patientId: 'patient-1', name: 'Vitamin D3', dosage: '1000 IU', frequency: 'daily' as const, times: ['12:00'], instructions: 'Take with lunch', startDate: '2026-01-01', icon: '🟡', active: true, createdAt: now },
    { id: 'med-4', patientId: 'patient-1', name: 'Atorvastatin', dosage: '20mg', frequency: 'daily' as const, times: ['20:00'], instructions: 'Take at bedtime', startDate: '2026-01-01', icon: '💊', active: true, createdAt: now },
  ];
  await db.medications.bulkAdd(meds);

  // Seed medication logs (last 7 days)
  const statusOptions: Array<'taken' | 'skipped' | 'missed'> = ['taken', 'taken', 'taken', 'taken', 'taken', 'taken', 'skipped', 'taken', 'taken', 'taken'];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];

    for (const med of meds) {
      for (const time of med.times) {
        const status = d === 0 ? 'pending' as const : statusOptions[Math.floor(Math.random() * statusOptions.length)];
        await db.medicationLogs.add({
          id: `log-${med.id}-${dateStr}-${time}`,
          medicationId: med.id,
          patientId: 'patient-1',
          scheduledTime: `${dateStr}T${time}:00`,
          status,
          takenAt: status === 'taken' ? `${dateStr}T${time}:05:00` : undefined,
        });
      }
    }
  }

  // Seed cognitive sessions (last 7 days)
  const activityTypes: Array<'memory_match' | 'pattern_recognition' | 'object_recognition' | 'daily_routine_recall'> = ['memory_match', 'pattern_recognition', 'object_recognition', 'daily_routine_recall'];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const sessionsPerDay = 2 + Math.floor(Math.random() * 2);

    for (let s = 0; s < sessionsPerDay; s++) {
      const type = activityTypes[s % activityTypes.length];
      const difficulty = d > 4 ? 'easy' as const : d > 2 ? 'medium' as const : 'medium' as const;
      const baseScore = 60 + Math.floor(Math.random() * 30) + (6 - d) * 3;
      await db.cognitiveSessions.add({
        id: `cog-${dateStr}-${s}`,
        patientId: 'patient-1',
        activityType: type,
        difficulty,
        score: Math.min(baseScore, 100),
        accuracy: Math.min(baseScore + 5, 100),
        responseTime: 3 + Math.random() * 12,
        attempts: 3 + Math.floor(Math.random() * 8),
        completedAt: `${dateStr}T${10 + s}:00:00`,
      });
    }
  }

  // Seed daily routines
  const routines = [
    { id: 'rtn-1', patientId: 'patient-1', name: 'Wake Up & Freshen Up', scheduledTime: '06:30', completed: true, completedAt: `${today}T06:35:00`, icon: '🌅' },
    { id: 'rtn-2', patientId: 'patient-1', name: 'Morning Walk', scheduledTime: '07:00', completed: true, completedAt: `${today}T07:30:00`, icon: '🚶' },
    { id: 'rtn-3', patientId: 'patient-1', name: 'Breakfast', scheduledTime: '08:00', completed: true, completedAt: `${today}T08:20:00`, icon: '🍽️' },
    { id: 'rtn-4', patientId: 'patient-1', name: 'Morning Medicines', scheduledTime: '08:30', completed: false, icon: '💊' },
    { id: 'rtn-5', patientId: 'patient-1', name: 'Brain Activity', scheduledTime: '10:00', completed: false, icon: '🧠' },
    { id: 'rtn-6', patientId: 'patient-1', name: 'Lunch', scheduledTime: '12:30', completed: false, icon: '🍛' },
    { id: 'rtn-7', patientId: 'patient-1', name: 'Afternoon Rest', scheduledTime: '14:00', completed: false, icon: '😴' },
    { id: 'rtn-8', patientId: 'patient-1', name: 'Evening Tea & Snacks', scheduledTime: '16:00', completed: false, icon: '🍵' },
    { id: 'rtn-9', patientId: 'patient-1', name: 'Evening Medicines', scheduledTime: '20:00', completed: false, icon: '💊' },
    { id: 'rtn-10', patientId: 'patient-1', name: 'Dinner', scheduledTime: '19:00', completed: false, icon: '🥘' },
    { id: 'rtn-11', patientId: 'patient-1', name: 'Bedtime', scheduledTime: '22:00', completed: false, icon: '🌙' },
  ];
  await db.dailyRoutines.bulkAdd(routines);

  // Seed hydration
  const hours = [7, 9, 11, 13, 15, 17];
  for (let i = 0; i < 4; i++) {
    await db.hydrationLogs.add({
      id: `hyd-${i}`,
      patientId: 'patient-1',
      amount: 250,
      timestamp: `${today}T${hours[i]}:00:00`,
    });
  }

  // Seed appointments
  await db.appointments.bulkAdd([
    {
      id: 'apt-1', patientId: 'patient-1', title: 'General Checkup',
      doctor: 'Dr. Priya Sharma', location: 'NE Health Center, Guwahati',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '10:30', notes: 'Bring previous reports', reminded: false, createdAt: now,
    },
    {
      id: 'apt-2', patientId: 'patient-1', title: 'Eye Checkup',
      doctor: 'Dr. Anil Das', location: 'City Hospital, Shillong',
      date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      time: '11:00', notes: '', reminded: false, createdAt: now,
    },
  ]);

  // Seed alerts for caregiver
  await db.alerts.bulkAdd([
    { id: 'alert-1', patientId: 'patient-1', caregiverId: 'caregiver-1', type: 'missed_medication', message: 'Ramesh missed his 8:00 PM Metformin dose yesterday', severity: 'critical', status: 'active', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'alert-2', patientId: 'patient-1', caregiverId: 'caregiver-1', type: 'reduced_performance', message: 'Cognitive activity scores dropped by 8% this week', severity: 'warning', status: 'active', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'alert-3', patientId: 'patient-1', caregiverId: 'caregiver-1', type: 'upcoming_appointment', message: 'Appointment with Dr. Priya Sharma tomorrow at 10:30 AM', severity: 'info', status: 'active', createdAt: new Date(Date.now() - 10800000).toISOString() },
    { id: 'alert-4', patientId: 'patient-1', caregiverId: 'caregiver-1', type: 'routine_completed', message: 'Ramesh completed his morning routine on time today!', severity: 'success', status: 'active', createdAt: new Date(Date.now() - 14400000).toISOString() },
  ]);
}
