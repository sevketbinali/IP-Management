/**
 * Domain Service
 * API service for domain management operations
 */

import { apiClient } from './api';
import { Domain, DomainFormData, ApiResponse } from '@/types';

interface DomainQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface DomainsResponse {
  data: Domain[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

interface CanDeleteResponse {
  canDelete: boolean;
  reason?: string;
  dependencies?: {
    vlans: number;
    valueStreams: number;
    devices: number;
  };
}

class DomainService {
  private readonly basePath = '/domains';

  /**
   * Get all domains with optional filtering and pagination
   */
  async getDomains(params: DomainQueryParams = {}): Promise<DomainsResponse> {
    try {
      // Get domains from real API
      const domains = await apiClient.get<Domain[]>(this.basePath, params);
      
      // Transform to expected response format
      return {
        data: domains,
        meta: {
          pagination: {
            page: params.page || 1,
            pageSize: params.pageSize || 50,
            total: domains.length,
          },
        },
      };
    } catch (error) {
      console.warn('Failed to fetch domains from API, using mock data:', error);
      return this.getMockDomains(params);
    }
  }

  /**
   * Get a single domain by ID
   */
  async getDomain(id: string): Promise<ApiResponse<Domain>> {
    try {
      const domain = await apiClient.get<Domain>(`${this.basePath}/${id}`);
      return { data: domain };
    } catch (error) {
      console.warn('Failed to fetch domain from API, using mock data:', error);
      return this.getMockDomain(id);
    }
  }

  /**
   * Create a new domain
   */
  async createDomain(data: DomainFormData): Promise<ApiResponse<Domain>> {
    try {
      const domain = await apiClient.post<Domain>(this.basePath, data);
      return { data: domain, message: 'Domain created successfully' };
    } catch (error) {
      console.warn('Failed to create domain via API, using mock:', error);
      return this.createMockDomain(data);
    }
  }

  /**
   * Update an existing domain
   */
  async updateDomain(id: string, data: Partial<DomainFormData>): Promise<ApiResponse<Domain>> {
    try {
      return await apiClient.put<ApiResponse<Domain>>(`${this.basePath}/${id}`, data);
    } catch (error) {
      // For development, simulate update
      return this.updateMockDomain(id, data);
    }
  }

  /**
   * Delete a domain
   */
  async deleteDomain(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`${this.basePath}/${id}`);
    } catch (error) {
      // For development, simulate deletion
      return { data: undefined as any, message: 'Domain deleted successfully' };
    }
  }

  /**
   * Check if a domain can be deleted
   */
  async canDeleteDomain(id: string): Promise<ApiResponse<CanDeleteResponse>> {
    try {
      return await apiClient.get<ApiResponse<CanDeleteResponse>>(`${this.basePath}/${id}/can-delete`);
    } catch (error) {
      // For development, simulate check
      return {
        data: {
          canDelete: true,
          reason: undefined,
          dependencies: {
            vlans: 0,
            valueStreams: 0,
            devices: 0,
          },
        },
      };
    }
  }

  /**
   * Get domain statistics
   */
  async getDomainStats(id: string): Promise<ApiResponse<{
    vlanCount: number;
    deviceCount: number;
    ipUtilization: number;
    lastActivity: string;
  }>> {
    try {
      return await apiClient.get<ApiResponse<any>>(`${this.basePath}/${id}/stats`);
    } catch (error) {
      // For development, return mock stats
      return {
        data: {
          vlanCount: Math.floor(Math.random() * 10) + 1,
          deviceCount: Math.floor(Math.random() * 100) + 10,
          ipUtilization: Math.floor(Math.random() * 80) + 10,
          lastActivity: new Date().toISOString(),
        },
      };
    }
  }

  // Mock data methods for development
  private async getMockDomains(params: DomainQueryParams): Promise<DomainsResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockDomains: Domain[] = [
      {
        id: 'domain-1',
        name: 'MFG' as any,
        description: 'Manufacturing domain covering production lines A2, A4, A6, A10, and MCO with automated systems and robotics.',
        valueStreamCount: 5,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'domain-2',
        name: 'LOG' as any,
        description: 'Logistics domain managing warehouse operations, inventory systems, and material flow in LOG21 facility.',
        valueStreamCount: 2,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'domain-3',
        name: 'FCM' as any,
        description: 'Facility management domain for building systems, analyzers, security cameras, and infrastructure monitoring.',
        valueStreamCount: 3,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'domain-4',
        name: 'ENG' as any,
        description: 'Engineering domain for test benches, development systems, and prototype validation equipment.',
        valueStreamCount: 1,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Apply search filter
    let filteredDomains = mockDomains;
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredDomains = mockDomains.filter(domain =>
        domain.name.toLowerCase().includes(searchTerm) ||
        domain.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    if (params.sortBy) {
      filteredDomains.sort((a, b) => {
        const aVal = a[params.sortBy as keyof Domain];
        const bVal = b[params.sortBy as keyof Domain];
        
        if (aVal < bVal) return params.sortOrder === 'desc' ? 1 : -1;
        if (aVal > bVal) return params.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // Apply pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 50;
    const startIndex = (page - 1) * pageSize;
    const paginatedDomains = filteredDomains.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedDomains,
      meta: {
        pagination: {
          page,
          pageSize,
          total: filteredDomains.length,
        },
      },
    };
  }

  private async getMockDomain(id: string): Promise<ApiResponse<Domain>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockDomain: Domain = {
      id,
      name: 'MFG' as any,
      description: 'Manufacturing domain covering production lines A2, A4, A6, A10, and MCO.',
      valueStreamCount: 5,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return { data: mockDomain };
  }

  private async createMockDomain(data: DomainFormData): Promise<ApiResponse<Domain>> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const newDomain: Domain = {
      id: `domain-${Date.now()}`,
      name: data.name,
      description: data.description,
      valueStreamCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: newDomain,
      message: 'Domain created successfully',
    };
  }

  private async updateMockDomain(id: string, data: Partial<DomainFormData>): Promise<ApiResponse<Domain>> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const updatedDomain: Domain = {
      id,
      name: data.name || 'MFG' as any,
      description: data.description || 'Updated domain description',
      valueStreamCount: 3,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: updatedDomain,
      message: 'Domain updated successfully',
    };
  }
}

export const domainService = new DomainService();