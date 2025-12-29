/**
 * VLAN Store
 * State management for VLAN operations with domain hierarchy
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

interface Vlan {
  id: string;
  domainId: string;
  vlanId: number;
  name: string;
  subnet: string;
  subnetMask: string;
  gateway: string;
  netStart: string;
  netEnd: string;
  zoneName: string;
  zoneManager: string;
  securityType: string;
  status: 'active' | 'inactive' | 'warning' | 'error';
  utilization: number;
  totalIps: number;
  usedIps: number;
  lastFirewallCheck: string;
  createdAt: string;
  updatedAt: string;
}

interface VlanFormData {
  vlanId: number;
  name: string;
  subnet: string;
  subnetMask: string;
  gateway: string;
  zoneName: string;
  zoneManager: string;
  securityType: string;
}

interface VlanState {
  // Data
  vlans: Vlan[];
  selectedVlan: Vlan | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Modal states
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  
  // Actions
  fetchVlansByDomain: (domainId: string) => Promise<void>;
  createVlan: (domainId: string, data: VlanFormData) => Promise<void>;
  updateVlan: (id: string, data: Partial<VlanFormData>) => Promise<void>;
  deleteVlan: (id: string) => Promise<void>;
  selectVlan: (vlan: Vlan | null) => void;
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  clearError: () => void;
  
  // IP Range calculation
  calculateIpRange: (subnet: string, subnetMask: string) => { netStart: string; netEnd: string; totalIps: number };
}

// Mock data generator
const generateMockVlans = (domainId: string): Vlan[] => {
  const securityTypes = ['SL3', 'MFZ_SL4', 'LOG_SL4', 'FMZ_SL4', 'ENG_SL4', 'LRSZ_SL4', 'RSZ_SL4'];
  const zones = ['Manufacturing A2', 'Manufacturing A4', 'Logistics LOG21', 'Engineering Test', 'Office Network'];
  const statuses: Array<'active' | 'inactive' | 'warning' | 'error'> = ['active', 'active', 'active', 'warning', 'inactive'];
  
  return Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, i) => ({
    id: `vlan-${domainId}-${i + 1}`,
    domainId,
    vlanId: 100 + i,
    name: `${zones[i % zones.length]} VLAN`,
    subnet: `192.168.${100 + i}.0`,
    subnetMask: '255.255.255.0',
    gateway: `192.168.${100 + i}.1`,
    netStart: `192.168.${100 + i}.7`,
    netEnd: `192.168.${100 + i}.254`,
    zoneName: zones[i % zones.length],
    zoneManager: `manager${i + 1}@bosch.com`,
    securityType: securityTypes[i % securityTypes.length],
    status: statuses[i % statuses.length],
    utilization: Math.floor(Math.random() * 95) + 5,
    totalIps: 248,
    usedIps: Math.floor(Math.random() * 200) + 10,
    lastFirewallCheck: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

export const useVlanStore = create<VlanState>()(
  devtools(
    (set, get) => ({
      // Initial state
      vlans: [],
      selectedVlan: null,
      loading: false,
      error: null,
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,

      // Actions
      fetchVlansByDomain: async (domainId: string) => {
        set({ loading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const mockVlans = generateMockVlans(domainId);
          
          set({
            vlans: mockVlans,
            loading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch VLANs',
            loading: false,
          });
          toast.error('Failed to fetch VLANs');
        }
      },

      createVlan: async (domainId: string, data: VlanFormData) => {
        set({ loading: true, error: null });
        
        try {
          // Calculate IP range
          const { netStart, netEnd, totalIps } = get().calculateIpRange(data.subnet, data.subnetMask);
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newVlan: Vlan = {
            id: `vlan-${Date.now()}`,
            domainId,
            ...data,
            netStart,
            netEnd,
            status: 'active',
            utilization: 0,
            totalIps,
            usedIps: 0,
            lastFirewallCheck: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            vlans: [...state.vlans, newVlan],
            loading: false,
            showCreateModal: false,
          }));
          
          toast.success('VLAN created successfully');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create VLAN',
            loading: false,
          });
          toast.error('Failed to create VLAN');
        }
      },

      updateVlan: async (id: string, data: Partial<VlanFormData>) => {
        set({ loading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          set(state => ({
            vlans: state.vlans.map(vlan => 
              vlan.id === id 
                ? { ...vlan, ...data, updatedAt: new Date().toISOString() }
                : vlan
            ),
            selectedVlan: state.selectedVlan?.id === id 
              ? { ...state.selectedVlan, ...data, updatedAt: new Date().toISOString() }
              : state.selectedVlan,
            loading: false,
            showEditModal: false,
          }));
          
          toast.success('VLAN updated successfully');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update VLAN',
            loading: false,
          });
          toast.error('Failed to update VLAN');
        }
      },

      deleteVlan: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 600));
          
          set(state => ({
            vlans: state.vlans.filter(vlan => vlan.id !== id),
            selectedVlan: state.selectedVlan?.id === id ? null : state.selectedVlan,
            loading: false,
            showDeleteModal: false,
          }));
          
          toast.success('VLAN deleted successfully');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete VLAN',
            loading: false,
          });
          toast.error('Failed to delete VLAN');
        }
      },

      selectVlan: (vlan: Vlan | null) => {
        set({ selectedVlan: vlan });
      },

      setShowCreateModal: (show: boolean) => {
        set({ showCreateModal: show });
      },

      setShowEditModal: (show: boolean) => {
        set({ showEditModal: show });
      },

      setShowDeleteModal: (show: boolean) => {
        set({ showDeleteModal: show });
      },

      clearError: () => {
        set({ error: null });
      },

      // IP Range calculation utility
      calculateIpRange: (subnet: string, subnetMask: string) => {
        try {
          // Simple IP range calculation for common subnet masks
          const subnetParts = subnet.split('.').map(Number);
          const maskParts = subnetMask.split('.').map(Number);
          
          // Calculate network and broadcast addresses
          const networkParts = subnetParts.map((part, i) => part & maskParts[i]);
          const broadcastParts = networkParts.map((part, i) => part | (255 - maskParts[i]));
          
          // First 6 IPs and last IP are reserved
          const netStartParts = [...networkParts];
          netStartParts[3] += 7; // Skip first 6 + network address
          
          const netEndParts = [...broadcastParts];
          netEndParts[3] -= 1; // Skip broadcast address
          
          const netStart = netStartParts.join('.');
          const netEnd = netEndParts.join('.');
          
          // Calculate total available IPs (excluding reserved)
          const totalIps = (broadcastParts[3] - networkParts[3] + 1) - 7; // -7 for reserved IPs
          
          return { netStart, netEnd, totalIps };
        } catch (error) {
          // Fallback for invalid input
          return { netStart: '192.168.1.7', netEnd: '192.168.1.254', totalIps: 248 };
        }
      },
    }),
    {
      name: 'vlan-store',
    }
  )
);