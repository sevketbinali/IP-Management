/**
 * Core Type Definitions for IP Management System
 * Industrial-grade network management for IT/OT environments
 */

// Domain Types
export enum DomainType {
  MFG = 'MFG',
  LOG = 'LOG',
  FCM = 'FCM',
  ENG = 'ENG',
}

export enum SecurityLevel {
  SL3 = 'SL3',
  MFZ_SL4 = 'MFZ_SL4',
  LOG_SL4 = 'LOG_SL4',
  FMZ_SL4 = 'FMZ_SL4',
  ENG_SL4 = 'ENG_SL4',
  LRSZ_SL4 = 'LRSZ_SL4',
  RSZ_SL4 = 'RSZ_SL4',
}

export enum IPAllocationStatus {
  ALLOCATED = 'ALLOCATED',
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
}

export enum AllocationType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
}

// Core Entity Interfaces
export interface Domain {
  id: string;
  name: DomainType;
  description: string;
  valueStreamCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ValueStream {
  id: string;
  name: string;
  domainId: string;
  domainName: string;
  description?: string;
  zoneCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Zone {
  id: string;
  name: string;
  securityLevel: SecurityLevel;
  valueStreamId: string;
  valueStreamName: string;
  manager: string;
  vlanCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VLAN {
  id: string;
  vlanId: number;
  subnet: string;
  subnetMask: number;
  defaultGateway: string;
  networkStart: string;
  networkEnd: string;
  zoneId: string;
  zoneName: string;
  zoneManager: string;
  lastFirewallCheck: string | null;
  firewall: string;
  ipAllocationCount: number;
  availableIpCount: number;
  reservedIpCount: number;
  totalIpCount: number;
  utilizationPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPAllocation {
  id: string;
  vlanId: string;
  vlanName: string;
  ciName: string;
  macAddress: string;
  ipAddress: string;
  description: string;
  allocationType: AllocationType;
  status: IPAllocationStatus;
  isReserved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form Data Interfaces
export interface DomainFormData {
  name: DomainType;
  description: string;
}

export interface ValueStreamFormData {
  name: string;
  domainId: string;
  description?: string;
}

export interface ZoneFormData {
  name: string;
  securityLevel: SecurityLevel;
  valueStreamId: string;
  manager: string;
}

export interface VLANFormData {
  vlanId: number;
  subnet: string;
  subnetMask: number;
  defaultGateway: string;
  zoneId: string;
  zoneManager: string;
  firewall: string;
  lastFirewallCheck?: string;
}

export interface IPAllocationFormData {
  ciName: string;
  macAddress: string;
  ipAddress?: string; // Optional for automatic allocation
  description: string;
  allocationType: AllocationType;
}

// API Response Types
export interface APIResponse<T> {
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

// UI State Types
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterState {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Hierarchy Navigation Types
export interface HierarchyNode {
  id: string;
  name: string;
  type: 'domain' | 'valueStream' | 'zone' | 'vlan';
  children: HierarchyNode[];
  metadata: {
    securityLevel?: string;
    manager?: string;
    ipCount?: number;
    vlanCount?: number;
    utilizationPercentage?: number;
  };
}

// Network Calculation Types
export interface IPRange {
  start: string;
  end: string;
  type: 'reserved' | 'available' | 'allocated';
  count: number;
}

export interface SubnetInfo {
  subnet: string;
  subnetMask: number;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIP: string;
  lastUsableIP: string;
  totalIPs: number;
  usableIPs: number;
  reservedIPs: string[];
}

// Health and System Status
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  checks: {
    database: boolean;
    cache: boolean;
    api: boolean;
  };
}

// User and Authentication
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  lastLogin: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Component Props Types
export interface TableColumn<T> {
  key: keyof T;
  title: string;
  render?: (value: unknown, record: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  selection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[]) => void;
  };
  actions?: {
    onCreate?: () => void;
    onEdit?: (record: T) => void;
    onDelete?: (record: T) => void;
    onView?: (record: T) => void;
  };
}

// Form Component Types
export interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface InputFieldProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  pattern?: string;
}

export interface SelectFieldProps extends FormFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

// Notification Types
export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

// Environment Configuration
export interface AppConfig {
  apiUrl: string;
  plantCode: string;
  organization: string;
  apiTimeout: number;
  cacheDuration: number;
  paginationSize: number;
  enableDebug: boolean;
  enableAnalytics: boolean;
}