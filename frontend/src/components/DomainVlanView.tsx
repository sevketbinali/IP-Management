/**
 * Domain VLAN View - Hierarchical Navigation System
 * Modern interface for Domain → VLAN → IP Configuration workflow
 * Implements progressive disclosure with avant-garde design principles
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  ServerIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Button, Badge, Dialog, Input } from '@/components/ui';
import { useDomainStore } from '@/stores/useDomainStore';
import { useVlanStore } from '@/stores/useVLANStore';
import { VlanCreateModal } from './VlanCreateModal';
import { IpConfigurationModal } from './IpConfigurationModal';
import { formatDateTime } from '@/utils';

interface VlanCardProps {
  vlan: any;
  onSelect: (vlan: any) => void;
  onConfigure: (vlan: any) => void;
}

const VlanCard: React.FC<VlanCardProps> = ({ vlan, onSelect, onConfigure }) => {
  const getStatusColor = (status: string) => {
    if (!status) return 'secondary';
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'secondary';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-error-600';
    if (utilization >= 75) return 'text-warning-600';
    return 'text-success-600';
  };

  return (
    <div className="group relative bg-white rounded-xl border border-secondary-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Status Indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-${getStatusColor(vlan.status)}-500`} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <ServerIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors">
                VLAN {vlan.vlanId}
              </h3>
              <p className="text-sm text-secondary-600">{vlan.name}</p>
            </div>
          </div>
          <Badge variant={getStatusColor(vlan.status)} size="sm">
            {vlan.status ? vlan.status.toUpperCase() : 'UNKNOWN'}
          </Badge>
        </div>

        {/* Network Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary-600">Subnet</span>
            <span className="font-mono text-secondary-900">{vlan.subnet}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary-600">Gateway</span>
            <span className="font-mono text-secondary-900">{vlan.gateway}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary-600">Zone</span>
            <span className="text-secondary-900">{vlan.zoneName}</span>
          </div>
        </div>

        {/* Utilization Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-secondary-600">IP Utilization</span>
            <span className={`font-medium ${getUtilizationColor(vlan.utilization)}`}>
              {vlan.utilization}%
            </span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                vlan.utilization >= 90 ? 'bg-error-500' :
                vlan.utilization >= 75 ? 'bg-warning-500' : 'bg-success-500'
              }`}
              style={{ width: `${vlan.utilization}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
          <div className="flex items-center space-x-2 text-xs text-secondary-500">
            <CheckCircleIcon className="h-4 w-4" />
            <span>Last check: {formatDateTime(vlan.lastFirewallCheck)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(vlan)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GlobeAltIcon className="h-4 w-4 mr-1" />
              IPs
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onConfigure(vlan)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Cog6ToothIcon className="h-4 w-4 mr-1" />
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyVlanState: React.FC<{ onCreateVlan: () => void }> = ({ onCreateVlan }) => (
  <div className="text-center py-16">
    <div className="mx-auto w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mb-6">
      <ServerIcon className="h-12 w-12 text-secondary-400" />
    </div>
    <h3 className="text-lg font-medium text-secondary-900 mb-2">No VLANs configured</h3>
    <p className="text-secondary-600 mb-6 max-w-md mx-auto">
      This domain doesn't have any VLANs yet. Create your first VLAN to start managing network segmentation.
    </p>
    <Button onClick={onCreateVlan} leftIcon={<PlusIcon className="h-4 w-4" />}>
      Create First VLAN
    </Button>
  </div>
);

export const DomainVlanView: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const { domains, selectedDomain, selectDomain } = useDomainStore();
  const { vlans, fetchVlansByDomain, loading } = useVlanStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [selectedVlan, setSelectedVlan] = useState<any>(null);

  // Find and select domain
  useEffect(() => {
    if (domainId && domains.length > 0) {
      const domain = domains.find(d => d.id === domainId);
      if (domain) {
        selectDomain(domain);
        fetchVlansByDomain(domainId);
      } else {
        navigate('/domains');
      }
    }
  }, [domainId, domains, selectDomain, fetchVlansByDomain, navigate]);

  // Filter VLANs based on search
  const filteredVlans = vlans.filter(vlan =>
    vlan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vlan.vlanId.toString().includes(searchQuery) ||
    vlan.zoneName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVlanSelect = (vlan: any) => {
    setSelectedVlan(vlan);
    setShowIpModal(true);
  };

  const handleVlanConfigure = (vlan: any) => {
    // Navigate to VLAN configuration page
    navigate(`/domains/${domainId}/vlans/${vlan.id}/configure`);
  };

  if (!selectedDomain) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/domains')}
          leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
        >
          Domains
        </Button>
        <ChevronRightIcon className="h-4 w-4 text-secondary-400" />
        <span className="font-medium text-secondary-900">{selectedDomain.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            {selectedDomain.name} VLANs
          </h1>
          <p className="mt-1 text-sm text-secondary-600">
            Network segmentation for {selectedDomain.description}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <Input
              placeholder="Search VLANs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            New VLAN
          </Button>
        </div>
      </div>

      {/* Domain Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-secondary-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <ServerIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">Total VLANs</p>
              <p className="text-2xl font-bold text-secondary-900">{vlans.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-secondary-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">Active</p>
              <p className="text-2xl font-bold text-secondary-900">
                {vlans.filter(v => v.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-secondary-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning-100 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">High Utilization</p>
              <p className="text-2xl font-bold text-secondary-900">
                {vlans.filter(v => v.utilization >= 75).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-secondary-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <GlobeAltIcon className="h-5 w-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">Total IPs</p>
              <p className="text-2xl font-bold text-secondary-900">
                {vlans.reduce((sum, v) => sum + (v.totalIps || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VLAN Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filteredVlans.length === 0 ? (
        searchQuery ? (
          <div className="text-center py-16">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No VLANs found</h3>
            <p className="text-secondary-600">
              No VLANs match your search criteria. Try adjusting your search terms.
            </p>
          </div>
        ) : (
          <EmptyVlanState onCreateVlan={() => setShowCreateModal(true)} />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVlans.map((vlan) => (
            <VlanCard
              key={vlan.id}
              vlan={vlan}
              onSelect={handleVlanSelect}
              onConfigure={handleVlanConfigure}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <VlanCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        domainId={domainId!}
      />

      <IpConfigurationModal
        isOpen={showIpModal}
        onClose={() => {
          setShowIpModal(false);
          setSelectedVlan(null);
        }}
        vlan={selectedVlan}
      />
    </div>
  );
};