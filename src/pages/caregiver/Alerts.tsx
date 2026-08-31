import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { Alert } from '../../types';
import { Bell, CheckCircle, Filter } from 'lucide-react';

export default function CaregiverAlerts() {
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  useEffect(() => { loadAlerts(); }, [currentUser?.id, filter, severityFilter]);

  const loadAlerts = async () => {
    if (!currentUser) return;
    let collection = db.alerts.where('caregiverId').equals(currentUser.id);

    let results = await collection.toArray();
    if (filter === 'active') results = results.filter(a => a.status === 'active');
    if (filter === 'resolved') results = results.filter(a => a.status === 'resolved');
    if (severityFilter !== 'all') results = results.filter(a => a.severity === severityFilter);

    setAlerts(results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const resolveAlert = async (id: string) => {
    await db.alerts.update(id, { status: 'resolved', resolvedAt: new Date().toISOString() });
    loadAlerts();
  };

  const dismissAlert = async (id: string) => {
    await db.alerts.update(id, { status: 'dismissed' });
    loadAlerts();
  };

  const severityConfig: Record<string, { icon: string; color: string; bg: string }> = {
    critical: { icon: '🔴', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    warning: { icon: '🟡', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    info: { icon: '🔵', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    success: { icon: '🟢', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">{t('allAlerts')}</h1>
        <p className="text-gray-500">{alerts.filter(a => a.status === 'active').length} active alerts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['all', 'active', 'resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f ? 'bg-white shadow text-gray-800' : 'text-gray-500'
              }`}
            >
              {f === 'all' ? 'All' : f === 'active' ? t('active') : t('resolved')}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {['all', 'critical', 'warning', 'info', 'success'].map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                severityFilter === s ? 'bg-white shadow text-gray-800' : 'text-gray-500'
              }`}
            >
              {s === 'all' ? 'All' : s === 'critical' ? t('critical') : s === 'warning' ? t('warning') : s === 'info' ? t('info') : t('success')}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {alerts.map(alert => {
          const config = severityConfig[alert.severity] || severityConfig.info;
          return (
            <div key={alert.id} className={`card-elderly border ${config.bg} ${
              alert.status === 'resolved' ? 'opacity-60' : ''
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                    <span className={`text-xs font-semibold capitalize ${
                      alert.status === 'active' ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                </div>
                {alert.status === 'active' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-colors"
                      title="Mark Resolved"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors text-sm"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Bell size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg">No alerts to display</p>
            <p className="text-sm mt-1">All clear! ✓</p>
          </div>
        )}
      </div>
    </div>
  );
}
