/**
 * Domain & VLAN Configuration Panel
 * Interactive panel for managing business domains and VLAN segmentation
 */

import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  BuildingOfficeIcon,
  ServerIcon,
  ShieldCheckIcon,
  CogIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils';

interface Domain {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  status: 'active' | 'inactive' | 'maintenance';
  vlans: VLAN[];
  statistics: {
    totalVLANs: number;
    totalIPs: number;
    usedIPs: number;
    utilization: number;
  };
}

interface VLAN {
  id: string;
  vlanId: number;
  name: string;
  subnet: string;
  gateway: string;
  mask: string;
  securityLevel: string;
  status: 'active' | 'inactive' | 'warning' | 'error';
  deviceCount: number;
  utilization: number;
  lastModified: string;
}

interface VLANFormData {
  vlanId: number;
  name: string;
  subnet: string;
  gateway: string;
  mask: string;
  securityLevel: string;
  domainId: string;
}

interface DomainFormData {
  name: string;
  code: string;
  description: string;
  color: string;
}

const DomainVLANPanel: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ type: 'domain' | 'vlan'; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVLANForm, setShowVLANForm] = useState(false);
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [vlanFormData, setVlanFormData] = useState<VLANFormData>({
    vlanId: 100,
    name: '',
    subnet: '',
    gateway: '',
    mask: '255.255.255.0',
    securityLevel: 'MFZ_SL4',
    domainId: '',
  });
  const [domainFormData, setDomainFormData] = useState<DomainFormData>({
    name: '',
    code: '',
    description: '',
    color: 'blue',
  });

  // Mock data
  useEffect(() => {
    const mockDomains: Domain[] = [
      {
        id: 'mfg',
        name: 'Manufacturing',
        code: 'MFG',
        description: 'Production lines and manufacturing equipment',
        color: 'blue',
        status: 'active',
        statistics: { totalVLANs: 5, totalIPs: 1240, usedIPs: 892, utilization: 72 },
        vlans: [
          {
            id: 'vlan-100',
            vlanId: 100,
            name: 'Production Line A2',
            subnet: '192.168.100.0/24',
            gateway: '192.168.100.1',
            mask: '255.255.255.0',
            securityLevel: 'MFZ_SL4',
            status: 'active',
            deviceCount: 45,
            utilization: 68,
            lastModified: new Date().toISOString(),
          },
          {
            id: 'vlan-101',
            vlanId: 101,
            name: 'Production Line A4',
            subnet: '192.168.101.0/24',
            gateway: '192.168.101.1',
            mask: '255.255.255.0',
            securityLevel: 'MFZ_SL4',
            status: 'warning',
            deviceCount: 52,
            utilization: 89,
            lastModified: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'log',
        name: 'Logistics',
        code: 'LOG',
        description: 'Warehouse and logistics operations',
        color: 'green',
        status: 'active',
        statistics: { totalVLANs: 2, totalIPs: 496, usedIPs: 234, utilization: 47 },
        vlans: [
          {
            id: 'vlan-200',
            vlanId: 200,
            name: 'Warehouse LOG21',
            subnet: '192.168.200.0/24',
            gateway: '192.168.200.1',
            mask: '255.255.255.0',
            securityLevel: 'LOG_SL4',
            status: 'active',
            deviceCount: 28,
            utilization: 45,
            lastModified: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'fcm',
        name: 'Facility Management',
        code: 'FCM',
        description: 'Building systems and facility equipment',
        color: 'purple',
        status: 'active',
        statistics: { totalVLANs: 3, totalIPs: 744, usedIPs: 445, utilization: 60 },
        vlans: [
          {
            id: 'vlan-300',
            vlanId: 300,
            name: 'Security Systems',
            subnet: '192.168.300.0/24',
            gateway: '192.168.300.1',
            mask: '255.255.255.0',
            securityLevel: 'FMZ_SL4',
            status: 'error',
            deviceCount: 15,
            utilization: 95,
            lastModified: new Date().toISOString(),
          },
        ],
      },
    ];

    setTimeout(() => {
      setDomains(mockDomains);
      setLoading(false);
    }, 800);
  }, []);

  const toggleDomainExpansion = (domainId: string) => {
    setExpandedDomains(prev => 
      prev.includes(domainId) 
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'SL3': return 'bg-blue-100 text-blue-800';
      case 'MFZ_SL4': return 'bg-green-100 text-green-800';
      case 'LOG_SL4': return 'bg-purple-100 text-purple-800';
      case 'FMZ_SL4': return 'bg-yellow-100 text-yellow-800';
      case 'ENG_SL4': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDomainColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      case 'orange': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCreateVLAN = (domainId?: string) => {
    setVlanFormData(prev => ({ ...prev, domainId: domainId || '' }));
    setShowVLANForm(true);
  };

  const handleCreateDomain = () => {
    setShowDomainForm(true);
  };

  const handleVLANSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate VLAN creation
    const newVLAN: VLAN = {
      id: `vlan-${Date.now()}`,
      vlanId: vlanFormData.vlanId,
      name: vlanFormData.name,
      subnet: vlanFormData.subnet,
      gateway: vlanFormData.gateway,
      mask: vlanFormData.mask,
      securityLevel: vlanFormData.securityLevel,
      status: 'active',
      deviceCount: 0,
      utilization: 0,
      lastModified: new Date().toISOString(),
    };

    // Add VLAN to the selected domain
    setDomains(prev => prev.map(domain => 
      domain.id === vlanFormData.domainId 
        ? { ...domain, vlans: [...domain.vlans, newVLAN] }
        : domain
    ));

    // Reset form and close modal
    setVlanFormData({
      vlanId: 100,
      name: '',
      subnet: '',
      gateway: '',
      mask: '255.255.255.0',
      securityLevel: 'MFZ_SL4',
      domainId: '',
    });
    setShowVLANForm(false);
  };

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate domain creation
    const newDomain: Domain = {
      id: `domain-${Date.now()}`,
      name: domainFormData.name,
      code: domainFormData.code,
      description: domainFormData.description,
      color: domainFormData.color,
      status: 'active',
      statistics: { totalVLANs: 0, totalIPs: 0, usedIPs: 0, utilization: 0 },
      vlans: [],
    };

    setDomains(prev => [...prev, newDomain]);

    // Reset form and close modal
    setDomainFormData({
      name: '',
      code: '',
      description: '',
      color: 'blue',
    });
    setShowDomainForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Domain & VLAN Configuration</h2>
          <p className="text-gray-600">Manage business domains and network segmentation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleCreateVLAN()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ServerIcon className="h-4 w-4 mr-2" />
            Add VLAN
          </button>
          <button
            onClick={handleCreateDomain}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Domain
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Domain Tree */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Domain Hierarchy</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading domains...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {domains.map((domain) => (
                    <div key={domain.id} className="border border-gray-200 rounded-lg">
                      {/* Domain Header */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleDomainExpansion(domain.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              {expandedDomains.includes(domain.id) ? (
                                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className={cn('h-3 w-3 rounded-full', getDomainColor(domain.color))}></div>
                            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{domain.name}</span>
                                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {domain.code}
                                </span>
                                <span className={cn(
                                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                  getStatusColor(domain.status)
                                )}>
                                  {domain.status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">{domain.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {domain.statistics.utilization}% utilized
                              </div>
                              <div className="text-xs text-gray-500">
                                {domain.statistics.usedIPs}/{domain.statistics.totalIPs} IPs
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button 
                                className="p-1 text-gray-400 hover:text-gray-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Edit domain:', domain.name);
                                }}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <CogIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* VLAN List */}
                      {expandedDomains.includes(domain.id) && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="p-4">
                            <div className="space-y-3">
                              {domain.vlans.map((vlan) => (
                                <div 
                                  key={vlan.id}
                                  className={cn(
                                    'p-3 bg-white border rounded-lg cursor-pointer hover:shadow-sm',
                                    selectedItem?.type === 'vlan' && selectedItem?.id === vlan.id
                                      ? 'border-blue-300 bg-blue-50'
                                      : 'border-gray-200'
                                  )}
                                  onClick={() => setSelectedItem({ type: 'vlan', id: vlan.id })}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <ServerIcon className="h-4 w-4 text-gray-400" />
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium text-gray-900">VLAN {vlan.vlanId}</span>
                                          <span className="text-sm text-gray-500">- {vlan.name}</span>
                                          <span className={cn(
                                            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                                            getSecurityLevelColor(vlan.securityLevel)
                                          )}>
                                            {vlan.securityLevel}
                                          </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {vlan.subnet} • {vlan.deviceCount} devices
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className="text-right">
                                        <div className={cn(
                                          'text-sm font-medium',
                                          vlan.status === 'active' ? 'text-green-600' :
                                          vlan.status === 'warning' ? 'text-yellow-600' :
                                          vlan.status === 'error' ? 'text-red-600' : 'text-gray-600'
                                        )}>
                                          {vlan.utilization}%
                                        </div>
                                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                          <div
                                            className={cn(
                                              'h-1.5 rounded-full',
                                              vlan.utilization > 85 ? 'bg-red-500' :
                                              vlan.utilization > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                            )}
                                            style={{ width: `${Math.min(vlan.utilization, 100)}%` }}
                                          />
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <button 
                                          className="p-1 text-gray-400 hover:text-gray-600"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('Edit VLAN:', vlan.name);
                                          }}
                                        >
                                          <PencilIcon className="h-3 w-3" />
                                        </button>
                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                          <EyeIcon className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <button
                                onClick={() => handleCreateVLAN(domain.id)}
                                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
                              >
                                <PlusIcon className="h-4 w-4 mx-auto mb-1" />
                                <div className="text-sm">Add VLAN to {domain.name}</div>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Network Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Domains</span>
                <span className="text-sm font-medium text-gray-900">{domains.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total VLANs</span>
                <span className="text-sm font-medium text-gray-900">
                  {domains.reduce((sum, d) => sum + d.statistics.totalVLANs, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">IP Utilization</span>
                <span className="text-sm font-medium text-gray-900">
                  {domains.length > 0 
                    ? Math.round(domains.reduce((sum, d) => sum + d.statistics.utilization, 0) / domains.length)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Devices</span>
                <span className="text-sm font-medium text-gray-900">
                  {domains.reduce((sum, d) => sum + d.statistics.usedIPs, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Security Levels */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Levels</h3>
            <div className="space-y-3">
              {['SL3', 'MFZ_SL4', 'LOG_SL4', 'FMZ_SL4', 'ENG_SL4'].map((level) => (
                <div key={level} className="flex items-center justify-between">
                  <span className={cn(
                    'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                    getSecurityLevelColor(level)
                  )}>
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    {level}
                  </span>
                  <span className="text-sm text-gray-600">
                    {domains.flatMap(d => d.vlans).filter(v => v.securityLevel === level).length} VLANs
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <ArrowPathIcon className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Refresh Network Scan</div>
                    <div className="text-xs text-gray-500">Update device discovery</div>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Check Conflicts</div>
                    <div className="text-xs text-gray-500">Validate IP assignments</div>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Validate Configuration</div>
                    <div className="text-xs text-gray-500">Check network integrity</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* VLAN Creation Modal */}
        {showVLANForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni VLAN Oluştur</h3>
                <form onSubmit={handleVLANSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Domain</label>
                    <select
                      value={vlanFormData.domainId}
                      onChange={(e) => setVlanFormData(prev => ({ ...prev, domainId: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Domain Seçin</option>
                      {domains.map(domain => (
                        <option key={domain.id} value={domain.id}>{domain.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">VLAN ID</label>
                    <input
                      type="number"
                      value={vlanFormData.vlanId}
                      onChange={(e) => setVlanFormData(prev => ({ ...prev, vlanId: parseInt(e.target.value) }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="1"
                      max="4094"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">VLAN Adı</label>
                    <input
                      type="text"
                      value={vlanFormData.name}
                      onChange={(e) => setVlanFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Örn: Production Line A2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subnet</label>
                    <input
                      type="text"
                      value={vlanFormData.subnet}
                      onChange={(e) => setVlanFormData(prev => ({ ...prev, subnet: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="192.168.100.0/24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gateway</label>
                    <input
                      type="text"
                      value={vlanFormData.gateway}
                      onChange={(e) => setVlanFormData(prev => ({ ...prev, gateway: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="192.168.100.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Güvenlik Seviyesi</label>
                    <select
                      value={vlanFormData.securityLevel}
                      onChange={(e) => setVlanFormData(prev => ({ ...prev, securityLevel: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="SL3">SL3 - Secure BCN</option>
                      <option value="MFZ_SL4">MFZ_SL4 - Manufacturing Zone</option>
                      <option value="LOG_SL4">LOG_SL4 - Logistics Zone</option>
                      <option value="FMZ_SL4">FMZ_SL4 - Facility Zone</option>
                      <option value="ENG_SL4">ENG_SL4 - Engineering Zone</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowVLANForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      VLAN Oluştur
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Domain Creation Modal */}
        {showDomainForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Domain Oluştur</h3>
                <form onSubmit={handleDomainSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Domain Adı</label>
                    <input
                      type="text"
                      value={domainFormData.name}
                      onChange={(e) => setDomainFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Örn: Manufacturing"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Domain Kodu</label>
                    <input
                      type="text"
                      value={domainFormData.code}
                      onChange={(e) => setDomainFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="MFG"
                      maxLength={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                    <textarea
                      value={domainFormData.description}
                      onChange={(e) => setDomainFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Domain açıklaması..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Renk</label>
                    <select
                      value={domainFormData.color}
                      onChange={(e) => setDomainFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="blue">Mavi</option>
                      <option value="green">Yeşil</option>
                      <option value="purple">Mor</option>
                      <option value="orange">Turuncu</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowDomainForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      Domain Oluştur
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { DomainVLANPanel };