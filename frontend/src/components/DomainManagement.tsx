/**
 * Domain Management Component
 * Interface for managing domains and their value streams
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Layout } from './Layout';
import { useDomainStore } from '@/stores/useDomainStore';
import { cn, formatDateTime } from '@/utils';

const DomainManagement: React.FC = () => {
  const { 
    domains, 
    selectedDomain, 
    loading, 
    fetchDomains, 
    selectDomain 
  } = useDomainStore();

  const [searchTerm, setSearchTerm] = useState('');

  // Fetch domains on component mount
  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // Filter domains based on search term
  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Domain Yönetimi</h1>
            <p className="mt-2 text-gray-600">
              Üretim, lojistik, tesis ve mühendislik domainlerini yönetin
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => console.log('Create domain')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Yeni Domain
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Domain ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Domain Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Domainler yükleniyor...</span>
          </div>
        ) : filteredDomains.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'Domain bulunamadı' : 'Henüz domain oluşturulmamış'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Arama kriterlerinizi değiştirin.' : 'İlk domaininizi oluşturun.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => console.log('Create domain')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Domain Oluştur
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDomains.map((domain) => (
              <div
                key={domain.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {domain.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {domain.valueStreamCount} Value Stream
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => console.log('View domain:', domain.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => console.log('Edit domain:', domain.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => console.log('Delete domain:', domain.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {domain.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Oluşturulma: {formatDateTime(domain.createdAt)}
                    </div>
                    <Link
                      to={`/domains/${domain.id}`}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Detaylar
                      <ChevronRightIcon className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Domain Stats */}
                <div className="bg-gray-50 px-6 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Value Streams:</span>
                    <span className="font-medium text-gray-900">
                      {domain.valueStreamCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Domain Özeti</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {domains.length}
                </div>
                <div className="text-sm text-gray-500">Toplam Domain</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {domains.reduce((sum, domain) => sum + domain.valueStreamCount, 0)}
                </div>
                <div className="text-sm text-gray-500">Toplam Value Stream</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {domains.filter(d => d.name.includes('MFG')).length}
                </div>
                <div className="text-sm text-gray-500">Üretim Domainleri</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {domains.filter(d => d.name.includes('LOG')).length}
                </div>
                <div className="text-sm text-gray-500">Lojistik Domainleri</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export { DomainManagement };