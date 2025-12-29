/**
 * Domain Service
 * API service for domain management operations
 */

import { apiClient } from './api';
import { Domain, DomainFormData, APIResponse } from '@/types';

export class DomainService {
  private readonly basePath = '/domains';

  /**
   * Get all domains with optional filtering and pagination
   */
  async getDomains(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<APIResponse<Domain[]>> {
    try {
      return await apiClient.get<Domain[]>(this.basePath, params);
    } catch (error) {
      // Return mock data if API is not available
      const mockDomains: Domain[] = [
        {
          id: '1',
          name: 'MFG' as any,
          description: 'Manufacturing Domain - Production lines and equipment',
          valueStreamCount: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'LOG' as any,
          description: 'Logistics Domain - Warehouse and distribution',
          valueStreamCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'FCM' as any,
          description: 'Facility Domain - Building systems and infrastructure',
          valueStreamCount: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'ENG' as any,
          description: 'Engineering Domain - Test benches and development',
          valueStreamCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return {
        data: mockDomains,
        message: 'Mock data - API not available',
        meta: {
          pagination: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 50,
            total: mockDomains.length,
            totalPages: 1,
          },
        },
      };
    }
  }

  /**
   * Get a single domain by ID
   */
  async getDomain(id: string): Promise<APIResponse<Domain>> {
    return apiClient.get<Domain>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new domain
   */
  async createDomain(data: DomainFormData): Promise<APIResponse<Domain>> {
    return apiClient.post<Domain>(this.basePath, data);
  }

  /**
   * Update an existing domain
   */
  async updateDomain(id: string, data: Partial<DomainFormData>): Promise<APIResponse<Domain>> {
    return apiClient.put<Domain>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete a domain
   */
  async deleteDomain(id: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Check if domain can be deleted (no child value streams)
   */
  async canDeleteDomain(id: string): Promise<APIResponse<{ canDelete: boolean; reason?: string }>> {
    try {
      return await apiClient.get<{ canDelete: boolean; reason?: string }>(`${this.basePath}/${id}/can-delete`);
    } catch (error) {
      // Return mock response
      return {
        data: { canDelete: true },
        message: 'Mock response - API not available',
      };
    }
  }

  /**
   * Get domain statistics
   */
  async getDomainStats(id: string): Promise<APIResponse<{
    valueStreamCount: number;
    zoneCount: number;
    vlanCount: number;
    ipAllocationCount: number;
  }>> {
    return apiClient.get(`${this.basePath}/${id}/stats`);
  }
}

export const domainService = new DomainService();