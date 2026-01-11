/**
 * Real API Service
 * Connects to the actual backend API endpoints with proper error handling
 */

import { apiClient } from './api';

// Domain API Service
export class RealDomainService {
  private readonly basePath = '/domains';

  async getDomains() {
    try {
      const domains = await apiClient.get<any[]>(this.basePath);
      return {
        data: domains.map(domain => ({
          id: domain.id,
          name: domain.code, // Map code to name for compatibility
          description: domain.description,
          valueStreamCount: domain.value_streams?.length || 0,
          createdAt: domain.created_at,
          updatedAt: domain.updated_at,
        })),
        meta: {
          pagination: {
            page: 1,
            pageSize: 50,
            total: domains.length,
          },
        },
      };
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      throw error;
    }
  }

  async getDomain(id: string) {
    try {
      const domain = await apiClient.get<any>(`${this.basePath}/${id}`);
      return {
        data: {
          id: domain.id,
          name: domain.code,
          description: domain.description,
          valueStreamCount: domain.value_streams?.length || 0,
          createdAt: domain.created_at,
          updatedAt: domain.updated_at,
        },
      };
    } catch (error) {
      console.error('Failed to fetch domain:', error);
      throw error;
    }
  }

  async getValueStreams(domainId: string) {
    try {
      const domain = await apiClient.get<any>(`${this.basePath}/${domainId}`);
      return domain.value_streams || [];
    } catch (error) {
      console.error('Failed to fetch value streams:', error);
      throw error;
    }
  }

  async getZones(valueStreamId: string) {
    try {
      const valueStream = await apiClient.get<any>(`/value-streams/${valueStreamId}`);
      return valueStream.zones || [];
    } catch (error) {
      console.error('Failed to fetch zones:', error);
      throw error;
    }
  }
}

// VLAN API Service
export class RealVlanService {
  private readonly basePath = '/vlans';

  async getVlans() {
    try {
      const vlans = await apiClient.get<any[]>(this.basePath);
      return vlans.map(vlan => ({
        id: vlan.id,
        domainId: vlan.zone?.value_stream?.domain_id || '',
        vlanId: vlan.vlan_id,
        name: vlan.description || `VLAN ${vlan.vlan_id}`,
        subnet: vlan.subnet,
        subnetMask: vlan.netmask || '255.255.255.0',
        gateway: vlan.gateway || this.calculateGateway(vlan.subnet),
        netStart: vlan.net_start || this.calculateNetStart(vlan.subnet),
        netEnd: vlan.net_end || this.calculateNetEnd(vlan.subnet),
        zoneName: vlan.zone?.name || 'Unknown Zone',
        zoneManager: vlan.zone?.zone_manager || 'Unknown',
        securityType: vlan.zone?.security_type || 'Unknown',
        status: this.determineVlanStatus(vlan),
        utilization: this.calculateUtilization(vlan),
        totalIps: this.calculateTotalIps(vlan.subnet, vlan.netmask),
        usedIps: vlan.ip_assignments?.length || 0,
        lastFirewallCheck: vlan.zone?.last_firewall_rule_check || new Date().toISOString(),
        createdAt: vlan.created_at,
        updatedAt: vlan.updated_at,
      }));
    } catch (error) {
      console.error('Failed to fetch VLANs:', error);
      throw error;
    }
  }

  async getVlansByZone(zoneId: string) {
    try {
      const vlans = await apiClient.get<any[]>(`/zones/${zoneId}/vlans`);
      return vlans.map(vlan => this.transformVlan(vlan));
    } catch (error) {
      console.error('Failed to fetch VLANs for zone:', error);
      throw error;
    }
  }

  private transformVlan(vlan: any) {
    return {
      id: vlan.id,
      domainId: vlan.zone?.value_stream?.domain_id || '',
      vlanId: vlan.vlan_id,
      name: vlan.description || `VLAN ${vlan.vlan_id}`,
      subnet: vlan.subnet,
      subnetMask: vlan.netmask || '255.255.255.0',
      gateway: vlan.gateway || this.calculateGateway(vlan.subnet),
      netStart: vlan.net_start || this.calculateNetStart(vlan.subnet),
      netEnd: vlan.net_end || this.calculateNetEnd(vlan.subnet),
      zoneName: vlan.zone?.name || 'Unknown Zone',
      zoneManager: vlan.zone?.zone_manager || 'Unknown',
      securityType: vlan.zone?.security_type || 'Unknown',
      status: this.determineVlanStatus(vlan),
      utilization: this.calculateUtilization(vlan),
      totalIps: this.calculateTotalIps(vlan.subnet, vlan.netmask),
      usedIps: vlan.ip_assignments?.length || 0,
      lastFirewallCheck: vlan.zone?.last_firewall_rule_check || new Date().toISOString(),
      createdAt: vlan.created_at,
      updatedAt: vlan.updated_at,
    };
  }

  private calculateGateway(subnet: string): string {
    const parts = subnet.split('.');
    parts[3] = '1';
    return parts.join('.');
  }

  private calculateNetStart(subnet: string): string {
    const parts = subnet.split('.');
    parts[3] = '7'; // First 6 IPs reserved
    return parts.join('.');
  }

  private calculateNetEnd(subnet: string): string {
    const parts = subnet.split('.');
    parts[3] = '254'; // Last IP reserved
    return parts.join('.');
  }

  private calculateTotalIps(subnet: string, netmask: string = '255.255.255.0'): number {
    // Simple calculation for /24 networks
    if (netmask === '255.255.255.0') {
      return 248; // 256 - 8 reserved IPs
    }
    return 248; // Default for now
  }

  private calculateUtilization(vlan: any): number {
    const totalIps = this.calculateTotalIps(vlan.subnet, vlan.netmask);
    const usedIps = vlan.ip_assignments?.length || 0;
    return totalIps > 0 ? Math.round((usedIps / totalIps) * 100) : 0;
  }

  private determineVlanStatus(vlan: any): 'active' | 'inactive' | 'warning' | 'error' {
    const utilization = this.calculateUtilization(vlan);
    const hasConflicts = vlan.ip_assignments?.some((ip: any) => ip.status === 'conflict');
    
    if (hasConflicts) return 'error';
    if (utilization > 85) return 'warning';
    if (vlan.ip_assignments?.length > 0) return 'active';
    return 'inactive';
  }
}

// IP Assignment API Service
export class RealIpService {
  private readonly basePath = '/ip-assignments';

  async getIpAssignments() {
    try {
      const assignments = await apiClient.get<any[]>(this.basePath);
      return assignments.map(assignment => ({
        id: assignment.id,
        vlanId: assignment.vlan_id,
        ipAddress: assignment.ip_address,
        ciName: assignment.ci_name,
        macAddress: assignment.mac_address,
        description: assignment.description || '',
        status: this.determineDeviceStatus(assignment),
        deviceType: this.inferDeviceType(assignment.ci_name),
        lastSeen: assignment.updated_at || assignment.created_at,
        isReserved: this.isReservedIp(assignment.ip_address),
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
      }));
    } catch (error) {
      console.error('Failed to fetch IP assignments:', error);
      throw error;
    }
  }

  async getIpAssignmentsByVlan(vlanId: string) {
    try {
      const assignments = await apiClient.get<any[]>(`/vlans/${vlanId}/ip-assignments`);
      return assignments.map(assignment => this.transformIpAssignment(assignment));
    } catch (error) {
      console.error('Failed to fetch IP assignments for VLAN:', error);
      throw error;
    }
  }

  async createIpAssignment(data: any) {
    try {
      const assignment = await apiClient.post<any>(this.basePath, {
        vlan_id: data.vlanId,
        ip_address: data.ipAddress,
        ci_name: data.ciName,
        mac_address: data.macAddress,
        description: data.description,
      });
      return { data: this.transformIpAssignment(assignment) };
    } catch (error) {
      console.error('Failed to create IP assignment:', error);
      throw error;
    }
  }

  async updateIpAssignment(id: string, data: any) {
    try {
      const assignment = await apiClient.put<any>(`${this.basePath}/${id}`, {
        ip_address: data.ipAddress,
        ci_name: data.ciName,
        mac_address: data.macAddress,
        description: data.description,
      });
      return { data: this.transformIpAssignment(assignment) };
    } catch (error) {
      console.error('Failed to update IP assignment:', error);
      throw error;
    }
  }

  async deleteIpAssignment(id: string) {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
      return { data: undefined };
    } catch (error) {
      console.error('Failed to delete IP assignment:', error);
      throw error;
    }
  }

  private transformIpAssignment(assignment: any) {
    return {
      id: assignment.id,
      vlanId: assignment.vlan_id,
      ipAddress: assignment.ip_address,
      ciName: assignment.ci_name,
      macAddress: assignment.mac_address,
      description: assignment.description || '',
      status: this.determineDeviceStatus(assignment),
      deviceType: this.inferDeviceType(assignment.ci_name),
      lastSeen: assignment.updated_at || assignment.created_at,
      isReserved: this.isReservedIp(assignment.ip_address),
      createdAt: assignment.created_at,
      updatedAt: assignment.updated_at,
    };
  }

  private determineDeviceStatus(assignment: any): 'active' | 'inactive' | 'reserved' | 'conflict' {
    if (this.isReservedIp(assignment.ip_address)) return 'reserved';
    
    // Check if device was seen recently (within last 24 hours)
    const lastSeen = new Date(assignment.updated_at || assignment.created_at);
    const now = new Date();
    const hoursSinceLastSeen = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastSeen > 24) return 'inactive';
    return 'active';
  }

  private inferDeviceType(ciName: string): string {
    const name = ciName.toLowerCase();
    
    if (name.includes('plc')) return 'PLC';
    if (name.includes('hmi')) return 'HMI';
    if (name.includes('robot')) return 'Robot Controller';
    if (name.includes('camera')) return 'Vision System';
    if (name.includes('sensor')) return 'Sensor';
    if (name.includes('gateway')) return 'Gateway';
    if (name.includes('switch')) return 'Switch';
    if (name.includes('server') || name.includes('srv')) return 'Server';
    if (name.includes('analyzer')) return 'Analyzer';
    if (name.includes('testbench')) return 'Test Equipment';
    
    return 'Unknown Device';
  }

  private isReservedIp(ipAddress: string): boolean {
    const parts = ipAddress.split('.');
    const lastOctet = parseInt(parts[3]);
    
    // First 6 IPs and last IP are reserved
    return lastOctet <= 6 || lastOctet >= 254;
  }
}

// Export service instances
export const realDomainService = new RealDomainService();
export const realVlanService = new RealVlanService();
export const realIpService = new RealIpService();