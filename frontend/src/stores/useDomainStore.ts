/**
 * Domain Store
 * State management for domain operations
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Domain, DomainFormData, PaginationState, FilterState } from '@/types';
import { domainService } from '@/services/domainService';
import { toast } from 'react-hot-toast';

interface DomainState {
  // Data
  domains: Domain[];
  selectedDomain: Domain | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: FilterState;
  
  // Modal states
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  
  // Actions
  fetchDomains: () => Promise<void>;
  createDomain: (data: DomainFormData) => Promise<void>;
  updateDomain: (id: string, data: Partial<DomainFormData>) => Promise<void>;
  deleteDomain: (id: string) => Promise<void>;
  selectDomain: (domain: Domain | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  clearError: () => void;
}

export const useDomainStore = create<DomainState>()(
  devtools(
    (set, get) => ({
      // Initial state
      domains: [],
      selectedDomain: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
      },
      filters: {
        search: '',
        sortBy: 'name',
        sortOrder: 'asc',
      },
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,

      // Actions
      fetchDomains: async () => {
        set({ loading: true, error: null });
        
        try {
          const { pagination, filters } = get();
          const response = await domainService.getDomains({
            page: pagination.page,
            pageSize: pagination.pageSize,
            search: filters.search,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
          });

          set({
            domains: response.data,
            pagination: {
              ...pagination,
              total: response.meta?.pagination?.total || 0,
            },
            loading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch domains',
            loading: false,
          });
          toast.error('Failed to fetch domains');
        }
      },

      createDomain: async (data: DomainFormData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await domainService.createDomain(data);
          
          set(state => ({
            domains: [...state.domains, response.data],
            loading: false,
            showCreateModal: false,
          }));
          
          toast.success('Domain created successfully');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create domain',
            loading: false,
          });
          toast.error('Failed to create domain');
        }
      },

      updateDomain: async (id: string, data: Partial<DomainFormData>) => {
        set({ loading: true, error: null });
        
        try {
          const response = await domainService.updateDomain(id, data);
          
          set(state => ({
            domains: state.domains.map(domain => 
              domain.id === id ? response.data : domain
            ),
            selectedDomain: state.selectedDomain?.id === id ? response.data : state.selectedDomain,
            loading: false,
            showEditModal: false,
          }));
          
          toast.success('Domain updated successfully');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update domain',
            loading: false,
          });
          toast.error('Failed to update domain');
        }
      },

      deleteDomain: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
          // Check if domain can be deleted
          const canDeleteResponse = await domainService.canDeleteDomain(id);
          
          if (!canDeleteResponse.data.canDelete) {
            toast.error(canDeleteResponse.data.reason || 'Cannot delete domain');
            set({ loading: false, showDeleteModal: false });
            return;
          }

          await domainService.deleteDomain(id);
          
          set(state => ({
            domains: state.domains.filter(domain => domain.id !== id),
            selectedDomain: state.selectedDomain?.id === id ? null : state.selectedDomain,
            loading: false,
            showDeleteModal: false,
          }));
          
          toast.success('Domain deleted successfully');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete domain',
            loading: false,
          });
          toast.error('Failed to delete domain');
        }
      },

      selectDomain: (domain: Domain | null) => {
        set({ selectedDomain: domain });
      },

      setFilters: (newFilters: Partial<FilterState>) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 }, // Reset to first page
        }));
        
        // Automatically fetch domains when filters change
        setTimeout(() => get().fetchDomains(), 0);
      },

      setPagination: (newPagination: Partial<PaginationState>) => {
        set(state => ({
          pagination: { ...state.pagination, ...newPagination },
        }));
        
        // Automatically fetch domains when pagination changes
        setTimeout(() => get().fetchDomains(), 0);
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
    }),
    {
      name: 'domain-store',
    }
  )
);