/**
 * Type Definitions for IP Management System
 * Comprehensive type definitions for industrial network management
 */

// Domain Types
export enum DomainType {
  MFG = 'MFG',
  LOG = 'LOG', 
  FCM = 'FCM',
  ENG = 'ENG',
}

export interface Domain {
  id: string;
  name: DomainType;
  description: string;
  valueStreamCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DomainFormData {
  name: DomainType;
  description: string;
}

// VLAN Types
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
  securityType: string;
  status: 'active' | 'inactive' | 'warning' | 'error';
  utilization: number;
  totalIps: number;
  usedIps: number;
  lastFirewallCheck: string;
  createdAt: string;
  updatedAt: string;
}

// IP Device Types
export interface IpDevice {
  id: string;
  vlanId: string;
  ipAddress: string;
  ciName: string;
  macAddress: string;
  description: string;
  status: 'active' | 'inactive' | 'reserved' | 'conflict';
  deviceType: string;
  lastSeen: string;
  isReserved: boolean;
  createdAt: string;
  updatedAt: string;
}

// User and Authentication Types
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

// System Health Types
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

// UI State Types
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterState {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Table Component Types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string | number;
  className?: string;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

export interface TableActions<T = any> {
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onView?: (record: T) => void;
  onCreate?: () => void;
}

export interface TableSelection {
  selectedRowKeys: string[];
  onChange: (selectedRowKeys: string[]) => void;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: TablePagination;
  selection?: TableSelection;
  actions?: TableActions<T>;
  emptyMessage?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

// Network Types
export interface NetworkSegment {
  id: string;
  name: string;
  subnet: string;
  vlanId: number;
  securityLevel: string;
  deviceCount: number;
}

export interface SecurityZone {
  id: string;
  name: string;
  type: string;
  description: string;
  securityLevel: 'SL3' | 'SL4';
  restrictions: string[];
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps {
  loading?: boolean;
  loadingText?: string;
}

export interface ErrorProps {
  error?: string | null;
  onErrorClear?: () => void;
}