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
    return apiClient.get<Domain[]>(this.basePath, params);
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
    return apiClient.get<{ canDelete: boolean; reason?: string }>(`${this.basePath}/${id}/can-delete`);
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