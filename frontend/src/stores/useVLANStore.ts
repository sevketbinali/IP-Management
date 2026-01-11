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
      
      // Mock VLAN data for development
      const mockVlans = [
        {
          id: '1',
          domainId: '1',
          vlanId: 100,
          name: 'Production Line A2',
          subnet: '192.168.100.0',
          subnetMask: '255.255.255.0',
          gateway: '192.168.100.1',
          netStart: '192.168.100.7',
          netEnd: '192.168.100.254',
          zoneName: 'MFG Zone A2',
          zoneManager: 'Ahmet Yılmaz',
          securityType: 'MFZ_SL4' as const,
          status: 'active' as const,
          utilization: 65,
          totalIps: 248,
          usedIps: 161,
          lastFirewallCheck: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          domainId: '1',
          vlanId: 101,
          name: 'Production Line A4',
          subnet: '192.168.101.0',
          subnetMask: '255.255.255.0',
          gateway: '192.168.101.1',
          netStart: '192.168.101.7',
          netEnd: '192.168.101.254',
          zoneName: 'MFG Zone A4',
          zoneManager: 'Mehmet Demir',
          securityType: 'MFZ_SL4' as const,
          status: 'active' as const,
          utilization: 78,
          totalIps: 248,
          usedIps: 193,
          lastFirewallCheck: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          domainId: '2',
          vlanId: 200,
          name: 'Logistics LOG21',
          subnet: '192.168.200.0',
          subnetMask: '255.255.255.0',
          gateway: '192.168.200.1',
          netStart: '192.168.200.7',
          netEnd: '192.168.200.254',
          zoneName: 'LOG Zone 21',
          zoneManager: 'Fatma Kaya',
          securityType: 'LOG_SL4' as const,
          status: 'active' as const,
          utilization: 45,
          totalIps: 248,
          usedIps: 112,
          lastFirewallCheck: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          domainId: '3',
          vlanId: 300,
          name: 'Facility Cameras',
          subnet: '192.168.300.0',
          subnetMask: '255.255.255.0',
          gateway: '192.168.300.1',
          netStart: '192.168.300.7',
          netEnd: '192.168.300.254',
          zoneName: 'FCM Camera Zone',
          zoneManager: 'Ali Özkan',
          securityType: 'FMZ_SL4' as const,
          status: 'warning' as const,
          utilization: 89,
          totalIps: 248,
          usedIps: 221,
          lastFirewallCheck: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          domainId: '4',
          vlanId: 400,
          name: 'Engineering Test Bench',
          subnet: '192.168.400.0',
          subnetMask: '255.255.255.0',
          gateway: '192.168.400.1',
          netStart: '192.168.400.7',
          netEnd: '192.168.400.254',
          zoneName: 'ENG Test Zone',
          zoneManager: 'Zeynep Şahin',
          securityType: 'ENG_SL4' as const,
          status: 'active' as const,
          utilization: 32,
          totalIps: 248,
          usedIps: 79,
          lastFirewallCheck: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set({ vlans: mockVlans, loading: false });
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