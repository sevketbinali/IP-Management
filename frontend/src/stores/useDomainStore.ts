/**
 * Domain Store - Domain management state
 */

import { create } from 'zustand';
import { Domain, DomainState } from '@/types';
import { realDomainService } from '@/services/realApiService';

interface DomainStore extends DomainState {
  fetchDomains: () => Promise<void>;
  fetchDomain: (id: string) => Promise<void>;
  selectDomain: (domain: Domain | null) => void;
  createDomain: (data: any) => Promise<void>;
  updateDomain: (id: string, data: any) => Promise<void>;
  deleteDomain: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDomainStore = create<DomainStore>((set, get) => ({
  domains: [],
  selectedDomain: null,
  loading: false,
  error: null,

  fetchDomains: async () => {
    try {
      set({ loading: true, error: null });
      
      // Mock data for development - replace with actual API call
      const mockDomains = [
        {
          id: '1',
          name: 'MFG - Manufacturing',
          description: 'Manufacturing domain for production lines A2, A4, A6, A10, MCO',
          valueStreamCount: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2', 
          name: 'LOG - Logistics',
          description: 'Logistics domain for LOG21 operations',
          valueStreamCount: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'FCM - Facility',
          description: 'Facility domain for analyzers, cameras, building systems',
          valueStreamCount: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'ENG - Engineering',
          description: 'Engineering domain for test benches',
          valueStreamCount: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ domains: mockDomains, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch domains', 
        loading: false 
      });
    }
  },

  fetchDomain: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const response = await realDomainService.getDomain(id);
      set({ selectedDomain: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch domain', 
        loading: false 
      });
    }
  },

  selectDomain: (domain: Domain | null) => {
    set({ selectedDomain: domain });
  },

  createDomain: async (data: any) => {
    try {
      set({ loading: true, error: null });
      // Implementation would call API to create domain
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh domains list
      await get().fetchDomains();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create domain', 
        loading: false 
      });
    }
  },

  updateDomain: async (id: string, data: any) => {
    try {
      set({ loading: true, error: null });
      // Implementation would call API to update domain
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh domains list
      await get().fetchDomains();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update domain', 
        loading: false 
      });
    }
  },

  deleteDomain: async (id: string) => {
    try {
      set({ loading: true, error: null });
      // Implementation would call API to delete domain
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh domains list
      await get().fetchDomains();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete domain', 
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));