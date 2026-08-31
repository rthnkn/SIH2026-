export type UserRole = 'patient' | 'caregiver';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  age?: number;
  language: SupportedLanguage;
  region: string;
  caregiverId?: string;
  avatar?: string;
  createdAt: string;
}

export type SupportedLanguage = 'en' | 'hi' | 'as' | 'bn';

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'twice' | 'thrice' | 'weekly' | 'asNeeded';
  times: string[];
  instructions: string;
  startDate: string;
  endDate?: string;
  icon: string;
  active: boolean;
  createdAt: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  patientId: string;
  scheduledTime: string;
  status: 'taken' | 'skipped' | 'missed' | 'pending';
  takenAt?: string;
  notes?: string;
}

export type CognitiveActivityType = 'memory_match' | 'pattern_recognition' | 'object_recognition' | 'daily_routine_recall';
export type CognitiveDifficulty = 'easy' | 'medium' | 'hard';

export interface CognitiveSession {
  id: string;
  patientId: string;
  activityType: CognitiveActivityType;
  difficulty: CognitiveDifficulty;
  score: number;
  accuracy: number;
  responseTime: number;
  attempts: number;
  completedAt: string;
}

export interface DailyRoutine {
  id: string;
  patientId: string;
  name: string;
  scheduledTime: string;
  completed: boolean;
  completedAt?: string;
  icon: string;
}

export interface HydrationLog {
  id: string;
  patientId: string;
  amount: number;
  timestamp: string;
}

export interface HydrationSettings {
  dailyTarget: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  title: string;
  doctor: string;
  location: string;
  date: string;
  time: string;
  notes: string;
  reminded: boolean;
  createdAt: string;
}

export type AlertType = 'missed_medication' | 'skipped_activity' | 'reduced_performance' | 'upcoming_appointment' | 'routine_completed';
export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';
export type AlertStatus = 'active' | 'resolved' | 'dismissed';

export interface Alert {
  id: string;
  patientId: string;
  caregiverId: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface CognitiveDifficultySettings {
  memory_match: CognitiveDifficulty;
  pattern_recognition: CognitiveDifficulty;
  object_recognition: CognitiveDifficulty;
  daily_routine_recall: CognitiveDifficulty;
}

export interface OfflineQueueItem {
  id: string;
  type: string;
  data: unknown;
  timestamp: string;
}
