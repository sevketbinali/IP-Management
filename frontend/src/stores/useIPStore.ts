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
      
      // Mock device data for development
      const mockDevices = [
        {
          id: '1',
          vlanId: '1',
          ipAddress: '192.168.100.10',
          ciName: 'PLC-A2-001',
          macAddress: '00:1B:44:11:3A:B7',
          description: 'Main PLC for production line A2',
          status: 'active' as const,
          deviceType: 'PLC',
          lastSeen: new Date().toISOString(),
          isReserved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          vlanId: '1',
          ipAddress: '192.168.100.11',
          ciName: 'HMI-A2-001',
          macAddress: '00:1B:44:11:3A:B8',
          description: 'HMI panel for line A2',
          status: 'active' as const,
          deviceType: 'HMI',
          lastSeen: new Date().toISOString(),
          isReserved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          vlanId: '2',
          ipAddress: '192.168.101.10',
          ciName: 'ROBOT-A4-001',
          macAddress: '00:1B:44:11:3A:C1',
          description: 'Industrial robot controller A4',
          status: 'active' as const,
          deviceType: 'Robot Controller',
          lastSeen: new Date().toISOString(),
          isReserved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          vlanId: '3',
          ipAddress: '192.168.200.10',
          ciName: 'GATEWAY-LOG21-001',
          macAddress: '00:1B:44:11:3A:D1',
          description: 'Logistics gateway LOG21',
          status: 'active' as const,
          deviceType: 'Gateway',
          lastSeen: new Date().toISOString(),
          isReserved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          vlanId: '4',
          ipAddress: '192.168.300.10',
          ciName: 'CAMERA-FCM-001',
          macAddress: '00:1B:44:11:3A:E1',
          description: 'Security camera facility',
          status: 'active' as const,
          deviceType: 'Vision System',
          lastSeen: new Date().toISOString(),
          isReserved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '6',
          vlanId: '5',
          ipAddress: '192.168.400.10',
          ciName: 'TESTBENCH-ENG-001',
          macAddress: '00:1B:44:11:3A:F1',
          description: 'Engineering test bench',
          status: 'active' as const,
          deviceType: 'Test Equipment',
          lastSeen: new Date().toISOString(),
          isReserved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      set({ devices: mockDevices, loading: false });
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