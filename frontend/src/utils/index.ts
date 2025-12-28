/**
 * Utility Functions for IP Management System
 * Industrial-grade network management utilities
 */

import { clsx, type ClassValue } from 'clsx';
import { format, parseISO, isValid } from 'date-fns';

/**
 * Combine class names with clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format date strings for display
 */
export function formatDate(dateString: string | null, formatStr = 'MMM dd, yyyy'): string {
  if (!dateString) return 'Never';
  
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatStr) : 'Invalid date';
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format date with time for detailed views
 */
export function formatDateTime(dateString: string | null): string {
  return formatDate(dateString, 'MMM dd, yyyy HH:mm');
}

/**
 * Calculate days since a date
 */
export function daysSince(dateString: string | null): number {
  if (!dateString) return Infinity;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return Infinity;
    
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return Infinity;
  }
}

/**
 * Validate IP address format
 */
export function isValidIPAddress(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

/**
 * Validate MAC address format
 */
export function isValidMACAddress(mac: string): boolean {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
}

/**
 * Format MAC address to standard format (XX:XX:XX:XX:XX:XX)
 */
export function formatMACAddress(mac: string): string {
  // Remove all non-hex characters
  const cleanMac = mac.replace(/[^0-9A-Fa-f]/g, '');
  
  if (cleanMac.length !== 12) {
    return mac; // Return original if invalid length
  }
  
  // Insert colons every 2 characters
  return cleanMac.match(/.{2}/g)?.join(':').toUpperCase() || mac;
}

/**
 * Validate VLAN ID range
 */
export function isValidVLANId(vlanId: number): boolean {
  return vlanId >= 1 && vlanId <= 4094;
}

/**
 * Calculate subnet mask from CIDR notation
 */
export function cidrToSubnetMask(cidr: number): string {
  if (cidr < 0 || cidr > 32) {
    throw new Error('Invalid CIDR notation');
  }
  
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  return [
    (mask >>> 24) & 0xff,
    (mask >>> 16) & 0xff,
    (mask >>> 8) & 0xff,
    mask & 0xff
  ].join('.');
}

/**
 * Calculate CIDR from subnet mask
 */
export function subnetMaskToCidr(mask: string): number {
  const parts = mask.split('.').map(Number);
  if (parts.length !== 4 || parts.some(part => part < 0 || part > 255)) {
    throw new Error('Invalid subnet mask');
  }
  
  const binary = parts.map(part => part.toString(2).padStart(8, '0')).join('');
  const cidr = binary.indexOf('0');
  return cidr === -1 ? 32 : cidr;
}

/**
 * Calculate network address from IP and subnet mask
 */
export function calculateNetworkAddress(ip: string, subnetMask: string): string {
  const ipParts = ip.split('.').map(Number);
  const maskParts = subnetMask.split('.').map(Number);
  
  if (ipParts.length !== 4 || maskParts.length !== 4) {
    throw new Error('Invalid IP address or subnet mask');
  }
  
  const networkParts = ipParts.map((ipPart, index) => ipPart & maskParts[index]);
  return networkParts.join('.');
}

/**
 * Calculate broadcast address from network address and subnet mask
 */
export function calculateBroadcastAddress(networkAddress: string, subnetMask: string): string {
  const networkParts = networkAddress.split('.').map(Number);
  const maskParts = subnetMask.split('.').map(Number);
  
  if (networkParts.length !== 4 || maskParts.length !== 4) {
    throw new Error('Invalid network address or subnet mask');
  }
  
  const broadcastParts = networkParts.map((networkPart, index) => 
    networkPart | (255 - maskParts[index])
  );
  return broadcastParts.join('.');
}

/**
 * Generate IP range from network address and subnet mask
 */
export function generateIPRange(networkAddress: string, subnetMask: string): {
  firstUsable: string;
  lastUsable: string;
  totalIPs: number;
  usableIPs: number;
} {
  const networkParts = networkAddress.split('.').map(Number);
  const maskParts = subnetMask.split('.').map(Number);
  
  // Calculate total IPs in subnet
  const hostBits = maskParts.reduce((bits, octet) => {
    return bits + (8 - octet.toString(2).split('1').length + 1);
  }, 0);
  
  const totalIPs = Math.pow(2, hostBits);
  const usableIPs = totalIPs - 2; // Exclude network and broadcast
  
  // First usable IP (network + 1)
  const firstUsableParts = [...networkParts];
  firstUsableParts[3] += 1;
  
  // Last usable IP (broadcast - 1)
  const broadcastAddress = calculateBroadcastAddress(networkAddress, subnetMask);
  const lastUsableParts = broadcastAddress.split('.').map(Number);
  lastUsableParts[3] -= 1;
  
  return {
    firstUsable: firstUsableParts.join('.'),
    lastUsable: lastUsableParts.join('.'),
    totalIPs,
    usableIPs,
  };
}

/**
 * Check if IP is in subnet range
 */
export function isIPInSubnet(ip: string, networkAddress: string, subnetMask: string): boolean {
  try {
    const calculatedNetwork = calculateNetworkAddress(ip, subnetMask);
    return calculatedNetwork === networkAddress;
  } catch {
    return false;
  }
}

/**
 * Generate reserved IP addresses (first 6 + last)
 */
export function generateReservedIPs(networkAddress: string, subnetMask: string): string[] {
  const range = generateIPRange(networkAddress, subnetMask);
  const reserved: string[] = [];
  
  // First 6 IPs
  const firstParts = range.firstUsable.split('.').map(Number);
  for (let i = 0; i < 6; i++) {
    const ip = [...firstParts];
    ip[3] += i;
    if (ip[3] <= 255) {
      reserved.push(ip.join('.'));
    }
  }
  
  // Last IP
  reserved.push(range.lastUsable);
  
  return reserved;
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, char => char.toUpperCase())
    .trim();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Get status color based on utilization percentage
 */
export function getUtilizationColor(percentage: number): string {
  if (percentage >= 90) return 'text-error-600 bg-error-50';
  if (percentage >= 75) return 'text-warning-600 bg-warning-50';
  if (percentage >= 50) return 'text-primary-600 bg-primary-50';
  return 'text-success-600 bg-success-50';
}

/**
 * Get security level color
 */
export function getSecurityLevelColor(level: string): string {
  switch (level) {
    case 'SL3':
      return 'text-primary-600 bg-primary-50';
    case 'MFZ_SL4':
      return 'text-success-600 bg-success-50';
    case 'LOG_SL4':
      return 'text-warning-600 bg-warning-50';
    case 'FMZ_SL4':
      return 'text-secondary-600 bg-secondary-50';
    case 'ENG_SL4':
      return 'text-purple-600 bg-purple-50';
    case 'LRSZ_SL4':
      return 'text-error-600 bg-error-50';
    case 'RSZ_SL4':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-secondary-600 bg-secondary-50';
  }
}

/**
 * Get IP status color
 */
export function getIPStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'allocated':
      return 'text-error-600 bg-error-50';
    case 'available':
      return 'text-success-600 bg-success-50';
    case 'reserved':
      return 'text-warning-600 bg-warning-50';
    default:
      return 'text-secondary-600 bg-secondary-50';
  }
}