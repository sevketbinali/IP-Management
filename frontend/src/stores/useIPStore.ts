/**
 * IP Store
 * State management for IP device allocations within VLANs
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

interface IpDevice {
  id: string;
  vlanId: string;
  ipAddress: string;
  ciName: string;
  macAddress: string;
  description: string;
  status: 'active' | 'inactive' | 'reserved' | 'conflict';
  deviceType: string;
  lastSeen: string;
  isReserved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DeviceFormData {
  vlanId: string;
  ipAddress: string;
  ciName: string;
  macAddress: string;
  description: string;
  deviceType: string;
}

interface IpState {
  // Data
  devices: IpDevice[];
  selectedDevice: IpDevice | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchDevicesByVlan: (vlanId: string) => Promise<void>;
  addDevice: (data: DeviceFormData) => Promise<void>;
  updateDevice: (id: string, data: Partial<DeviceFormData>) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  selectDevice: (device: IpDevice | null) => void;
  clearError: () => void;
  
  // Utility functions
  isIpAvailable: (vlanId: string, ipAddress: string, excludeDeviceId?: string) => boolean;
  getDevicesByStatus: (status: string) => IpDevice[];
}

// Mock data generator
const generateMockDevices = (vlanId: string): IpDevice[] => {
  const deviceTypes = ['PLC', 'HMI', 'Robot Controller', 'Vision System', 'Sensor', 'Gateway', 'Switch', 'Server'];
  const statuses: Array<'active' | 'inactive' | 'reserved' | 'conflict'> = ['active', 'active', 'active', 'inactive'];
  
  const baseIp = '192.168.100'; // This should be derived from VLAN subnet
  const deviceCount = Math.floor(Math.random() * 15) + 5;
  
  return Array.from({ length: deviceCount }, (_, i) => {
    const ipOctet = 10 + i; // Start from .10 to avoid reserved range
    const isReserved = ipOctet <= 6 || ipOctet >= 254; // First 6 and last IP are reserved
    
    return {
      id: `device-${vlanId}-${i + 1}`,
      vlanId,
      ipAddress: `${baseIp}.${ipOctet}`,
      ciName: `${deviceTypes[i % deviceTypes.length]}-${String(i + 1).padStart(3, '0')}`,
      macAddress: `00:1B:44:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()}`,
      description: `${deviceTypes[i % deviceTypes.length]} device in manufacturing zone`,
      status: isReserved ? 'reserved' : statuses[i % statuses.length],
      deviceType: deviceTypes[i % deviceTypes.length],
      lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      isReserved,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

export const useIpStore = create<IpState>()(
  devtools(
    (set, get) => ({
      // Initial state
      devices: [],
      selectedDevice: null,
      loading: false,
      error: null,

      // Actions
      fetchDevicesByVlan: async (vlanId: string) => {
        set({ loading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 600));
          
          const mockDevices = generateMockDevices(vlanId);
          
          set({
            devices: mockDevices,
            loading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch devices',
            loading: false,
          });
          toast.error('Failed to fetch devices');
        }
      },

      addDevice: async (data: DeviceFormData) => {
        set({ loading: true, error: null });
        
        try {
          // Validate IP availability
          if (!get().isIpAvailable(data.vlanId, data.ipAddress)) {
            throw new Error('IP address is already in use');
          }

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const newDevice: IpDevice = {
            id: `device-${Date.now()}`,
            ...data,
            status: 'active',
            lastSeen: new Date().toISOString(),
            isReserved: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            devices: [...state.devices, newDevice],
            loading: false,
          }));
          
          toast.success('Device added successfully');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add device',
            loading: false,
          });
          toast.error(error instanceof Error ? error.message : 'Failed to add device');
        }
      },

      updateDevice: async (id: string, data: Partial<DeviceFormData>) => {
        set({ loading: true, error: null });
        
        try {
          // If IP address is being changed, validate availability
          if (data.ipAddress) {
            const device = get().devices.find(d => d.id === id);
            if (device && !get().isIpAvailable(device.vlanId, data.ipAddress, id)) {
              throw new Error('IP address is already in use');
            }
          }

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 600));
          
          set(state => ({
            devices: state.devices.map(device => 
              device.id === id 
                ? { ...device, ...data, updatedAt: new Date().toISOString() }
                : device
            ),
            selectedDevice: state.selectedDevice?.id === id 
              ? { ...state.selectedDevice, ...data, updatedAt: new Date().toISOString() }
              : state.selectedDevice,
            loading: false,
          }));
          
          toast.success('Device updated successfully');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update device',
            loading: false,
          });
          toast.error(error instanceof Error ? error.message : 'Failed to update device');
        }
      },

      deleteDevice: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
          // Check if device is reserved (cannot be deleted)
          const device = get().devices.find(d => d.id === id);
          if (device?.isReserved) {
            throw new Error('Reserved devices cannot be deleted');
          }

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 400));
          
          set(state => ({
            devices: state.devices.filter(device => device.id !== id),
            selectedDevice: state.selectedDevice?.id === id ? null : state.selectedDevice,
            loading: false,
          }));
          
          toast.success('Device deleted successfully');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete device',
            loading: false,
          });
          toast.error(error instanceof Error ? error.message : 'Failed to delete device');
        }
      },

      selectDevice: (device: IpDevice | null) => {
        set({ selectedDevice: device });
      },

      clearError: () => {
        set({ error: null });
      },

      // Utility functions
      isIpAvailable: (vlanId: string, ipAddress: string, excludeDeviceId?: string) => {
        const devices = get().devices.filter(d => 
          d.vlanId === vlanId && 
          d.ipAddress === ipAddress &&
          d.id !== excludeDeviceId
        );
        return devices.length === 0;
      },

      getDevicesByStatus: (status: string) => {
        return get().devices.filter(device => device.status === status);
      },
    }),
    {
      name: 'ip-store',
    }
  )
);