/**
 * IP Assignment Form
 * Comprehensive form for manual and automated IP allocation with validation
 */

import React, { useState, useEffect } from 'react';
import {
  ComputerDesktopIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils';

interface FormData {
  assignmentType: 'manual' | 'automatic';
  domain: string;
  vlan: string;
  ipAddress: string;
  deviceInfo: {
    name: string;
    type: string;
    macAddress: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
  };
  networkConfig: {
    subnet: string;
    gateway: string;
    dnsServers: string[];
    leaseType: 'static' | 'dhcp' | 'reserved';
    leaseDuration?: number;
  };
  metadata: {
    location: string;
    owner: string;
    department: string;
    description: string;
    tags: string[];
  };
  security: {
    level: string;
    accessControl: string[];
    monitoring: boolean;
  };
}

interface ValidationError {
  field: string;
  message: string;
}

interface AvailableIP {
  ip: string;
  status: 'available' | 'suggested' | 'reserved';
  reason?: string;
}

const IPAssignmentForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    assignmentType: 'automatic',
    domain: '',
    vlan: '',
    ipAddress: '',
    deviceInfo: {
      name: '',
      type: '',
      macAddress: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
    },
    networkConfig: {
      subnet: '',
      gateway: '',
      dnsServers: ['8.8.8.8', '8.8.4.4'],
      leaseType: 'static',
    },
    metadata: {
      location: '',
      owner: '',
      department: '',
      description: '',
      tags: [],
    },
    security: {
      level: '',
      accessControl: [],
      monitoring: true,
    },
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [availableIPs, setAvailableIPs] = useState<AvailableIP[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Mock data
  const domains = [
    { id: 'mfg', name: 'Manufacturing', code: 'MFG' },
    { id: 'log', name: 'Logistics', code: 'LOG' },
    { id: 'fcm', name: 'Facility Management', code: 'FCM' },
    { id: 'eng', name: 'Engineering', code: 'ENG' },
  ];

  const vlans = [
    { id: 'vlan-100', name: 'Production Line A2', vlanId: 100, subnet: '192.168.100.0/24', domain: 'mfg' },
    { id: 'vlan-101', name: 'Production Line A4', vlanId: 101, subnet: '192.168.101.0/24', domain: 'mfg' },
    { id: 'vlan-200', name: 'Warehouse LOG21', vlanId: 200, subnet: '192.168.200.0/24', domain: 'log' },
    { id: 'vlan-300', name: 'Security Systems', vlanId: 300, subnet: '192.168.300.0/24', domain: 'fcm' },
  ];

  const deviceTypes = [
    'PLC Controller', 'HMI Panel', 'Industrial Robot', 'Network Gateway',
    'Security Camera', 'Sensor Node', 'Actuator', 'Switch', 'Router',
    'Server', 'Workstation', 'Printer', 'Access Point'
  ];

  const securityLevels = [
    { value: 'SL3', label: 'SL3 - Secure BCN', description: 'Office and server networks' },
    { value: 'MFZ_SL4', label: 'MFZ_SL4 - Manufacturing Zone', description: 'Production equipment' },
    { value: 'LOG_SL4', label: 'LOG_SL4 - Logistics Zone', description: 'Warehouse systems' },
    { value: 'FMZ_SL4', label: 'FMZ_SL4 - Facility Zone', description: 'Building management' },
    { value: 'ENG_SL4', label: 'ENG_SL4 - Engineering Zone', description: 'Development and testing' },
  ];

  // Auto-suggest IPs when VLAN changes
  useEffect(() => {
    if (formData.vlan && formData.assignmentType === 'automatic') {
      setIsValidating(true);
      // Simulate IP discovery
      setTimeout(() => {
        const selectedVlan = vlans.find(v => v.id === formData.vlan);
        if (selectedVlan) {
          const baseIP = selectedVlan.subnet.split('/')[0].split('.').slice(0, 3).join('.');
          const suggestions: AvailableIP[] = [
            { ip: `${baseIP}.10`, status: 'suggested', reason: 'Recommended for new devices' },
            { ip: `${baseIP}.11`, status: 'available' },
            { ip: `${baseIP}.12`, status: 'available' },
            { ip: `${baseIP}.15`, status: 'available' },
            { ip: `${baseIP}.20`, status: 'available' },
          ];
          setAvailableIPs(suggestions);
          
          // Auto-select first suggested IP
          setFormData(prev => ({
            ...prev,
            ipAddress: suggestions[0].ip,
            networkConfig: {
              ...prev.networkConfig,
              subnet: selectedVlan.subnet,
              gateway: `${baseIP}.1`,
            }
          }));
        }
        setIsValidating(false);
      }, 1000);
    }
  }, [formData.vlan, formData.assignmentType]);

  // Validation
  const validateForm = (): ValidationError[] => {
    const newErrors: ValidationError[] = [];

    if (!formData.domain) newErrors.push({ field: 'domain', message: 'Domain is required' });
    if (!formData.vlan) newErrors.push({ field: 'vlan', message: 'VLAN is required' });
    if (!formData.ipAddress) newErrors.push({ field: 'ipAddress', message: 'IP address is required' });
    if (!formData.deviceInfo.name) newErrors.push({ field: 'deviceInfo.name', message: 'Device name is required' });
    if (!formData.deviceInfo.type) newErrors.push({ field: 'deviceInfo.type', message: 'Device type is required' });
    
    // MAC address validation
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (formData.deviceInfo.macAddress && !macRegex.test(formData.deviceInfo.macAddress)) {
      newErrors.push({ field: 'deviceInfo.macAddress', message: 'Invalid MAC address format' });
    }

    // IP address validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (formData.ipAddress && !ipRegex.test(formData.ipAddress)) {
      newErrors.push({ field: 'ipAddress', message: 'Invalid IP address format' });
    }

    return newErrors;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [keys[0]]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof FormData],
            [keys[1]]: value,
          },
        };
      }
      return prev;
    });

    // Clear errors for this field
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      // Reset form or show success message
    }, 2000);
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const filteredVlans = vlans.filter(vlan => !formData.domain || vlan.domain === formData.domain);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">IP Assignment</h2>
          <p className="text-gray-600">Configure network settings for new devices</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  'h-2 w-8 rounded-full',
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Assignment Type */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className={cn(
                  'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none',
                  formData.assignmentType === 'automatic' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-300'
                )}>
                  <input
                    type="radio"
                    name="assignmentType"
                    value="automatic"
                    checked={formData.assignmentType === 'automatic'}
                    onChange={(e) => handleInputChange('assignmentType', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <ArrowPathIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Automatic</div>
                      <div className="text-sm text-gray-500">System suggests available IPs</div>
                    </div>
                  </div>
                </label>

                <label className={cn(
                  'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none',
                  formData.assignmentType === 'manual' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-300'
                )}>
                  <input
                    type="radio"
                    name="assignmentType"
                    value="manual"
                    checked={formData.assignmentType === 'manual'}
                    onChange={(e) => handleInputChange('assignmentType', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <GlobeAltIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Manual</div>
                      <div className="text-sm text-gray-500">Specify exact IP address</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Network Configuration */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Network Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain *
                  </label>
                  <select
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    className={cn(
                      'block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500',
                      getFieldError('domain') ? 'border-red-300' : 'border-gray-300'
                    )}
                  >
                    <option value="">Select domain</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.name} ({domain.code})
                      </option>
                    ))}
                  </select>
                  {getFieldError('domain') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('domain')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VLAN *
                  </label>
                  <select
                    value={formData.vlan}
                    onChange={(e) => handleInputChange('vlan', e.target.value)}
                    disabled={!formData.domain}
                    className={cn(
                      'block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500',
                      getFieldError('vlan') ? 'border-red-300' : 'border-gray-300',
                      !formData.domain && 'bg-gray-100'
                    )}
                  >
                    <option value="">Select VLAN</option>
                    {filteredVlans.map((vlan) => (
                      <option key={vlan.id} value={vlan.id}>
                        VLAN {vlan.vlanId} - {vlan.name}
                      </option>
                    ))}
                  </select>
                  {getFieldError('vlan') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('vlan')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Address *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.ipAddress}
                      onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                      placeholder="192.168.1.10"
                      disabled={formData.assignmentType === 'automatic' && isValidating}
                      className={cn(
                        'block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500',
                        getFieldError('ipAddress') ? 'border-red-300' : 'border-gray-300',
                        (formData.assignmentType === 'automatic' && isValidating) && 'bg-gray-100'
                      )}
                    />
                    {isValidating && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <ArrowPathIcon className="h-4 w-4 text-gray-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  {getFieldError('ipAddress') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('ipAddress')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Type
                  </label>
                  <select
                    value={formData.networkConfig.leaseType}
                    onChange={(e) => handleInputChange('networkConfig.leaseType', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="static">Static</option>
                    <option value="dhcp">DHCP</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Device Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Name *
                  </label>
                  <input
                    type="text"
                    value={formData.deviceInfo.name}
                    onChange={(e) => handleInputChange('deviceInfo.name', e.target.value)}
                    placeholder="PLC-A2-001"
                    className={cn(
                      'block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500',
                      getFieldError('deviceInfo.name') ? 'border-red-300' : 'border-gray-300'
                    )}
                  />
                  {getFieldError('deviceInfo.name') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('deviceInfo.name')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Type *
                  </label>
                  <select
                    value={formData.deviceInfo.type}
                    onChange={(e) => handleInputChange('deviceInfo.type', e.target.value)}
                    className={cn(
                      'block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500',
                      getFieldError('deviceInfo.type') ? 'border-red-300' : 'border-gray-300'
                    )}
                  >
                    <option value="">Select device type</option>
                    {deviceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {getFieldError('deviceInfo.type') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('deviceInfo.type')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MAC Address
                  </label>
                  <input
                    type="text"
                    value={formData.deviceInfo.macAddress}
                    onChange={(e) => handleInputChange('deviceInfo.macAddress', e.target.value)}
                    placeholder="00:1B:44:11:3A:B7"
                    className={cn(
                      'block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500',
                      getFieldError('deviceInfo.macAddress') ? 'border-red-300' : 'border-gray-300'
                    )}
                  />
                  {getFieldError('deviceInfo.macAddress') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('deviceInfo.macAddress')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formData.deviceInfo.manufacturer}
                    onChange={(e) => handleInputChange('deviceInfo.manufacturer', e.target.value)}
                    placeholder="Siemens"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.metadata.description}
                    onChange={(e) => handleInputChange('metadata.description', e.target.value)}
                    rows={3}
                    placeholder="Device description and purpose..."
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Security Configuration */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Level
                  </label>
                  <select
                    value={formData.security.level}
                    onChange={(e) => handleInputChange('security.level', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select security level</option>
                    {securityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {formData.security.level && (
                    <p className="mt-1 text-sm text-gray-500">
                      {securityLevels.find(l => l.value === formData.security.level)?.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.security.monitoring}
                    onChange={(e) => handleInputChange('security.monitoring', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Enable network monitoring for this device
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available IPs */}
            {formData.assignmentType === 'automatic' && availableIPs.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Available IP Addresses</h3>
                <div className="space-y-2">
                  {availableIPs.map((ip) => (
                    <button
                      key={ip.ip}
                      type="button"
                      onClick={() => handleInputChange('ipAddress', ip.ip)}
                      className={cn(
                        'w-full text-left p-3 border rounded-lg hover:bg-gray-50',
                        formData.ipAddress === ip.ip ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">{ip.ip}</span>
                        <span className={cn(
                          'text-xs px-2 py-1 rounded',
                          ip.status === 'suggested' ? 'bg-green-100 text-green-800' :
                          ip.status === 'available' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        )}>
                          {ip.status}
                        </span>
                      </div>
                      {ip.reason && (
                        <div className="text-xs text-gray-500 mt-1">{ip.reason}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Status</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">Network configuration valid</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">IP address available</span>
                </div>
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-700">Security level not set</span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">IP Assignment Guidelines</p>
                  <ul className="text-xs space-y-1">
                    <li>• First 6 IPs are reserved for management</li>
                    <li>• Last IP (.255) is reserved for broadcast</li>
                    <li>• Static assignments are recommended for critical devices</li>
                    <li>• Security level must match VLAN requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Save as Draft
          </button>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || errors.length > 0}
              className={cn(
                'px-6 py-2 text-sm font-medium text-white rounded-md',
                isSubmitting || errors.length > 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Assigning IP...
                </div>
              ) : (
                'Assign IP Address'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export { IPAssignmentForm };