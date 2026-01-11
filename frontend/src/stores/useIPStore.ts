/**
 * IP Store - IP assignment and device management state
 */

import { create } from 'zustand';
import { Device, DeviceState } from '@/types';
import { realIpService } from '@/services/realApiService';

interface IpStore extends DeviceState {
  fetchDevices: () => Promise<void>;
  fetchDevicesByVlan: (vlanId: string) => Promise<void>;
  selectDevice: (device: Device | null) => void;
  createDevice: (data: any) => Promise<void>;
  updateDevice: (id: string, data: any) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  clearError: () => void;
}

export const useIpStore = create<IpStore>((set, get) => ({
  devices: [],
  selectedDevice: null,
  loading: false,
  error: null,
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,

  fetchDevices: async () => {
    try {
      set({ loading: true, error: null });
      const devices = await realIpService.getIpAssignments();
      set({ devices, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch devices', 
        loading: false 
      });
    }
  },

  fetchDevicesByVlan: async (vlanId: string) => {
    try {
      set({ loading: true, error: null });
      const devices = await realIpService.getIpAssignmentsByVlan(vlanId);
      set({ devices, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch devices for VLAN', 
        loading: false 
      });
    }
  },

  selectDevice: (device: Device | null) => {
    set({ selectedDevice: device });
  },

  createDevice: async (data: any) => {
    try {
      set({ loading: true, error: null });
      await realIpService.createIpAssignment(data);
      
      // Refresh devices list
      await get().fetchDevices();
      set({ showCreateModal: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create device', 
        loading: false 
      });
    }
  },

  updateDevice: async (id: string, data: any) => {
    try {
      set({ loading: true, error: null });
      await realIpService.updateIpAssignment(id, data);
      
      // Refresh devices list
      await get().fetchDevices();
      set({ showEditModal: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update device', 
        loading: false 
      });
    }
  },

  deleteDevice: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await realIpService.deleteIpAssignment(id);
      
      // Refresh devices list
      await get().fetchDevices();
      set({ showDeleteModal: false, selectedDevice: null });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete device', 
        loading: false 
      });
    }
  },

  setShowCreateModal: (show: boolean) => set({ showCreateModal: show }),
  setShowEditModal: (show: boolean) => set({ showEditModal: show }),
  setShowDeleteModal: (show: boolean) => set({ showDeleteModal: show }),
  clearError: () => set({ error: null }),
}));