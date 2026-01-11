/**
 * System Configuration Page
 * Monitor backend services, database connectivity, and API health
 */

import React, { useState, useEffect } from 'react';
import {
  ServerIcon,
  CircleStackIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  ClockIcon,
  BellIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'maintenance';
  uptime: number;
  lastCheck: string;
  responseTime: number;
  version: string;
  description: string;
  dependencies: string[];
  metrics: {
    cpu: number;
    memory: number;
    requests: number;
    errors: number;
  };
}

interface DatabaseConnection {
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'slow';
  host: string;
  port: number;
  database: string;
  connectionPool: {
    active: number;
    idle: number;
    max: number;
  };
  performance: {
    avgQueryTime: number;
    slowQueries: number;
    totalQueries: number;
  };
}

interface APIEndpoint {
  path: string;
  method: string;
  status: 'healthy' | 'slow' | 'error';
  responseTime: number;
  successRate: number;
  lastError?: string;
  requestCount: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

const SystemConfiguration: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [databases, setDatabases] = useState<DatabaseConnection[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'database' | 'api' | 'alerts'>('services');

  // Mock data
  useEffect(() => {
    const mockServices: ServiceStatus[] = [
      {
        name: 'IP Management API',
        status: 'healthy',
        uptime: 99.8,
        lastCheck: new Date().toISOString(),
        responseTime: 45,
        version: '1.2.3',
        description: 'Core IP allocation and management service',
        dependencies: ['PostgreSQL', 'Redis Cache'],
        metrics: { cpu: 12, memory: 256, requests: 1247, errors: 2 },
      },
      {
        name: 'VLAN Configuration Service',
        status: 'healthy',
        uptime: 99.9,
        lastCheck: new Date().toISOString(),
        responseTime: 32,
        version: '1.1.8',
        description: 'Network segmentation and VLAN management',
        dependencies: ['PostgreSQL', 'Network Scanner'],
        metrics: { cpu: 8, memory: 128, requests: 892, errors: 0 },
      },
      {
        name: 'Device Discovery Service',
        status: 'warning',
        uptime: 97.2,
        lastCheck: new Date().toISOString(),
        responseTime: 156,
        version: '2.0.1',
        description: 'Automatic device detection and classification',
        dependencies: ['SNMP Agent', 'Network Scanner'],
        metrics: { cpu: 25, memory: 512, requests: 445, errors: 12 },
      },
      {
        name: 'Authentication Service',
        status: 'healthy',
        uptime: 99.95,
        lastCheck: new Date().toISOString(),
        responseTime: 28,
        version: '3.1.2',
        description: 'User authentication and authorization',
        dependencies: ['LDAP Server', 'Redis Cache'],
        metrics: { cpu: 5, memory: 64, requests: 2341, errors: 1 },
      },
    ];

    const mockDatabases: DatabaseConnection[] = [
      {
        name: 'Primary Database',
        type: 'PostgreSQL',
        status: 'connected',
        host: 'db-primary.local',
        port: 5432,
        database: 'ip_management',
        connectionPool: { active: 8, idle: 12, max: 20 },
        performance: { avgQueryTime: 15, slowQueries: 3, totalQueries: 15420 },
      },
      {
        name: 'Cache Database',
        type: 'Redis',
        status: 'connected',
        host: 'cache.local',
        port: 6379,
        database: 'cache',
        connectionPool: { active: 4, idle: 6, max: 10 },
        performance: { avgQueryTime: 2, slowQueries: 0, totalQueries: 8934 },
      },
      {
        name: 'Analytics Database',
        type: 'InfluxDB',
        status: 'slow',
        host: 'metrics.local',
        port: 8086,
        database: 'metrics',
        connectionPool: { active: 2, idle: 3, max: 5 },
        performance: { avgQueryTime: 89, slowQueries: 15, totalQueries: 2341 },
      },
    ];

    const mockApiEndpoints: APIEndpoint[] = [
      {
        path: '/api/domains',
        method: 'GET',
        status: 'healthy',
        responseTime: 45,
        successRate: 99.8,
        requestCount: 1247,
      },
      {
        path: '/api/vlans',
        method: 'GET',
        status: 'healthy',
        responseTime: 32,
        successRate: 99.9,
        requestCount: 892,
      },
      {
        path: '/api/ip-assignments',
        method: 'POST',
        status: 'slow',
        responseTime: 234,
        successRate: 97.2,
        requestCount: 445,
        lastError: 'Timeout after 30s',
      },
      {
        path: '/api/devices/scan',
        method: 'POST',
        status: 'error',
        responseTime: 0,
        successRate: 85.4,
        requestCount: 156,
        lastError: 'Network scanner unavailable',
      },
    ];

    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Response Time',
        message: 'Device Discovery Service response time above threshold (156ms)',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        acknowledged: false,
      },
      {
        id: '2',
        type: 'error',
        title: 'API Endpoint Failure',
        message: 'Device scan endpoint returning errors (85.4% success rate)',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        acknowledged: false,
      },
      {
        id: '3',
        type: 'info',
        title: 'Scheduled Maintenance',
        message: 'Database maintenance window scheduled for tonight 02:00-04:00',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        acknowledged: true,
      },
    ];

    setTimeout(() => {
      setServices(mockServices);
      setDatabases(mockDatabases);
      setApiEndpoints(mockApiEndpoints);
      setAlerts(mockAlerts);
      setLoading(false);
    }, 1000);
  }, []);

  const refreshStatus = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return CheckCircleIcon;
      case 'warning':
      case 'slow':
        return ExclamationTriangleIcon;
      case 'error':
      case 'disconnected':
        return XCircleIcon;
      case 'maintenance':
        return ClockIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'slow':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-600">Monitor system health and configuration status</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshStatus}
            disabled={refreshing}
            className={cn(
              'inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50',
              refreshing && 'opacity-50 cursor-not-allowed'
            )}
          >
            <ArrowPathIcon className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            Refresh Status
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            System Settings
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ServerIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Services</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {services.filter(s => s.status === 'healthy').length}/{services.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CircleStackIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Databases</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {databases.filter(d => d.status === 'connected').length}/{databases.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GlobeAltIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">API Health</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Math.round(apiEndpoints.reduce((sum, api) => sum + api.successRate, 0) / apiEndpoints.length)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BellIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Alerts</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {alerts.filter(a => !a.acknowledged).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'services', label: 'Services', icon: ServerIcon },
              { key: 'database', label: 'Database', icon: CircleStackIcon },
              { key: 'api', label: 'API Endpoints', icon: GlobeAltIcon },
              { key: 'alerts', label: 'System Alerts', icon: BellIcon },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm flex items-center',
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading system status...</span>
            </div>
          ) : (
            <>
              {/* Services Tab */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  {services.map((service) => {
                    const StatusIcon = getStatusIcon(service.status);
                    return (
                      <div key={service.name} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <StatusIcon className={cn(
                              'h-6 w-6 mr-3',
                              service.status === 'healthy' ? 'text-green-500' :
                              service.status === 'warning' ? 'text-yellow-500' :
                              service.status === 'error' ? 'text-red-500' : 'text-blue-500'
                            )} />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                              <p className="text-sm text-gray-500">{service.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              getStatusColor(service.status)
                            )}>
                              {service.status}
                            </span>
                            <span className="text-sm text-gray-500">v{service.version}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{service.uptime}%</div>
                            <div className="text-xs text-gray-500">Uptime</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{service.responseTime}ms</div>
                            <div className="text-xs text-gray-500">Response Time</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{service.metrics.requests}</div>
                            <div className="text-xs text-gray-500">Requests/hr</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{service.metrics.errors}</div>
                            <div className="text-xs text-gray-500">Errors</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Resource Usage</div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">CPU</span>
                                <span className="text-sm font-medium">{service.metrics.cpu}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${service.metrics.cpu}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Memory</span>
                                <span className="text-sm font-medium">{service.metrics.memory}MB</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Dependencies</div>
                            <div className="space-y-1">
                              {service.dependencies.map((dep) => (
                                <div key={dep} className="flex items-center">
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                  <span className="text-sm text-gray-600">{dep}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Database Tab */}
              {activeTab === 'database' && (
                <div className="space-y-4">
                  {databases.map((db) => {
                    const StatusIcon = getStatusIcon(db.status);
                    return (
                      <div key={db.name} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <StatusIcon className={cn(
                              'h-6 w-6 mr-3',
                              db.status === 'connected' ? 'text-green-500' :
                              db.status === 'slow' ? 'text-yellow-500' : 'text-red-500'
                            )} />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{db.name}</h3>
                              <p className="text-sm text-gray-500">{db.type} • {db.host}:{db.port}</p>
                            </div>
                          </div>
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            getStatusColor(db.status)
                          )}>
                            {db.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Connection Pool</div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Active</span>
                                <span className="text-sm font-medium">{db.connectionPool.active}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Idle</span>
                                <span className="text-sm font-medium">{db.connectionPool.idle}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Max</span>
                                <span className="text-sm font-medium">{db.connectionPool.max}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Performance</div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Avg Query Time</span>
                                <span className="text-sm font-medium">{db.performance.avgQueryTime}ms</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Slow Queries</span>
                                <span className="text-sm font-medium">{db.performance.slowQueries}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Queries</span>
                                <span className="text-sm font-medium">{db.performance.totalQueries.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Connection Usage</div>
                            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                              <div
                                className="bg-blue-600 h-4 rounded-full"
                                style={{ width: `${(db.connectionPool.active / db.connectionPool.max) * 100}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              {Math.round((db.connectionPool.active / db.connectionPool.max) * 100)}% utilized
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* API Endpoints Tab */}
              {activeTab === 'api' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Endpoint
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Response Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Success Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requests
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Error
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {apiEndpoints.map((endpoint) => {
                        const StatusIcon = getStatusIcon(endpoint.status);
                        return (
                          <tr key={`${endpoint.method}-${endpoint.path}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={cn(
                                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2',
                                  endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                                  endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                                  endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                )}>
                                  {endpoint.method}
                                </span>
                                <span className="font-mono text-sm">{endpoint.path}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                getStatusColor(endpoint.status)
                              )}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {endpoint.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {endpoint.responseTime}ms
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className={cn(
                                      'h-2 rounded-full',
                                      endpoint.successRate > 95 ? 'bg-green-500' :
                                      endpoint.successRate > 90 ? 'bg-yellow-500' : 'bg-red-500'
                                    )}
                                    style={{ width: `${endpoint.successRate}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-900">{endpoint.successRate}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {endpoint.requestCount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {endpoint.lastError || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Alerts Tab */}
              {activeTab === 'alerts' && (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        'border rounded-lg p-4',
                        alert.acknowledged ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50',
                        alert.type === 'warning' && !alert.acknowledged && 'border-yellow-200 bg-yellow-50',
                        alert.type === 'info' && 'border-blue-200 bg-blue-50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className={cn(
                            'flex-shrink-0 h-5 w-5 mt-0.5 mr-3',
                            alert.type === 'error' ? 'text-red-500' :
                            alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                          )}>
                            {alert.type === 'error' && <XCircleIcon className="h-5 w-5" />}
                            {alert.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5" />}
                            {alert.type === 'info' && <InformationCircleIcon className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { SystemConfiguration };