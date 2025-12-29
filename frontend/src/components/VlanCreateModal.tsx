/**
 * VLAN Creation Modal
 * Modern form for creating new VLANs with automatic IP range calculation
 * Implements industrial security zone requirements
 */

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ServerIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Button, Input, Select, Badge } from '@/components/ui';
import { useVlanStore } from '@/stores/useVlanStore';

interface VlanCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainId: string;
}

interface FormData {
  vlanId: string;
  name: string;
  subnet: string;
  subnetMask: string;
  gateway: string;
  zoneName: string;
  zoneManager: string;
  securityType: string;
}

interface FormErrors {
  [key: string]: string;
}

const SECURITY_TYPES = [
  { value: 'SL3', label: 'SL3 - Secure BCN', description: 'Office Network, Server Network' },
  { value: 'MFZ_SL4', label: 'MFZ_SL4 - Manufacturing Zone', description: 'Production equipment and systems' },
  { value: 'LOG_SL4', label: 'LOG_SL4 - Logistics Zone', description: 'Warehouse and logistics systems' },
  { value: 'FMZ_SL4', label: 'FMZ_SL4 - Facility Zone', description: 'Building systems and infrastructure' },
  { value: 'ENG_SL4', label: 'ENG_SL4 - Engineering Zone', description: 'Engineering test benches' },
  { value: 'LRSZ_SL4', label: 'LRSZ_SL4 - Local Restricted Zone', description: 'MES, SQL, Docker zones' },
  { value: 'RSZ_SL4', label: 'RSZ_SL4 - Restricted Zone', description: 'High security restricted access' },
];

const SUBNET_MASKS = [
  { value: '255.255.255.0', label: '/24 (255.255.255.0)', hosts: 254 },
  { value: '255.255.254.0', label: '/23 (255.255.254.0)', hosts: 510 },
  { value: '255.255.252.0', label: '/22 (255.255.252.0)', hosts: 1022 },
  { value: '255.255.248.0', label: '/21 (255.255.248.0)', hosts: 2046 },
];

export const VlanCreateModal: React.FC<VlanCreateModalProps> = ({
  isOpen,
  onClose,
  domainId,
}) => {
  const { createVlan, loading, calculateIpRange } = useVlanStore();
  
  const [formData, setFormData] = useState<FormData>({
    vlanId: '',
    name: '',
    subnet: '',
    subnetMask: '255.255.255.0',
    gateway: '',
    zoneName: '',
    zoneManager: '',
    securityType: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [ipPreview, setIpPreview] = useState<{
    netStart: string;
    netEnd: string;
    totalIps: number;
  } | null>(null);

  // Auto-calculate IP ranges when subnet/mask changes
  useEffect(() => {
    if (formData.subnet && formData.subnetMask) {
      try {
        const preview = calculateIpRange(formData.subnet, formData.subnetMask);
        setIpPreview(preview);
        
        // Auto-generate gateway (typically first usable IP)
        if (formData.subnet && !formData.gateway) {
          const subnetParts = formData.subnet.split('.');
          const gatewayParts = [...subnetParts];
          gatewayParts[3] = '1';
          setFormData(prev => ({ ...prev, gateway: gatewayParts.join('.') }));
        }
      } catch (error) {
        setIpPreview(null);
      }
    }
  }, [formData.subnet, formData.subnetMask, calculateIpRange]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // VLAN ID validation
    const vlanId = parseInt(formData.vlanId);
    if (!formData.vlanId || isNaN(vlanId) || vlanId < 1 || vlanId > 4094) {
      newErrors.vlanId = 'VLAN ID must be between 1 and 4094';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'VLAN name is required';
    }

    // Subnet validation
    const subnetRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!formData.subnet || !subnetRegex.test(formData.subnet)) {
      newErrors.subnet = 'Invalid subnet format (e.g., 192.168.1.0)';
    }

    // Gateway validation
    const gatewayRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!formData.gateway || !gatewayRegex.test(formData.gateway)) {
      newErrors.gateway = 'Invalid gateway format (e.g., 192.168.1.1)';
    }

    // Zone name validation
    if (!formData.zoneName.trim()) {
      newErrors.zoneName = 'Zone name is required';
    }

    // Zone manager validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.zoneManager || !emailRegex.test(formData.zoneManager)) {
      newErrors.zoneManager = 'Valid email address is required';
    }

    // Security type validation
    if (!formData.securityType) {
      newErrors.securityType = 'Security type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await createVlan(domainId, {
        vlanId: parseInt(formData.vlanId),
        name: formData.name.trim(),
        subnet: formData.subnet,
        subnetMask: formData.subnetMask,
        gateway: formData.gateway,
        zoneName: formData.zoneName.trim(),
        zoneManager: formData.zoneManager.trim(),
        securityType: formData.securityType,
      });
      
      // Reset form and close modal
      setFormData({
        vlanId: '',
        name: '',
        subnet: '',
        subnetMask: '255.255.255.0',
        gateway: '',
        zoneName: '',
        zoneManager: '',
        securityType: '',
      });
      setErrors({});
      setIpPreview(null);
      onClose();
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedSecurityType = SECURITY_TYPES.find(type => type.value === formData.securityType);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between p-6 border-b border-secondary-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <ServerIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-secondary-900">Create New VLAN</h2>
            <p className="text-sm text-secondary-600">Configure network segmentation for this domain</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-secondary-900">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                VLAN ID *
              </label>
              <Input
                type="number"
                min="1"
                max="4094"
                value={formData.vlanId}
                onChange={(e) => handleInputChange('vlanId', e.target.value)}
                error={errors.vlanId}
                placeholder="e.g., 100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                VLAN Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="e.g., Manufacturing A2 VLAN"
              />
            </div>
          </div>
        </div>

        {/* Network Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-secondary-900">Network Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Subnet *
              </label>
              <Input
                value={formData.subnet}
                onChange={(e) => handleInputChange('subnet', e.target.value)}
                error={errors.subnet}
                placeholder="192.168.1.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Subnet Mask *
              </label>
              <Select
                value={formData.subnetMask}
                onChange={(value) => handleInputChange('subnetMask', value)}
                options={SUBNET_MASKS.map(mask => ({
                  value: mask.value,
                  label: `${mask.label} (${mask.hosts} hosts)`,
                }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Default Gateway *
              </label>
              <Input
                value={formData.gateway}
                onChange={(e) => handleInputChange('gateway', e.target.value)}
                error={errors.gateway}
                placeholder="192.168.1.1"
              />
            </div>
          </div>

          {/* IP Range Preview */}
          {ipPreview && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-5 w-5 text-primary-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-primary-900 mb-2">
                    Calculated IP Range
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-primary-700">Start IP:</span>
                      <span className="ml-2 font-mono text-primary-900">{ipPreview.netStart}</span>
                    </div>
                    <div>
                      <span className="text-primary-700">End IP:</span>
                      <span className="ml-2 font-mono text-primary-900">{ipPreview.netEnd}</span>
                    </div>
                    <div>
                      <span className="text-primary-700">Available IPs:</span>
                      <span className="ml-2 font-semibold text-primary-900">{ipPreview.totalIps}</span>
                    </div>
                  </div>
                  <p className="text-xs text-primary-600 mt-2">
                    First 6 IPs and last IP are reserved as Management IPs
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Zone Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-secondary-900">Zone Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Zone Name *
              </label>
              <Input
                value={formData.zoneName}
                onChange={(e) => handleInputChange('zoneName', e.target.value)}
                error={errors.zoneName}
                placeholder="e.g., Manufacturing Zone A2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Zone Manager *
              </label>
              <Input
                type="email"
                value={formData.zoneManager}
                onChange={(e) => handleInputChange('zoneManager', e.target.value)}
                error={errors.zoneManager}
                placeholder="manager@bosch.com"
              />
            </div>
          </div>
        </div>

        {/* Security Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-secondary-900">Security Configuration</h3>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Security Type *
            </label>
            <Select
              value={formData.securityType}
              onChange={(value) => handleInputChange('securityType', value)}
              error={errors.securityType}
              placeholder="Select security type..."
              options={SECURITY_TYPES.map(type => ({
                value: type.value,
                label: type.label,
              }))}
            />
            
            {selectedSecurityType && (
              <div className="mt-3 p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Badge variant="secondary" size="sm">
                    {selectedSecurityType.value}
                  </Badge>
                  <p className="text-sm text-secondary-700">
                    {selectedSecurityType.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-warning-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-warning-900 mb-1">
                Bosch Rexroth Compliance
              </h4>
              <p className="text-sm text-warning-700">
                This VLAN configuration must comply with Bosch Rexroth IT/OT security policies. 
                Firewall rules will be automatically generated based on the selected security type.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-secondary-200">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create VLAN
          </Button>
        </div>
      </form>
    </Dialog>
  );
};