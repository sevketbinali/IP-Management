/**
 * IP Management Store
 * State management for IP allocation operations
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { IPAllocation, IPAllocationFormData, VLAN, PaginationState, FilterState } from '@/types';
import { ipService } from '@/services/ipService';
import toast from 'react-hot-toast';

interface IPState {
  // Data
  allocations: IPAllocation[];
  selectedAllocation: IPAllocation | null;
  vlans: VLAN[];
  selectedVlan: VLAN | null;
  availableIPs: string[];
  reservedIPs: string[];
  
  // UI State
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: FilterState & {
    vlanId?: string;
    status?: string;
    allocationType?: string;
  };
  
  // Modal states
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  showBulkModal: boolean;
  allocationMode: 'manual' | 'automatic';
  
  // Actions
  fetchIPAllocations: () => Promise<void>;
  fetchVLANs: () => Promise<void>;
  fetchAvailableIPs: (vlanId: string) => Promise<void>;
  fetchReservedIPs: (vlanId: string) => Promise<void>;
  createIPAllocation: (data: IPAllocationFormData) => Promise<void>;
  updateIPAllocation: (id: string, data: Partial<IPAllocationFormData>) => Promise<void>;
  deleteIPAllocation: (id: string) => Promise<void>;
  bulkAllocateIPs: (allocations: IPAllocationFormData[]) => Promise<void>;
  selectAllocation: (allocation: IPAllocation | null) => void;
  selectVlan: (vlan: VLAN | null) => void;
  validateMACAddress: (macAddress: string, excludeId?: string) => Promise<boolean>;
  checkIPAvailability: (vlanId: string, ipAddress: string, excludeId?: string) => Promise<boolean>;
  getNextAvailableIP: (vlanId: string) => Promise<string | null>;
  setFilters: (filters: Partial<FilterState & { vlanId?: string; status?: string; allocationType?: string }>) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setAllocationMode: (mode: 'manual' | 'automatic') => void;
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  setShowBulkModal: (show: boolean) => void;
  clearError: () => void;
}

export const useIPStore = create<IPState>()(
  devtools(
    (set, get) => ({
      // Initial state
      allocations: [],
      selectedAllocation: null,
      vlans: [],
      selectedVlan: null,
      availableIPs: [],
      reservedIPs: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
      },
      filters: {
        search: '',
        sortBy: 'ipAddress',
        sortOrder: 'asc',
        vlanId: '',
        status: '',
        allocationType: '',
      },
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showBulkModal: false,
      allocationMode: 'automatic',

      // Actions
      fetchIPAllocations: async () => {
        set({ loading: true, error: null });
        
        try {
          const { pagination, filters } = get();
          const response = await ipService.getIPAllocations({
            page: pagination.page,
            pageSize: pagination.pageSize,
            search: filters.search,
            vlanId: filters.vlanId,
            status: filters.status,
            allocationType: filters.allocationType,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
          });

          set({
            allocations: response.data,
            pagination: {
              ...pagination,
              total: response.meta?.pagination?.total || 0,
            },
            loading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch IP allocations',
            loading: false,
          });
          toast.error('Failed to fetch IP allocations');
        }
      },

      fetchVLANs: async () => {
        try {
          // This would typically come from the VLAN service
          // For now, we'll use a mock implementation
          const mockVLANs: VLAN[] = [
            {
              id: '1',
              vlanId: 100,
              subnet: '192.168.1.0',
              subnetMask: 24,
              defaultGateway: '192.168.1.1',
              networkStart: '192.168.1.1',
              networkEnd: '192.168.1.254',
              zoneId: '1',
              zoneName: 'Manufacturing Zone A2',
              zoneManager: 'John Doe',
              lastFirewallCheck: null,
              firewall: 'bu4-fw-ha01',
              ipAllocationCount: 45,
              availableIpCount: 200,
              reservedIpCount: 7,
              totalIpCount: 254,
              utilizationPercentage: 18,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          
          set({ vlans: mockVLANs });
        } catch (error) {
          console.error('Failed to fetch VLANs:', error);
        }
      },

      fetchAvailableIPs: async (vlanId: string) => {
        try {
          const response = await ipService.getAvailableIPs(vlanId);
          set({ availableIPs: response.data });
        } catch (error) {
          console.error('Failed to fetch available IPs:', error);
          toast.error('Failed to fetch available IP addresses');
        }
      },

      fetchReservedIPs: async (vlanId: string) => {
        try {
          const response = await ipService.getReservedIPs(vlanId);
          set({ reservedIPs: response.data });
        } catch (error) {
          console.error('Failed to fetch reserved IPs:', error);
          toast.error('Failed to fetch reserved IP addresses');
        }
      },

      createIPAllocation: async (data: IPAllocationFormData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await ipService.createIPAllocation(data);
          
          set(state => ({
            allocations: [...state.allocations, response.data],
            loading: false,
            showCreateModal: false,
          }));
          
          toast.success('IP allocation created successfully');
          
          // Refresh available IPs if a VLAN is selected
          const { selectedVlan } = get();
          if (selectedVlan) {
            get().fetchAvailableIPs(selectedVlan.id);
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create IP allocation',
            loading: false,
          });
          toast.error('Failed to create IP allocation');
        }
      },

      updateIPAllocation: async (id: string, data: Partial<IPAllocationFormData>) => {
        set({ loading: true, error: null });
        
        try {
          const response = await ipService.updateIPAllocation(id, data);
          
          set(state => ({
            allocations: state.allocations.map(allocation => 
              allocation.id === id ? response.data : allocation
            ),
            selectedAllocation: state.selectedAllocation?.id === id ? response.data : state.selectedAllocation,
            loading: false,
            showEditModal: false,
          }));
          
          toast.success('IP allocation updated successfully');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update IP allocation',
            loading: false,
          });
          toast.error('Failed to update IP allocation');
        }
      },

      deleteIPAllocation: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
          await ipService.deleteIPAllocation(id);
          
          set(state => ({
            allocations: state.allocations.filter(allocation => allocation.id !== id),
            selectedAllocation: state.selectedAllocation?.id === id ? null : state.selectedAllocation,
            loading: false,
            showDeleteModal: false,
          }));
          
          toast.success('IP allocation deleted successfully');
          
          // Refresh available IPs if a VLAN is selected
          const { selectedVlan } = get();
          if (selectedVlan) {
            get().fetchAvailableIPs(selectedVlan.id);
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete IP allocation',
            loading: false,
          });
          toast.error('Failed to delete IP allocation');
        }
      },

      bulkAllocateIPs: async (allocations: IPAllocationFormData[]) => {
        set({ loading: true, error: null });
        
        try {
          const response = await ipService.bulkAllocateIPs(allocations);
          
          set(state => ({
            allocations: [...state.allocations, ...response.data.successful],
            loading: false,
            showBulkModal: false,
          }));
          
          const successCount = response.data.successful.length;
          const failCount = response.data.failed.length;
          
          if (failCount > 0) {
            toast.error(`${successCount} allocations created, ${failCount} failed`);
          } else {
            toast.success(`${successCount} IP allocations created successfully`);
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create bulk IP allocations',
            loading: false,
          });
          toast.error('Failed to create bulk IP allocations');
        }
      },

      selectAllocation: (allocation: IPAllocation | null) => {
        set({ selectedAllocation: allocation });
      },

      selectVlan: (vlan: VLAN | null) => {
        set({ selectedVlan: vlan });
        
        if (vlan) {
          get().fetchAvailableIPs(vlan.id);
          get().fetchReservedIPs(vlan.id);
        } else {
          set({ availableIPs: [], reservedIPs: [] });
        }
      },

      validateMACAddress: async (macAddress: string, excludeId?: string) => {
        try {
          const response = await ipService.validateMACAddress(macAddress, excludeId);
          return response.data.isValid && response.data.isUnique;
        } catch (error) {
          console.error('Failed to validate MAC address:', error);
          return false;
        }
      },

      checkIPAvailability: async (vlanId: string, ipAddress: string, excludeId?: string) => {
        try {
          const response = await ipService.checkIPAvailability(vlanId, ipAddress, excludeId);
          return response.data.isAvailable && !response.data.isReserved;
        } catch (error) {
          console.error('Failed to check IP availability:', error);
          return false;
        }
      },

      getNextAvailableIP: async (vlanId: string) => {
        try {
          const response = await ipService.getNextAvailableIP(vlanId);
          return response.data.ipAddress;
        } catch (error) {
          console.error('Failed to get next available IP:', error);
          return null;
        }
      },

      setFilters: (newFilters: Partial<FilterState & { vlanId?: string; status?: string; allocationType?: string }>) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 }, // Reset to first page
        }));
        
        // Automatically fetch allocations when filters change
        setTimeout(() => get().fetchIPAllocations(), 0);
      },

      setPagination: (newPagination: Partial<PaginationState>) => {
        set(state => ({
          pagination: { ...state.pagination, ...newPagination },
        }));
        
        // Automatically fetch allocations when pagination changes
        setTimeout(() => get().fetchIPAllocations(), 0);
      },

      setAllocationMode: (mode: 'manual' | 'automatic') => {
        set({ allocationMode: mode });
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

      setShowBulkModal: (show: boolean) => {
        set({ showBulkModal: show });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'ip-store',
    }
  )
);