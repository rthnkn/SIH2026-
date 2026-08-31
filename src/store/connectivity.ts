import { create } from 'zustand';

interface ConnectivityStore {
  isOnline: boolean;
  pendingSyncCount: number;
  setOnline: (online: boolean) => void;
  addPending: () => void;
  clearPending: () => void;
}

export const useConnectivityStore = create<ConnectivityStore>((set) => ({
  isOnline: navigator.onLine,
  pendingSyncCount: 0,
  setOnline: (online) => set({ isOnline: online }),
  addPending: () => set((s) => ({ pendingSyncCount: s.pendingSyncCount + 1 })),
  clearPending: () => set({ pendingSyncCount: 0 }),
}));

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useConnectivityStore.getState().setOnline(true);
  });
  window.addEventListener('offline', () => {
    useConnectivityStore.getState().setOnline(false);
  });
}
