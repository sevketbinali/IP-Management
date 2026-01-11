/**
 * Utility functions for the IP Management application
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date/time strings for display
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd.MM.yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format date only
 */
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd.MM.yyyy');
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Get color classes for security levels
 */
export function getSecurityLevelColor(securityType: string): string {
  switch (securityType) {
    case 'SL3':
      return 'bg-blue-100 text-blue-800';
    case 'MFZ_SL4':
      return 'bg-green-100 text-green-800';
    case 'LOG_SL4':
      return 'bg-purple-100 text-purple-800';
    case 'FMZ_SL4':
      return 'bg-yellow-100 text-yellow-800';
    case 'ENG_SL4':
      return 'bg-indigo-100 text-indigo-800';
    case 'LRSZ_SL4':
      return 'bg-red-100 text-red-800';
    case 'RSZ_SL4':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Validate IP address format
 */
export function isValidIpAddress(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

/**
 * Validate MAC address format
 */
export function isValidMacAddress(mac: string): boolean {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
}

/**
 * Calculate subnet information
 */
export function calculateSubnetInfo(subnet: string, netmask: string) {
  const subnetParts = subnet.split('.').map(Number);
  const maskParts = netmask.split('.').map(Number);
  
  // Calculate network address
  const networkParts = subnetParts.map((part, index) => part & maskParts[index]);
  const networkAddress = networkParts.join('.');
  
  // Calculate broadcast address
  const broadcastParts = networkParts.map((part, index) => part | (255 - maskParts[index]));
  const broadcastAddress = broadcastParts.join('.');
  
  // Calculate total IPs (excluding network and broadcast)
  const hostBits = maskParts.reduce((bits, octet) => {
    return bits + (8 - octet.toString(2).split('1').length + 1);
  }, 0);
  const totalHosts = Math.pow(2, hostBits) - 2;
  
  return {
    networkAddress,
    broadcastAddress,
    totalHosts,
    firstUsableIp: networkParts.map((part, index) => 
      index === 3 ? part + 1 : part
    ).join('.'),
    lastUsableIp: broadcastParts.map((part, index) => 
      index === 3 ? part - 1 : part
    ).join('.'),
  };
}

/**
 * Generate IP range for a subnet
 */
export function generateIpRange(subnet: string, netmask: string, reservedCount: number = 6): string[] {
  const info = calculateSubnetInfo(subnet, netmask);
  const ips: string[] = [];
  
  const startParts = info.firstUsableIp.split('.').map(Number);
  const endParts = info.lastUsableIp.split('.').map(Number);
  
  // Skip reserved IPs at the beginning
  startParts[3] += reservedCount;
  
  for (let i = startParts[3]; i <= endParts[3] - 1; i++) {
    ips.push(`${startParts[0]}.${startParts[1]}.${startParts[2]}.${i}`);
  }
  
  return ips;
}

/**
 * Check if IP is in reserved range
 */
export function isReservedIp(ip: string, subnet: string): boolean {
  const ipParts = ip.split('.').map(Number);
  const subnetParts = subnet.split('.').map(Number);
  
  // Check if IP is in the same subnet
  if (ipParts[0] !== subnetParts[0] || 
      ipParts[1] !== subnetParts[1] || 
      ipParts[2] !== subnetParts[2]) {
    return false;
  }
  
  const lastOctet = ipParts[3];
  
  // First 6 IPs and last IP are reserved
  return lastOctet <= 6 || lastOctet >= 254;
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
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
export function debounce<T extends (...args: any[]) => any>(
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
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Download data as file
 */
export function downloadFile(data: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}