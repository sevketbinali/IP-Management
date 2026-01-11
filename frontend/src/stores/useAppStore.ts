/**
 * App Store - Global application state
 */

import { create } from 'zustand';
import { AppState } from '@/types';

interface AppStore extends AppState {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkHealth: () => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  isLoading: false,
  error: null,
  healthStatus: 'healthy',
  lastHealthCheck: new Date().toISOString(),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  setError: (error: string | null) => set({ error }),
  
  clearError: () => set({ error: null }),

  checkHealth: async () => {
    try {
      set({ isLoading: true });
      
      // Simulate health check - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({
        healthStatus: 'healthy',
        lastHealthCheck: new Date().toISOString(),
        isLoading: false,
      });
    } catch (error) {
      set({
        healthStatus: 'down',
        error: 'Health check failed',
        isLoading: false,
      });
    }
  },
}));