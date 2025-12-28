/**
 * VLAN Store
 * State management for VLAN operations
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { VLAN, VLANFormData, Zone, PaginationState, FilterState, IPRange } from '@/types';
import { vlanService } from '@/services/vlanService';
import toast from 'react-hot-toast';

interface VLANState {
  // Data
  vlans: VLAN[];
  selectedVlan: VLAN | null;
  zones: Zone[];
  ipRanges: IPRange[];
  
  // UI State
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: FilterState & {
    zoneId?: string;
    firewall?: string;
  };
  
  // Modal states
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  showIPRangesModal: boolean;
  
  // Actions
  fetchVLANs: () => Promise<void>;
  fetchZones: () => Promise<void>;
  createVLAN: (data: VLANFormData) => Promise<void>;
  updateVLAN: (id: string, data: Partial<VLANFormData>) => Promise<void>;
  deleteVLAN: (id: string) => Promise<void>;
  selectVlan: (vlan: VLAN | null) => void;
  fetchIPRanges: (vlanId: string) => Promise<void>;
  validateVLAN: (data: VLANFormData) => Promise<{ isValid: boolean; errors: string[]; warnings: string[] }>;
  checkVLANIdUnique: (vlanId: number, domainId: string, excludeId?: string) => Promise<boolean>;
  updateFirewallCheck: (vlanId: string, checkDate: string) => Promise<void>;
  setFilters: (filters: Partial<FilterState & { zoneId?: string; firewall?: string }>) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  setShowIPRangesModal: (show: boolean) => void;
  clearError: () => void;
}

export const useVLANStore = create<VLANState>()(
  devtools(
    (set, get) => ({
      // Initial state
      vlans: [],
      selectedVlan: null,
      zones: [],
      ipRanges: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
      },
      filters: {
        search: '',
        sortBy: 'vlanId',
        sortOrder: 'asc',
        zoneId: '',
        firewall: '',
      },
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showIPRangesModal: false,

      // Actions
      fetchVLANs: async () => {
        set({ loading: true, error: null });
        
        try {
          const { pagination, filters } = get();
          const response = await vlanService.getVLANs({
            page: pagination.page,
            pageSize: pagination.pageSize,
            search: filters.search,
            zoneId: filters.zoneId,
            firewall: filters.firewall,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
          });

          set({
            vlans: response.data,
            pagination: {
              ...pagination,
              total: response.meta?.pagination?.total || 0,
            },
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

      fetchZones: async () => {
        try {
          // This would typically come from a zones service
          // For now, we'll use a mock implementation
          const mockZones: Zone[] = [
            {
              id: '1',
              name: 'Manufacturing Zone A2',
              securityLevel: 'MFZ_SL4' as any,
              valueStreamId: '1',
              valueStreamName: 'Production Line A',
              manager: 'John Doe',
              vlanCount: 5,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          
          set({ zones: mockZones });
        } catch (error) {
          console.error('Failed to fetch zones:', error);
        }
      },

      createVLAN: async (data: VLANFormData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await vlanService.createVLAN(data);
          
          set(state => ({
            vlans: [...state.vlans, response.data],
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

      updateVLAN: async (id: string, data: Partial<VLANFormData>) => {
        set({ loading: true, error: null });
        
        try {
          const response = await vlanService.updateVLAN(id, data);
          
          set(state => ({
            vlans: state.vlans.map(vlan => 
              vlan.id === id ? response.data : vlan
            ),
            selectedVlan: state.selectedVlan?.id === id ? response.data : state.selectedVlan,
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

      deleteVLAN: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
          await vlanService.deleteVLAN(id);
          
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

      selectVlan: (vlan: VLAN | null) => {
        set({ selectedVlan: vlan });
      },

      fetchIPRanges: async (vlanId: string) => {
        set({ loading: true, error: null });
        
        try {
          const response = await vlanService.getIPRanges(vlanId);
          set({
            ipRanges: response.data,
            loading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch IP ranges',
            loading: false,
          });
          toast.error('Failed to fetch IP ranges');
        }
      },

      validateVLAN: async (data: VLANFormData) => {
        try {
          const response = await vlanService.validateVLAN(data);
          return response.data;
        } catch (error) {
          toast.error('Failed to validate VLAN configuration');
          return { isValid: false, errors: ['Validation failed'], warnings: [] };
        }
      },

      checkVLANIdUnique: async (vlanId: number, domainId: string, excludeId?: string) => {
        try {
          const response = await vlanService.checkVLANIdUnique(vlanId, domainId, excludeId);
          return response.data.isUnique;
        } catch (error) {
          console.error('Failed to check VLAN ID uniqueness:', error);
          return false;
        }
      },

      updateFirewallCheck: async (vlanId: string, checkDate: string) => {
        try {
          const response = await vlanService.updateFirewallCheck(vlanId, checkDate);
          
          set(state => ({
            vlans: state.vlans.map(vlan => 
              vlan.id === vlanId ? response.data : vlan
            ),
            selectedVlan: state.selectedVlan?.id === vlanId ? response.data : state.selectedVlan,
          }));
          
          toast.success('Firewall check date updated');
        } catch (error) {
          toast.error('Failed to update firewall check date');
        }
      },

      setFilters: (newFilters: Partial<FilterState & { zoneId?: string; firewall?: string }>) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 }, // Reset to first page
        }));
        
        // Automatically fetch VLANs when filters change
        setTimeout(() => get().fetchVLANs(), 0);
      },

      setPagination: (newPagination: Partial<PaginationState>) => {
        set(state => ({
          pagination: { ...state.pagination, ...newPagination },
        }));
        
        // Automatically fetch VLANs when pagination changes
        setTimeout(() => get().fetchVLANs(), 0);
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

      setShowIPRangesModal: (show: boolean) => {
        set({ showIPRangesModal: show });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'vlan-store',
    }
  )
);