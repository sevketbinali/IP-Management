/**
 * IP Configuration Modal
 * Advanced interface for managing device IP allocations within a VLAN
 * Implements industrial device management with CI tracking
 */

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  GlobeAltIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Button, Input, Badge, Table } from '@/components/ui';
import { useIpStore } from '@/stores/useIpStore';
import { formatDateTime } from '@/utils';

interface IpConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vlan: any;
}

interface IpDevice {
  id: string;
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

interface DeviceFormData {
  ciName: string;
  macAddress: string;
  description: string;
  deviceType: string;
}

const DEVICE_TYPES = [
  'PLC',
  'HMI',
  'Robot Controller',
  'Vision System',
  'Sensor',
  'Gateway',
  'Switch',
  'Server',
  'Workstation',
  'Printer',
  'Camera',
  'Analyzer',
  'Other',
];

export const IpConfigurationModal: React.FC<IpConfigurationModalProps> = ({
  isOpen,
  onClose,
  vlan,
}) => {
  const { devices, fetchDevicesByVlan, addDevice, updateDevice, deleteDevice, loading } = useIpStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<IpDevice | null>(null);
  const [selectedIp, setSelectedIp] = useState<string>('');
  
  const [formData, setFormData] = useState<DeviceFormData>({
    ciName: '',
    macAddress: '',
    description: '',
    deviceType: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch devices when modal opens
  useEffect(() => {
    if (isOpen && vlan?.id) {
      fetchDevicesByVlan(vlan.id);
    }
  }, [isOpen, vlan?.id, fetchDevicesByVlan]);

  // Generate available IP addresses
  const generateAvailableIps = (): string[] => {
    if (!vlan) return [];
    
    const usedIps = new Set(devices.map(d => d.ipAddress));
    const availableIps: string[] = [];
    
    // Parse network range
    const [baseIp] = vlan.netStart.split('.');
    const startOctet = parseInt(vlan.netStart.split('.')[3]);
    const endOctet = parseInt(vlan.netEnd.split('.')[3]);
    
    for (let i = startOctet; i <= endOctet; i++) {
      const ip = `${vlan.subnet.split('.').slice(0, 3).join('.')}.${i}`;
      if (!usedIps.has(ip)) {
        availableIps.push(ip);
      }
    }
    
    return availableIps.slice(0, 50); // Limit to first 50 for performance
  };

  const availableIps = generateAvailableIps();

  // Filter devices based on search
  const filteredDevices = devices.filter(device =>
    device.ciName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.ipAddress.includes(searchQuery) ||
    device.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.ciName.trim()) {
      errors.ciName = 'CI Name is required';
    }

    if (!formData.macAddress.trim()) {
      errors.macAddress = 'MAC Address is required';
    } else if (!/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(formData.macAddress)) {
      errors.macAddress = 'Invalid MAC address format';
    }

    if (!selectedIp) {
      errors.ipAddress = 'IP Address is required';
    }

    if (!formData.deviceType) {
      errors.deviceType = 'Device Type is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !vlan) return;

    try {
      const deviceData = {
        ...formData,
        ipAddress: selectedIp,
        vlanId: vlan.id,
      };

      if (editingDevice) {
        await updateDevice(editingDevice.id, deviceData);
      } else {
        await addDevice(deviceData);
      }

      // Reset form
      setFormData({
        ciName: '',
        macAddress: '',
        description: '',
        deviceType: '',
      });
      setSelectedIp('');
      setFormErrors({});
      setShowAddForm(false);
      setEditingDevice(null);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleEdit = (device: IpDevice) => {
    setEditingDevice(device);
    setFormData({
      ciName: device.ciName,
      macAddress: device.macAddress,
      description: device.description,
      deviceType: device.deviceType,
    });
    setSelectedIp(device.ipAddress);
    setShowAddForm(true);
  };

  const handleDelete = async (deviceId: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      await deleteDevice(deviceId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'reserved': return 'warning';
      case 'conflict': return 'error';
      default: return 'secondary';
    }
  };

  const columns = [
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (device: IpDevice) => (
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm">{device.ipAddress}</span>
          {device.isReserved && (
            <Badge variant="warning" size="xs">Reserved</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'ciName',
      header: 'CI Name',
      render: (device: IpDevice) => (
        <div className="flex items-center space-x-2">
          <ComputerDesktopIcon className="h-4 w-4 text-secondary-400" />
          <span className="font-medium">{device.ciName}</span>
        </div>
      ),
    },
    {
      key: 'macAddress',
      header: 'MAC Address',
      render: (device: IpDevice) => (
        <span className="font-mono text-sm text-secondary-600">
          {device.macAddress}
        </span>
      ),
    },
    {
      key: 'deviceType',
      header: 'Type',
      render: (device: IpDevice) => (
        <Badge variant="secondary" size="sm">
          {device.deviceType}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (device: IpDevice) => (
        <Badge variant={getStatusColor(device.status)} size="sm">
          {device.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'lastSeen',
      header: 'Last Seen',
      render: (device: IpDevice) => (
        <span className="text-sm text-secondary-600">
          {formatDateTime(device.lastSeen)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (device: IpDevice) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(device)}
            disabled={device.isReserved}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(device.id)}
            disabled={device.isReserved}
            className="text-error-600 hover:text-error-700"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (!vlan) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex items-center justify-between p-6 border-b border-secondary-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <GlobeAltIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-secondary-900">
              IP Configuration - VLAN {vlan.vlanId}
            </h2>
            <p className="text-sm text-secondary-600">
              {vlan.name} • {vlan.subnet}/{vlan.subnetMask}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-6">
        {/* Network Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-700">Total IPs</p>
                <p className="text-2xl font-bold text-primary-900">{vlan.totalIps}</p>
              </div>
              <GlobeAltIcon className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success-700">Assigned</p>
                <p className="text-2xl font-bold text-success-900">{devices.length}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-success-600" />
            </div>
          </div>
          
          <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-700">Available</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {vlan.totalIps - devices.length}
                </p>
              </div>
              <ComputerDesktopIcon className="h-8 w-8 text-secondary-600" />
            </div>
          </div>
          
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning-700">Utilization</p>
                <p className="text-2xl font-bold text-warning-900">{vlan.utilization}%</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-warning-600" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <Input
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            Add Device
          </Button>
        </div>

        {/* Add/Edit Device Form */}
        {showAddForm && (
          <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">
              {editingDevice ? 'Edit Device' : 'Add New Device'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    CI Name *
                  </label>
                  <Input
                    value={formData.ciName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ciName: e.target.value }))}
                    error={formErrors.ciName}
                    placeholder="e.g., PLC-A2-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    MAC Address *
                  </label>
                  <Input
                    value={formData.macAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, macAddress: e.target.value }))}
                    error={formErrors.macAddress}
                    placeholder="00:1B:44:11:3A:B7"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    IP Address *
                  </label>
                  <select
                    value={selectedIp}
                    onChange={(e) => setSelectedIp(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select IP Address</option>
                    {availableIps.map(ip => (
                      <option key={ip} value={ip}>{ip}</option>
                    ))}
                  </select>
                  {formErrors.ipAddress && (
                    <p className="mt-1 text-sm text-error-600">{formErrors.ipAddress}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Device Type *
                  </label>
                  <select
                    value={formData.deviceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, deviceType: e.target.value }))}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Device Type</option>
                    {DEVICE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {formErrors.deviceType && (
                    <p className="mt-1 text-sm text-error-600">{formErrors.deviceType}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Device description or location"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingDevice(null);
                    setFormData({
                      ciName: '',
                      macAddress: '',
                      description: '',
                      deviceType: '',
                    });
                    setSelectedIp('');
                    setFormErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  {editingDevice ? 'Update Device' : 'Add Device'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Device Table */}
        <div className="bg-white border border-secondary-200 rounded-lg">
          <Table
            data={filteredDevices}
            columns={columns}
            loading={loading}
            emptyMessage="No devices configured for this VLAN"
          />
        </div>

        {/* Reserved IPs Notice */}
        <div className="mt-4 bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-warning-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-warning-900 mb-1">
                Reserved Management IPs
              </h4>
              <p className="text-sm text-warning-700">
                The first 6 IPs ({vlan.subnet.split('.').slice(0, 3).join('.')}.1 - {vlan.subnet.split('.').slice(0, 3).join('.')}.6) 
                and the last IP ({vlan.netEnd}) are reserved for network management and cannot be assigned to devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};