import { useConnectivityStore } from '../store/connectivity';
import { useI18n } from '../i18n';

export default function ConnectivityBanner() {
  const { isOnline, pendingSyncCount } = useConnectivityStore();
  const { t } = useI18n();

  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <div className={`px-4 py-2 text-center text-sm font-medium ${
      isOnline
        ? 'bg-amber-100 text-amber-800'
        : 'bg-orange-100 text-orange-800'
    }`}>
      {isOnline ? (
        <span>🔄 {t('synced')} {pendingSyncCount > 0 && `(${pendingSyncCount} pending)`}</span>
      ) : (
        <span>🟠 {t('offline')}</span>
      )}
    </div>
  );
}
