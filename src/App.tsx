import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { initializeDatabase } from './data/db';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PatientLayout from './components/PatientLayout';
import PatientDashboard from './pages/patient/Dashboard';
import MedicinesPage from './pages/patient/Medicines';
import CognitiveCarePage from './pages/patient/CognitiveCare';
import MemoryMatchGame from './pages/patient/games/MemoryMatch';
import PatternGame from './pages/patient/games/PatternRecognition';
import ObjectGame from './pages/patient/games/ObjectRecognition';
import RoutineRecallGame from './pages/patient/games/RoutineRecall';
import RoutinePage from './pages/patient/Routine';
import HydrationPage from './pages/patient/Hydration';
import AppointmentsPage from './pages/patient/Appointments';
import ProgressPage from './pages/patient/Progress';
import VoiceAssistantPage from './pages/patient/VoiceAssistant';
import SettingsPage from './pages/patient/Settings';
import CaregiverLayout from './components/CaregiverLayout';
import CaregiverDashboard from './pages/caregiver/Dashboard';
import CaregiverPatients from './pages/caregiver/Patients';
import CaregiverMedications from './pages/caregiver/Medications';
import CaregiverCognitive from './pages/caregiver/Cognitive';
import CaregiverAlerts from './pages/caregiver/Alerts';
import CaregiverReports from './pages/caregiver/Reports';
import CaregiverSettings from './pages/caregiver/Settings';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: string }) {
  const { isAuthenticated, currentUser } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && currentUser?.role !== allowedRole) {
    return <Navigate to={currentUser?.role === 'caregiver' ? '/caregiver' : '/app'} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated, currentUser } = useAuthStore();

  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          isAuthenticated
            ? <Navigate to={currentUser?.role === 'caregiver' ? '/caregiver' : '/app'} replace />
            : <LandingPage />
        } />
        <Route path="/login" element={
          isAuthenticated
            ? <Navigate to={currentUser?.role === 'caregiver' ? '/caregiver' : '/app'} replace />
            : <LoginPage />
        } />

        {/* Patient Routes */}
        <Route path="/app" element={
          <ProtectedRoute allowedRole="patient"><PatientLayout /></ProtectedRoute>
        }>
          <Route index element={<PatientDashboard />} />
          <Route path="medicines" element={<MedicinesPage />} />
          <Route path="brain" element={<CognitiveCarePage />} />
          <Route path="brain/memory-match" element={<MemoryMatchGame />} />
          <Route path="brain/pattern" element={<PatternGame />} />
          <Route path="brain/object" element={<ObjectGame />} />
          <Route path="brain/routine-recall" element={<RoutineRecallGame />} />
          <Route path="routine" element={<RoutinePage />} />
          <Route path="hydration" element={<HydrationPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="assistant" element={<VoiceAssistantPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Caregiver Routes */}
        <Route path="/caregiver" element={
          <ProtectedRoute allowedRole="caregiver"><CaregiverLayout /></ProtectedRoute>
        }>
          <Route index element={<CaregiverDashboard />} />
          <Route path="patients" element={<CaregiverPatients />} />
          <Route path="medications" element={<CaregiverMedications />} />
          <Route path="cognitive" element={<CaregiverCognitive />} />
          <Route path="alerts" element={<CaregiverAlerts />} />
          <Route path="reports" element={<CaregiverReports />} />
          <Route path="settings" element={<CaregiverSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
