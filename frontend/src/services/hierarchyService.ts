/**
 * Hierarchy Service
 * API service for managing organizational hierarchy (domains, value streams, zones)
 */

import { apiClient } from './api';
import { ValueStream, Zone, ValueStreamFormData, ZoneFormData, APIResponse, HierarchyNode } from '@/types';

export class HierarchyService {
  private readonly valueStreamPath = '/value-streams';
  private readonly zonePath = '/zones';
  private readonly hierarchyPath = '/hierarchy';

  // Value Stream Operations
  async getValueStreams(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    domainId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<APIResponse<ValueStream[]>> {
    return apiClient.get<ValueStream[]>(this.valueStreamPath, params);
  }

  async getValueStream(id: string): Promise<APIResponse<ValueStream>> {
    return apiClient.get<ValueStream>(`${this.valueStreamPath}/${id}`);
  }

  async createValueStream(data: ValueStreamFormData): Promise<APIResponse<ValueStream>> {
    return apiClient.post<ValueStream>(this.valueStreamPath, data);
  }

  async updateValueStream(id: string, data: Partial<ValueStreamFormData>): Promise<APIResponse<ValueStream>> {
    return apiClient.put<ValueStream>(`${this.valueStreamPath}/${id}`, data);
  }

  async deleteValueStream(id: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`${this.valueStreamPath}/${id}`);
  }

  // Zone Operations
  async getZones(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    valueStreamId?: string;
    securityLevel?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<APIResponse<Zone[]>> {
    return apiClient.get<Zone[]>(this.zonePath, params);
  }

  async getZone(id: string): Promise<APIResponse<Zone>> {
    return apiClient.get<Zone>(`${this.zonePath}/${id}`);
  }

  async createZone(data: ZoneFormData): Promise<APIResponse<Zone>> {
    return apiClient.post<Zone>(this.zonePath, data);
  }

  async updateZone(id: string, data: Partial<ZoneFormData>): Promise<APIResponse<Zone>> {
    return apiClient.put<Zone>(`${this.zonePath}/${id}`, data);
  }

  async deleteZone(id: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`${this.zonePath}/${id}`);
  }

  // Hierarchy Operations
  async getNetworkHierarchy(): Promise<APIResponse<HierarchyNode[]>> {
    return apiClient.get<HierarchyNode[]>(`${this.hierarchyPath}/network`);
  }

  async getHierarchyByDomain(domainId: string): Promise<APIResponse<HierarchyNode>> {
    return apiClient.get<HierarchyNode>(`${this.hierarchyPath}/domain/${domainId}`);
  }

  async getHierarchyStats(): Promise<APIResponse<{
    totalDomains: number;
    totalValueStreams: number;
    totalZones: number;
    totalVlans: number;
    totalIpAllocations: number;
  }>> {
    return apiClient.get(`${this.hierarchyPath}/stats`);
  }
}

export const hierarchyService = new HierarchyService();