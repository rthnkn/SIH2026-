import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { Appointment } from '../../types';
import { Plus, Calendar, MapPin, User, Bell, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';

export default function AppointmentsPage() {
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');

  const [formTitle, setFormTitle] = useState('');
  const [formDoctor, setFormDoctor] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => { loadAppointments(); }, [currentUser?.id]);

  const loadAppointments = async () => {
    if (!currentUser) return;
    const apts = await db.appointments.where('patientId').equals(currentUser.id).toArray();
    setAppointments(apts);
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(a => a.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = appointments.filter(a => a.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const displayList = view === 'upcoming' ? upcoming : past;

  const resetForm = () => {
    setFormTitle(''); setFormDoctor(''); setFormLocation('');
    setFormDate(''); setFormTime(''); setFormNotes('');
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!currentUser || !formTitle.trim() || !formDate || !formTime) return;
    await db.appointments.add({
      id: `apt-${Date.now()}`,
      patientId: currentUser.id,
      title: formTitle, doctor: formDoctor, location: formLocation,
      date: formDate, time: formTime, notes: formNotes,
      reminded: false, createdAt: new Date().toISOString(),
    });
    resetForm();
    loadAppointments();
  };

  const handleDelete = async (id: string) => {
    await db.appointments.delete(id);
    loadAppointments();
  };

  const isToday = (date: string) => date === today;
  const isTomorrow = (date: string) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return date === d.toISOString().split('T')[0];
  };

  const formatDate = (date: string) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="page-container slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-elderly-2xl font-extrabold text-gray-900">{t('myAppointments')}</h1>
          <p className="text-gray-500">{upcoming.length} {t('upcomingAppointments')}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-3">
          <Plus size={20} /> {t('add')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('upcoming')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            view === 'upcoming' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {t('upcomingAppointments')} ({upcoming.length})
        </button>
        <button
          onClick={() => setView('past')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            view === 'past' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {t('pastAppointments')} ({past.length})
        </button>
      </div>

      {/* Appointment List */}
      <div className="space-y-3">
        {displayList.map(apt => (
          <div key={apt.id} className={`card-elderly ${isToday(apt.date) ? 'ring-2 ring-orange-300 bg-orange-50' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
                <Calendar className="text-primary-600" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-elderly-base">{apt.title}</h3>
                {apt.doctor && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <User size={14} /> {apt.doctor}
                  </p>
                )}
                {apt.location && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {apt.location}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="badge bg-primary-50 text-primary-700">
                    📅 {formatDate(apt.date)}
                  </span>
                  <span className="badge bg-blue-50 text-blue-700">
                    🕐 {apt.time}
                  </span>
                </div>
                {apt.notes && (
                  <p className="text-xs text-gray-400 mt-2">📝 {apt.notes}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(apt.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
        {displayList.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-elderly-base">{t('noAppointments')}</p>
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <Modal onClose={resetForm} title={t('addAppointment')}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={formTitle} onChange={e => setFormTitle(e.target.value)} className="input-elderly" placeholder="e.g., General Checkup" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('doctor')}</label>
              <input value={formDoctor} onChange={e => setFormDoctor(e.target.value)} className="input-elderly" placeholder="e.g., Dr. Priya Sharma" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('hospital')}</label>
              <input value={formLocation} onChange={e => setFormLocation(e.target.value)} className="input-elderly" placeholder="e.g., NE Health Center" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="input-elderly" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('time')}</label>
                <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} className="input-elderly" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
              <input value={formNotes} onChange={e => setFormNotes(e.target.value)} className="input-elderly" placeholder="Any additional notes" />
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
