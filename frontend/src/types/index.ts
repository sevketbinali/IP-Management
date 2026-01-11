/**
 * Type definitions for the IP Management application
 */

// Domain types
export interface Domain {
  id: string;
  name: string;
  description: string;
  valueStreamCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ValueStream {
  id: string;
  domainId: string;
  name: string;
  description: string;
  zoneCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Zone {
  id: string;
  valueStreamId: string;
  name: string;
  description: string;
  zoneManager: string;
  securityType: SecurityType;
  lastFirewallRuleCheck: string;
  vlanCount: number;
  createdAt: string;
  updatedAt: string;
}

// VLAN types
export interface Vlan {
  id: string;
  domainId: string;
  vlanId: number;
  name: string;
  subnet: string;
  subnetMask: string;
  gateway: string;
  netStart: string;
  netEnd: string;
  zoneName: string;
  zoneManager: string;
  securityType: SecurityType;
  status: VlanStatus;
  utilization: number;
  totalIps: number;
  usedIps: number;
  lastFirewallCheck: string;
  createdAt: string;
  updatedAt: string;
}

// IP Assignment types
export interface IpAssignment {
  id: string;
  vlanId: string;
  ipAddress: string;
  ciName: string;
  macAddress: string;
  description: string;
  status: DeviceStatus;
  deviceType: string;
  lastSeen: string;
  isReserved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Device types (alias for IP Assignment)
export type Device = IpAssignment;

// Enum types
export type SecurityType = 
  | 'SL3' 
  | 'MFZ_SL4' 
  | 'LOG_SL4' 
  | 'FMZ_SL4' 
  | 'ENG_SL4' 
  | 'LRSZ_SL4' 
  | 'RSZ_SL4';

export type VlanStatus = 'active' | 'inactive' | 'warning' | 'error';
export type DeviceStatus = 'active' | 'inactive' | 'reserved' | 'conflict';

// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages?: number;
    };
  };
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Form types
export interface CreateDomainForm {
  name: string;
  description: string;
}

export interface CreateValueStreamForm {
  domainId: string;
  name: string;
  description: string;
}

export interface CreateZoneForm {
  valueStreamId: string;
  name: string;
  description: string;
  zoneManager: string;
  securityType: SecurityType;
}

export interface CreateVlanForm {
  zoneId: string;
  vlanId: number;
  subnet: string;
  netmask: string;
  gateway: string;
  description?: string;
}

export interface CreateDeviceForm {
  vlanId: string;
  ipAddress: string;
  ciName: string;
  macAddress: string;
  description?: string;
}

// Filter types
export interface DomainFilters {
  search: string;
  sortBy: 'name' | 'createdAt' | 'valueStreamCount';
  sortOrder: 'asc' | 'desc';
}

export interface VlanFilters {
  search: string;
  domain: string;
  securityType: string;
  status: string;
  utilizationRange: string;
}

export interface DeviceFilters {
  search: string;
  vlan: string;
  status: string;
  deviceType: string;
  domain: string;
}

// Dashboard types
export interface DashboardStats {
  totalDomains: number;
  totalVlans: number;
  totalDevices: number;
  ipUtilization: number;
  activeDevices: number;
  conflictCount: number;
  lastUpdate: string;
}

export interface NetworkOverview {
  domainId: string;
  domainName: string;
  vlanCount: number;
  deviceCount: number;
  utilization: number;
  status: 'healthy' | 'warning' | 'error';
  lastActivity: string;
}

// Report types
export interface UtilizationReport {
  domainId: string;
  domainName: string;
  vlans: {
    vlanId: number;
    name: string;
    totalIps: number;
    usedIps: number;
    utilization: number;
    status: VlanStatus;
  }[];
  totalUtilization: number;
  recommendations: string[];
}

export interface SecurityReport {
  domainId: string;
  domainName: string;
  securityZones: {
    securityType: SecurityType;
    vlanCount: number;
    deviceCount: number;
    lastFirewallCheck: string;
    complianceStatus: 'compliant' | 'warning' | 'non-compliant';
  }[];
  overallCompliance: 'compliant' | 'warning' | 'non-compliant';
  issues: string[];
}

// Store types
export interface AppState {
  isLoading: boolean;
  error: string | null;
  healthStatus: 'healthy' | 'degraded' | 'down';
  lastHealthCheck: string;
}

export interface DomainState {
  domains: Domain[];
  selectedDomain: Domain | null;
  loading: boolean;
  error: string | null;
}

export interface VlanState {
  vlans: Vlan[];
  selectedVlan: Vlan | null;
  loading: boolean;
  error: string | null;
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
}

export interface DeviceState {
  devices: Device[];
  selectedDevice: Device | null;
  loading: boolean;
  error: string | null;
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;