/**
 * IP Management Service
 * API service for IP allocation and management operations
 */

import { apiClient } from './api';
import { IPAllocation, IPAllocationFormData, APIResponse } from '@/types';

export class IPService {
  private readonly basePath = '/ip-allocations';

  /**
   * Get all IP allocations with optional filtering and pagination
   */
  async getIPAllocations(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    vlanId?: string;
    status?: string;
    allocationType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<APIResponse<IPAllocation[]>> {
    return apiClient.get<IPAllocation[]>(this.basePath, params);
  }

  /**
   * Get a single IP allocation by ID
   */
  async getIPAllocation(id: string): Promise<APIResponse<IPAllocation>> {
    return apiClient.get<IPAllocation>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new IP allocation (manual or automatic)
   */
  async createIPAllocation(data: IPAllocationFormData): Promise<APIResponse<IPAllocation>> {
    return apiClient.post<IPAllocation>(this.basePath, data);
  }

  /**
   * Update an existing IP allocation
   */
  async updateIPAllocation(id: string, data: Partial<IPAllocationFormData>): Promise<APIResponse<IPAllocation>> {
    return apiClient.put<IPAllocation>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete an IP allocation
   */
  async deleteIPAllocation(id: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Get available IP addresses for a VLAN
   */
  async getAvailableIPs(vlanId: string): Promise<APIResponse<string[]>> {
    return apiClient.get<string[]>(`/vlans/${vlanId}/available-ips`);
  }

  /**
   * Get reserved IP addresses for a VLAN
   */
  async getReservedIPs(vlanId: string): Promise<APIResponse<string[]>> {
    return apiClient.get<string[]>(`/vlans/${vlanId}/reserved-ips`);
  }

  /**
   * Validate MAC address format and uniqueness
   */
  async validateMACAddress(macAddress: string, excludeId?: string): Promise<APIResponse<{
    isValid: boolean;
    isUnique: boolean;
    formatError?: string;
    conflictingAllocation?: IPAllocation;
  }>> {
    return apiClient.post(`${this.basePath}/validate-mac`, {
      macAddress,
      excludeId,
    });
  }

  /**
   * Check IP address availability
   */
  async checkIPAvailability(vlanId: string, ipAddress: string, excludeId?: string): Promise<APIResponse<{
    isAvailable: boolean;
    isReserved: boolean;
    conflictingAllocation?: IPAllocation;
  }>> {
    return apiClient.get(`${this.basePath}/check-ip`, {
      vlanId,
      ipAddress,
      excludeId,
    });
  }

  /**
   * Get next available IP address in VLAN
   */
  async getNextAvailableIP(vlanId: string): Promise<APIResponse<{
    ipAddress: string | null;
    availableCount: number;
  }>> {
    return apiClient.get(`/vlans/${vlanId}/next-available-ip`);
  }

  /**
   * Bulk IP allocation
   */
  async bulkAllocateIPs(allocations: IPAllocationFormData[]): Promise<APIResponse<{
    successful: IPAllocation[];
    failed: Array<{
      data: IPAllocationFormData;
      error: string;
    }>;
  }>> {
    return apiClient.post(`${this.basePath}/bulk`, { allocations });
  }

  /**
   * Get IP allocation history for a device
   */
  async getIPHistory(ciName: string): Promise<APIResponse<IPAllocation[]>> {
    return apiClient.get<IPAllocation[]>(`${this.basePath}/history`, { ciName });
  }

  /**
   * Search IP allocations by various criteria
   */
  async searchIPAllocations(query: {
    ciName?: string;
    macAddress?: string;
    ipAddress?: string;
    description?: string;
  }): Promise<APIResponse<IPAllocation[]>> {
    return apiClient.get<IPAllocation[]>(`${this.basePath}/search`, query);
  }

  /**
   * Get IP allocation statistics for a VLAN
   */
  async getVLANIPStats(vlanId: string): Promise<APIResponse<{
    totalIPs: number;
    allocatedIPs: number;
    availableIPs: number;
    reservedIPs: number;
    utilizationPercentage: number;
    allocationsByType: {
      manual: number;
      automatic: number;
    };
    recentAllocations: IPAllocation[];
  }>> {
    return apiClient.get(`/vlans/${vlanId}/ip-stats`);
  }

  /**
   * Export IP allocations to CSV
   */
  async exportIPAllocations(params?: {
    vlanId?: string;
    format?: 'csv' | 'xlsx';
  }): Promise<Blob> {
    const response = await apiClient.get(`${this.basePath}/export`, {
      ...params,
      responseType: 'blob',
    });
    return response.data as Blob;
  }

  /**
   * Import IP allocations from CSV
   */
  async importIPAllocations(file: File): Promise<APIResponse<{
    imported: number;
    failed: number;
    errors: string[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(`${this.basePath}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const ipService = new IPService();