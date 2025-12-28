/**
 * VLAN Service
 * API service for VLAN management operations
 */

import { apiClient } from './api';
import { VLAN, VLANFormData, APIResponse, IPRange, SubnetInfo } from '@/types';

export class VLANService {
  private readonly basePath = '/vlans';

  /**
   * Get all VLANs with optional filtering and pagination
   */
  async getVLANs(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    zoneId?: string;
    firewall?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<APIResponse<VLAN[]>> {
    return apiClient.get<VLAN[]>(this.basePath, params);
  }

  /**
   * Get a single VLAN by ID
   */
  async getVLAN(id: string): Promise<APIResponse<VLAN>> {
    return apiClient.get<VLAN>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new VLAN
   */
  async createVLAN(data: VLANFormData): Promise<APIResponse<VLAN>> {
    return apiClient.post<VLAN>(this.basePath, data);
  }

  /**
   * Update an existing VLAN
   */
  async updateVLAN(id: string, data: Partial<VLANFormData>): Promise<APIResponse<VLAN>> {
    return apiClient.put<VLAN>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete a VLAN
   */
  async deleteVLAN(id: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Validate VLAN configuration
   */
  async validateVLAN(data: VLANFormData): Promise<APIResponse<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>> {
    return apiClient.post(`${this.basePath}/validate`, data);
  }

  /**
   * Check VLAN ID uniqueness within domain
   */
  async checkVLANIdUnique(vlanId: number, domainId: string, excludeId?: string): Promise<APIResponse<{
    isUnique: boolean;
    conflictingVLAN?: VLAN;
  }>> {
    return apiClient.get(`${this.basePath}/check-unique`, {
      vlanId,
      domainId,
      excludeId,
    });
  }

  /**
   * Calculate subnet information
   */
  async calculateSubnet(subnet: string, subnetMask: number): Promise<APIResponse<SubnetInfo>> {
    return apiClient.post(`${this.basePath}/calculate-subnet`, {
      subnet,
      subnetMask,
    });
  }

  /**
   * Get IP ranges for a VLAN
   */
  async getIPRanges(vlanId: string): Promise<APIResponse<IPRange[]>> {
    return apiClient.get<IPRange[]>(`${this.basePath}/${vlanId}/ip-ranges`);
  }

  /**
   * Get VLAN utilization statistics
   */
  async getVLANUtilization(vlanId: string): Promise<APIResponse<{
    totalIPs: number;
    allocatedIPs: number;
    availableIPs: number;
    reservedIPs: number;
    utilizationPercentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>> {
    return apiClient.get(`${this.basePath}/${vlanId}/utilization`);
  }

  /**
   * Check for subnet overlaps within security zone
   */
  async checkSubnetOverlap(
    subnet: string,
    subnetMask: number,
    securityZoneId: string,
    excludeVlanId?: string
  ): Promise<APIResponse<{
    hasOverlap: boolean;
    overlappingVLANs: VLAN[];
  }>> {
    return apiClient.post(`${this.basePath}/check-overlap`, {
      subnet,
      subnetMask,
      securityZoneId,
      excludeVlanId,
    });
  }

  /**
   * Update firewall rule check date
   */
  async updateFirewallCheck(vlanId: string, checkDate: string): Promise<APIResponse<VLAN>> {
    return apiClient.patch<VLAN>(`${this.basePath}/${vlanId}/firewall-check`, {
      lastFirewallCheck: checkDate,
    });
  }

  /**
   * Get VLANs requiring firewall review
   */
  async getVLANsRequiringReview(daysSinceLastCheck: number = 30): Promise<APIResponse<VLAN[]>> {
    return apiClient.get<VLAN[]>(`${this.basePath}/requiring-review`, {
      daysSinceLastCheck,
    });
  }
}

export const vlanService = new VLANService();