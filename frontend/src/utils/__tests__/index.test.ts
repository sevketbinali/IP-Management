/**
 * Utility Functions Tests
 * Unit tests for utility functions
 */

import {
  cn,
  formatDate,
  daysSince,
  isValidIPAddress,
  isValidMACAddress,
  formatMACAddress,
  isValidVLANId,
  cidrToSubnetMask,
  subnetMaskToCidr,
  calculateNetworkAddress,
  generateReservedIPs,
  getUtilizationColor,
  getSecurityLevelColor,
  getIPStatusColor,
} from '@/utils';

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
    });
  });

  describe('formatDate', () => {
    it('formats valid date strings', () => {
      const date = '2024-01-15T10:30:00Z';
      expect(formatDate(date)).toMatch(/Jan 15, 2024/);
    });

    it('handles null dates', () => {
      expect(formatDate(null)).toBe('Never');
    });

    it('handles invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid date');
    });
  });

  describe('daysSince', () => {
    it('calculates days correctly', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      expect(daysSince(yesterday)).toBe(1);
    });

    it('handles null dates', () => {
      expect(daysSince(null)).toBe(Infinity);
    });
  });

  describe('IP address validation', () => {
    it('validates correct IP addresses', () => {
      expect(isValidIPAddress('192.168.1.1')).toBe(true);
      expect(isValidIPAddress('10.0.0.1')).toBe(true);
      expect(isValidIPAddress('255.255.255.255')).toBe(true);
    });

    it('rejects invalid IP addresses', () => {
      expect(isValidIPAddress('256.1.1.1')).toBe(false);
      expect(isValidIPAddress('192.168.1')).toBe(false);
      expect(isValidIPAddress('not-an-ip')).toBe(false);
    });
  });

  describe('MAC address validation and formatting', () => {
    it('validates correct MAC addresses', () => {
      expect(isValidMACAddress('00:11:22:33:44:55')).toBe(true);
      expect(isValidMACAddress('AA-BB-CC-DD-EE-FF')).toBe(true);
    });

    it('rejects invalid MAC addresses', () => {
      expect(isValidMACAddress('00:11:22:33:44')).toBe(false);
      expect(isValidMACAddress('not-a-mac')).toBe(false);
    });

    it('formats MAC addresses correctly', () => {
      expect(formatMACAddress('001122334455')).toBe('00:11:22:33:44:55');
      expect(formatMACAddress('00-11-22-33-44-55')).toBe('00:11:22:33:44:55');
    });
  });

  describe('VLAN ID validation', () => {
    it('validates correct VLAN IDs', () => {
      expect(isValidVLANId(1)).toBe(true);
      expect(isValidVLANId(100)).toBe(true);
      expect(isValidVLANId(4094)).toBe(true);
    });

    it('rejects invalid VLAN IDs', () => {
      expect(isValidVLANId(0)).toBe(false);
      expect(isValidVLANId(4095)).toBe(false);
      expect(isValidVLANId(-1)).toBe(false);
    });
  });

  describe('Subnet calculations', () => {
    it('converts CIDR to subnet mask', () => {
      expect(cidrToSubnetMask(24)).toBe('255.255.255.0');
      expect(cidrToSubnetMask(16)).toBe('255.255.0.0');
      expect(cidrToSubnetMask(8)).toBe('255.0.0.0');
    });

    it('converts subnet mask to CIDR', () => {
      expect(subnetMaskToCidr('255.255.255.0')).toBe(24);
      expect(subnetMaskToCidr('255.255.0.0')).toBe(16);
      expect(subnetMaskToCidr('255.0.0.0')).toBe(8);
    });

    it('calculates network address', () => {
      expect(calculateNetworkAddress('192.168.1.100', '255.255.255.0')).toBe('192.168.1.0');
      expect(calculateNetworkAddress('10.1.2.3', '255.255.0.0')).toBe('10.1.0.0');
    });

    it('generates reserved IPs correctly', () => {
      const reserved = generateReservedIPs('192.168.1.0', '255.255.255.0');
      expect(reserved).toHaveLength(7); // First 6 + last
      expect(reserved).toContain('192.168.1.1');
      expect(reserved).toContain('192.168.1.6');
      expect(reserved).toContain('192.168.1.254');
    });
  });

  describe('Color utilities', () => {
    it('returns correct utilization colors', () => {
      expect(getUtilizationColor(95)).toContain('text-error-600');
      expect(getUtilizationColor(80)).toContain('text-warning-600');
      expect(getUtilizationColor(60)).toContain('text-primary-600');
      expect(getUtilizationColor(30)).toContain('text-success-600');
    });

    it('returns correct security level colors', () => {
      expect(getSecurityLevelColor('SL3')).toContain('text-primary-600');
      expect(getSecurityLevelColor('MFZ_SL4')).toContain('text-success-600');
      expect(getSecurityLevelColor('UNKNOWN')).toContain('text-secondary-600');
    });

    it('returns correct IP status colors', () => {
      expect(getIPStatusColor('allocated')).toContain('text-error-600');
      expect(getIPStatusColor('available')).toContain('text-success-600');
      expect(getIPStatusColor('reserved')).toContain('text-warning-600');
    });
  });
});