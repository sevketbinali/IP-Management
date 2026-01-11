/**
 * Enhanced Analytics & Reports Section
 * Comprehensive analytics with charts, metrics, and export capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

interface ComplianceMetric {
  domain: string;
  securityLevel: string;
  compliant: number;
  total: number;
  issues: string[];
}

const EnhancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  // Mock data
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [utilizationData, setUtilizationData] = useState<ChartData | null>(null);
  const [deviceGrowthData, setDeviceGrowthData] = useState<ChartData | null>(null);
  const [complianceData, setComplianceData] = useState<ComplianceMetric[]>([]);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      const mockMetrics: MetricCard[] = [
        {
          title: 'IP Utilization',
          value: '72%',
          change: 5.2,
          trend: 'up',
          icon: ChartBarIcon,
          color: 'blue',
        },
        {
          title: 'Active Devices',
          value: 1247,
          change: 12.3,
          trend: 'up',
          icon: CheckCircleIcon,
          color: 'green',
        },
        {
          title: 'Network Segments',
          value: 24,
          change: 0,
          trend: 'stable',
          icon: DocumentChartBarIcon,
          color: 'purple',
        },
        {
          title: 'Compliance Score',
          value: '94%',
          change: -2.1,
          trend: 'down',
          icon: ExclamationTriangleIcon,
          color: 'yellow',
        },
        {
          title: 'Response Time',
          value: '45ms',
          change: -8.7,
          trend: 'down',
          icon: ClockIcon,
          color: 'indigo',
        },
        {
          title: 'Conflicts Resolved',
          value: 156,
          change: 23.4,
          trend: 'up',
          icon: CheckCircleIcon,
          color: 'emerald',
        },
      ];

      const mockUtilizationData: ChartData = {
        labels: ['Manufacturing', 'Logistics', 'Facility', 'Engineering', 'Security'],
        datasets: [
          {
            label: 'IP Utilization %',
            data: [78, 45, 89, 32, 67],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
          },
        ],
      };

      const mockDeviceGrowthData: ChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'New Devices',
            data: [45, 52, 38, 67, 73, 89, 94],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
          },
          {
            label: 'Decommissioned',
            data: [12, 8, 15, 23, 18, 25, 19],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
          },
        ],
      };

      const mockComplianceData: ComplianceMetric[] = [
        {
          domain: 'Manufacturing',
          securityLevel: 'MFZ_SL4',
          compliant: 45,
          total: 48,
          issues: ['Outdated firmware on 3 devices'],
        },
        {
          domain: 'Logistics',
          securityLevel: 'LOG_SL4',
          compliant: 28,
          total: 28,
          issues: [],
        },
        {
          domain: 'Facility',
          securityLevel: 'FMZ_SL4',
          compliant: 12,
          total: 15,
          issues: ['Missing security certificates', 'Unauthorized device detected'],
        },
        {
          domain: 'Engineering',
          securityLevel: 'ENG_SL4',
          compliant: 18,
          total: 20,
          issues: ['Test devices in production network'],
        },
      ];

      setMetrics(mockMetrics);
      setUtilizationData(mockUtilizationData);
      setDeviceGrowthData(mockDeviceGrowthData);
      setComplianceData(mockComplianceData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const exportReport = (type: 'pdf' | 'csv' | 'excel') => {
    console.log(`Exporting ${type} report for ${timeRange}`);
    // Implementation would generate and download the report
  };

  const getMetricColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      indigo: 'bg-indigo-500',
      emerald: 'bg-emerald-500',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowTrendingUpIcon;
      case 'down': return ArrowTrendingDownIcon;
      default: return ClockIcon;
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'stable') return 'text-gray-500';
    if (trend === 'up') return change > 0 ? 'text-green-500' : 'text-red-500';
    if (trend === 'down') return change < 0 ? 'text-green-500' : 'text-red-500';
    return 'text-gray-500';
  };

  // Simple bar chart component (in production, use a proper charting library)
  const BarChart: React.FC<{ data: ChartData; height?: number }> = ({ data, height = 200 }) => {
    if (!data.datasets[0] || data.datasets[0].data.length === 0) return null;
    
    const maxValue = Math.max(...data.datasets[0].data);
    
    return (
      <div className="space-y-4">
        <div className="flex items-end justify-between" style={{ height: `${height}px` }}>
          {data.labels.map((label, index) => {
            const value = data.datasets[0]?.data[index];
            if (value === undefined) return null;
            
            const barHeight = (value / maxValue) * (height - 40);
            const backgroundColor = Array.isArray(data.datasets[0]?.backgroundColor) 
              ? (data.datasets[0].backgroundColor as string[])[index] 
              : (data.datasets[0]?.backgroundColor as string) || 'rgba(59, 130, 246, 0.8)';
            
            return (
              <div key={label} className="flex flex-col items-center space-y-2">
                <div className="text-xs font-medium text-gray-700">{value}%</div>
                <div
                  className="w-12 rounded-t"
                  style={{ 
                    height: `${barHeight}px`,
                    backgroundColor,
                  }}
                />
                <div className="text-xs text-gray-500 text-center max-w-16 truncate">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Simple line chart component
  const LineChart: React.FC<{ data: ChartData; height?: number }> = ({ data, height = 200 }) => {
    return (
      <div className="space-y-4">
        <div className="relative" style={{ height: `${height}px` }}>
          <svg width="100%" height="100%" className="overflow-visible">
            {data.datasets.map((dataset, datasetIndex) => {
              const maxValue = Math.max(...dataset.data);
              const points = dataset.data.map((value, index) => {
                const x = (index / (dataset.data.length - 1)) * 100;
                const y = 100 - (value / maxValue) * 80;
                return `${x},${y}`;
              }).join(' ');

              return (
                <g key={datasetIndex}>
                  <polyline
                    fill="none"
                    stroke={dataset.borderColor}
                    strokeWidth="2"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                  />
                  {dataset.data.map((value, index) => {
                    const x = (index / (dataset.data.length - 1)) * 100;
                    const y = 100 - (value / maxValue) * 80;
                    return (
                      <circle
                        key={index}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="3"
                        fill={dataset.borderColor}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          {data.labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="flex space-x-4">
          {data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: dataset.borderColor }}
              />
              <span className="text-sm text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-600">Network performance metrics and compliance analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => exportReport('csv')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              CSV
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const TrendIcon = getTrendIcon(metric.trend);
          return (
            <div key={metric.title} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={cn('h-8 w-8 rounded-md flex items-center justify-center', getMetricColor(metric.color))}>
                      <metric.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{metric.title}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
                        <div className={cn('ml-2 flex items-baseline text-sm font-semibold', getTrendColor(metric.trend, metric.change))}>
                          <TrendIcon className="h-4 w-4 mr-1" />
                          {Math.abs(metric.change)}%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IP Utilization Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">IP Utilization by Domain</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : utilizationData ? (
            <BarChart data={utilizationData} height={240} />
          ) : null}
        </div>

        {/* Device Growth Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Device Growth Trend</h3>
            <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : deviceGrowthData ? (
            <LineChart data={deviceGrowthData} height={240} />
          ) : null}
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Security Compliance by Domain</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Security Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complianceData.map((item) => {
                const complianceRate = (item.compliant / item.total) * 100;
                return (
                  <tr key={item.domain} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.domain}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.securityLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={cn(
                              'h-2 rounded-full',
                              complianceRate >= 95 ? 'bg-green-500' :
                              complianceRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            )}
                            style={{ width: `${complianceRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">
                          {item.compliant}/{item.total} ({Math.round(complianceRate)}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {item.issues.length === 0 ? (
                          <span className="text-green-600">No issues</span>
                        ) : (
                          <ul className="list-disc list-inside space-y-1">
                            {item.issues.map((issue, index) => (
                              <li key={index} className="text-red-600">{issue}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        complianceRate >= 95 ? 'bg-green-100 text-green-800' :
                        complianceRate >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      )}>
                        {complianceRate >= 95 ? (
                          <>
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Compliant
                          </>
                        ) : complianceRate >= 80 ? (
                          <>
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Warning
                          </>
                        ) : (
                          <>
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Non-compliant
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Network Health Score</p>
              <p className="text-3xl font-bold">87%</p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-blue-200" />
          </div>
          <p className="text-blue-100 text-sm mt-2">Based on utilization, performance, and compliance metrics</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Automation Rate</p>
              <p className="text-3xl font-bold">94%</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-200" />
          </div>
          <p className="text-green-100 text-sm mt-2">IP assignments handled automatically</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Cost Savings</p>
              <p className="text-3xl font-bold">€12.4K</p>
            </div>
            <ArrowTrendingDownIcon className="h-12 w-12 text-purple-200" />
          </div>
          <p className="text-purple-100 text-sm mt-2">Monthly operational cost reduction</p>
        </div>
      </div>
    </div>
  );
};

export { EnhancedAnalytics };