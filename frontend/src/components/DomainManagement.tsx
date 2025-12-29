/**
 * Domain Management Component
 * Comprehensive domain CRUD operations with industrial-grade UX
 */

import React, { useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useDomainStore } from '@/stores/useDomainStore';
import { Domain, DomainType, TableColumn } from '@/types';
import { Button, Input, Table, Modal, Select, Badge } from '@/components/ui';
import { formatDateTime, getSecurityLevelColor } from '@/utils';
import { DomainForm } from './DomainForm';
import toast from 'react-hot-toast';

const DomainManagement: React.FC = () => {
  const navigate = useNavigate();
  const {
    domains,
    selectedDomain,
    loading,
    error,
    pagination,
    filters,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    fetchDomains,
    deleteDomain,
    selectDomain,
    setFilters,
    setPagination,
    setShowCreateModal,
    setShowEditModal,
    setShowDeleteModal,
    clearError,
  } = useDomainStore();

  // Fetch domains on component mount
  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSearch = (value: string): void => {
    setFilters({ search: value });
  };

  const handleSort = (sortBy: string): void => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters({ sortBy, sortOrder: newSortOrder });
  };

  const handleEdit = (domain: Domain): void => {
    selectDomain(domain);
    setShowEditModal(true);
  };

  const handleDelete = (domain: Domain): void => {
    selectDomain(domain);
    setShowDeleteModal(true);
  };

  const handleView = (domain: Domain): void => {
    navigate(`/domains/${domain.id}`);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedDomain) {
      await deleteDomain(selectedDomain.id);
    }
  };

  const getDomainTypeColor = (type: DomainType): string => {
    if (!type) return 'bg-secondary-100 text-secondary-800';
    switch (type) {
      case DomainType.MFG:
        return 'bg-success-100 text-success-800';
      case DomainType.LOG:
        return 'bg-warning-100 text-warning-800';
      case DomainType.FCM:
        return 'bg-primary-100 text-primary-800';
      case DomainType.ENG:
        return 'bg-secondary-100 text-secondary-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getDomainDescription = (type: DomainType): string => {
    if (!type) return 'Unknown domain type';
    switch (type) {
      case DomainType.MFG:
        return 'Manufacturing (A2, A4, A6, A10, MCO)';
      case DomainType.LOG:
        return 'Logistics (LOG21)';
      case DomainType.FCM:
        return 'Facility Management (Analyzers, Cameras, Building Systems)';
      case DomainType.ENG:
        return 'Engineering (Test Benches)';
      default:
        return 'Unknown domain type';
    }
  };

  const columns: TableColumn<Domain>[] = [
    {
      key: 'name',
      title: 'Domain Type',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center space-x-3">
          <Badge className={getDomainTypeColor(record.name)}>
            {record.name}
          </Badge>
          <div>
            <div className="font-medium text-secondary-900">{record.name}</div>
            <div className="text-sm text-secondary-500">
              {getDomainDescription(record.name)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <div className="max-w-xs truncate text-secondary-900" title={String(value)}>
          {String(value)}
        </div>
      ),
    },
    {
      key: 'valueStreamCount',
      title: 'Value Streams',
      sortable: true,
      render: (value) => (
        <Badge variant="outline" size="sm">
          {String(value)} streams
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-secondary-600">
          {formatDateTime(String(value))}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      title: 'Last Updated',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-secondary-600">
          {formatDateTime(String(value))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Domain Management</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage business domains for IT/OT network segmentation across manufacturing, 
            logistics, facility, and engineering operations.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          leftIcon={<PlusIcon className="h-4 w-4" />}
        >
          Add Domain
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search domains..."
            value={filters.search || ''}
            onChange={handleSearch}
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
          />
        </div>
        <Select
          value={filters.sortBy || 'name'}
          onChange={(value) => setFilters({ sortBy: value })}
          options={[
            { value: 'name', label: 'Sort by Name' },
            { value: 'valueStreamCount', label: 'Sort by Value Streams' },
            { value: 'createdAt', label: 'Sort by Created Date' },
            { value: 'updatedAt', label: 'Sort by Updated Date' },
          ]}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-error-50 border border-error-200 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-error-800">Error</h3>
              <div className="mt-2 text-sm text-error-700">{error}</div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearError}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Domains Table */}
      <Table
        data={domains}
        columns={columns}
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => setPagination({ page, pageSize }),
        }}
        actions={{
          onEdit: handleEdit,
          onDelete: handleDelete,
          onView: handleView,
        }}
      />

      {/* Create Domain Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Domain"
        description="Add a new business domain for network organization"
        size="md"
      >
        <DomainForm
          onCancel={() => setShowCreateModal(false)}
          mode="create"
        />
      </Modal>

      {/* Edit Domain Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Domain"
        description="Update domain information"
        size="md"
      >
        {selectedDomain && (
          <DomainForm
            domain={selectedDomain}
            onCancel={() => setShowEditModal(false)}
            mode="edit"
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Domain"
        description="This action cannot be undone"
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-md bg-warning-50 border border-warning-200 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-warning-800">
                  Are you sure you want to delete this domain?
                </h3>
                <div className="mt-2 text-sm text-warning-700">
                  {selectedDomain && (
                    <>
                      Domain <strong>{selectedDomain.name}</strong> and all its associated 
                      value streams, zones, and VLANs will be permanently deleted.
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={confirmDelete}
              loading={loading}
            >
              Delete Domain
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { DomainManagement };