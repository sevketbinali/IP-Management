/**
 * VLAN Store - VLAN management state
 */

import { create } from 'zustand';
import { Vlan, VlanState } from '@/types';
import { realVlanService } from '@/services/realApiService';

interface VlanStore extends VlanState {
  fetchVlans: () => Promise<void>;
  fetchVlansByDomain: (domainId: string) => Promise<void>;
  fetchVlansByZone: (zoneId: string) => Promise<void>;
  selectVlan: (vlan: Vlan | null) => void;
  createVlan: (data: any) => Promise<void>;
  updateVlan: (id: string, data: any) => Promise<void>;
  deleteVlan: (id: string) => Promise<void>;
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  clearError: () => void;
}

export const useVlanStore = create<VlanStore>((set, get) => ({
  vlans: [],
  selectedVlan: null,
  loading: false,
  error: null,
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,

  fetchVlans: async () => {
    try {
      set({ loading: true, error: null });
      const vlans = await realVlanService.getVlans();
      set({ vlans, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch VLANs', 
        loading: false 
      });
    }
  },

  fetchVlansByDomain: async (domainId: string) => {
    try {
      set({ loading: true, error: null });
      // This would filter VLANs by domain in a real implementation
      const allVlans = await realVlanService.getVlans();
      const domainVlans = allVlans.filter(vlan => vlan.domainId === domainId);
      set({ vlans: domainVlans, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch VLANs for domain', 
        loading: false 
      });
    }
  },

  fetchVlansByZone: async (zoneId: string) => {
    try {
      set({ loading: true, error: null });
      const vlans = await realVlanService.getVlansByZone(zoneId);
      set({ vlans, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch VLANs for zone', 
        loading: false 
      });
    }
  },

  selectVlan: (vlan: Vlan | null) => {
    set({ selectedVlan: vlan });
  },

  createVlan: async (data: any) => {
    try {
      set({ loading: true, error: null });
      // Implementation would call API to create VLAN
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh VLANs list
      await get().fetchVlans();
      set({ showCreateModal: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create VLAN', 
        loading: false 
      });
    }
  },

  updateVlan: async (id: string, data: any) => {
    try {
      set({ loading: true, error: null });
      // Implementation would call API to update VLAN
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh VLANs list
      await get().fetchVlans();
      set({ showEditModal: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update VLAN', 
        loading: false 
      });
    }
  },

  deleteVlan: async (id: string) => {
    try {
      set({ loading: true, error: null });
      // Implementation would call API to delete VLAN
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh VLANs list
      await get().fetchVlans();
      set({ showDeleteModal: false, selectedVlan: null });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete VLAN', 
        loading: false 
      });
    }
  },

  setShowCreateModal: (show: boolean) => set({ showCreateModal: show }),
  setShowEditModal: (show: boolean) => set({ showEditModal: show }),
  setShowDeleteModal: (show: boolean) => set({ showDeleteModal: show }),
  clearError: () => set({ error: null }),
}));