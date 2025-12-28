/**
 * Application Store
 * Global state management for the IP Management System
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { HealthStatus, User, AuthState } from '@/types';
import { apiClient } from '@/services/api';

interface AppState {
  // Health status
  healthStatus: HealthStatus | null;
  healthLoading: boolean;
  healthError: string | null;

  // Authentication
  auth: AuthState;

  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';

  // Actions
  checkHealth: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      healthStatus: null,
      healthLoading: false,
      healthError: null,

      auth: {
        isAuthenticated: false,
        user: null,
        token: localStorage.getItem('auth_token'),
        loading: false,
        error: null,
      },

      sidebarOpen: false,
      theme: 'light',

      // Actions
      checkHealth: async () => {
        set({ healthLoading: true, healthError: null });
        
        try {
          const response = await apiClient.checkHealth();
          set({
            healthStatus: {
              status: response.status as 'healthy' | 'degraded' | 'unhealthy',
              service: response.service,
              version: response.version,
              timestamp: new Date().toISOString(),
              checks: {
                database: true,
                cache: true,
                api: true,
              },
            },
            healthLoading: false,
          });
        } catch (error) {
          set({
            healthError: error instanceof Error ? error.message : 'Health check failed',
            healthLoading: false,
          });
        }
      },

      login: async (username: string, password: string) => {
        set(state => ({
          auth: { ...state.auth, loading: true, error: null }
        }));

        try {
          // Mock login - replace with actual API call
          const mockUser: User = {
            id: '1',
            username,
            email: `${username}@bosch.com`,
            role: 'admin',
            permissions: ['read', 'write', 'delete'],
            lastLogin: new Date().toISOString(),
          };

          const mockToken = 'mock-jwt-token';
          
          localStorage.setItem('auth_token', mockToken);
          apiClient.setAuthToken(mockToken);

          set(state => ({
            auth: {
              ...state.auth,
              isAuthenticated: true,
              user: mockUser,
              token: mockToken,
              loading: false,
            }
          }));
        } catch (error) {
          set(state => ({
            auth: {
              ...state.auth,
              loading: false,
              error: error instanceof Error ? error.message : 'Login failed',
            }
          }));
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        apiClient.removeAuthToken();
        
        set(state => ({
          auth: {
            ...state.auth,
            isAuthenticated: false,
            user: null,
            token: null,
          }
        }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        localStorage.setItem('theme', theme);
      },
    }),
    {
      name: 'app-store',
    }
  )
);