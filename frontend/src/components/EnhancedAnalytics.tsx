/**
 * Enhanced Analytics & Reports Section
 * Comprehensive analytics with charts, metrics, and export capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  ServerIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  BuildingOffice2Icon,
  BeakerIcon,
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
    backgroundColor?: string | string[];
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
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [utilizationData, setUtilizationData] = useState<ChartData | null>(null);
  const [deviceGrowthData, setDeviceGrowthData] = useState<ChartData | null>(null);
  const [complianceData, setComplianceData] = useState<ComplianceMetric[]>([]);

  // Domain icon mapping
  const getDomainIcon = (domainCode: string) => {
    switch (domainCode?.toUpperCase()) {
      case 'MFG': return WrenchScrewdriverIcon;
      case 'LOG': return TruckIcon;
      case 'FCM': return BuildingOffice2Icon;
      case 'ENG': return BeakerIcon;
      default: return BuildingOfficeIcon;
    }
  };

  const getDomainColor = (domainCode: string) => {
    switch (domainCode?.toUpperCase()) {
      case 'MFG': return 'text-blue-600 bg-blue-100';
      case 'LOG': return 'text-green-600 bg-green-100';
      case 'FCM': return 'text-purple-600 bg-purple-100';
      case 'ENG': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDomainName = (domainCode: string) => {
    switch (domainCode?.toUpperCase()) {
      case 'MFG': return 'Manufacturing';
      case 'LOG': return 'Logistics';
      case 'FCM': return 'Facility';
      case 'ENG': return 'Engineering';
      default: return domainCode;
    }
  };

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      const mockMetrics: MetricCard[] = [
        {
          title: 'Aktif OT Cihazları',
          value: 1247,
          change: 12.3,
          trend: 'up',
          icon: CheckCircleIcon,
          color: 'green',
        },
        {
          title: 'Kayıtlı OT Cihazları',
          value: 1389,
          change: 5.2,
          trend: 'up',
          icon: ComputerDesktopIcon,
          color: 'blue',
        },
        {
          title: 'Aktif IP Adresleri',
          value: 892,
          change: 8.7,
          trend: 'up',
          icon: GlobeAltIcon,
          color: 'purple',
        },
        {
          title: 'Toplam Domain Sayısı',
          value: 4,
          change: 0,
          trend: 'stable',
          icon: BuildingOfficeIcon,
          color: 'indigo',
        },
        {
          title: 'Toplam VLAN Sayısı',
          value: 13,
          change: 15.4,
          trend: 'up',
          icon: ServerIcon,
          color: 'emerald',
        },
        {
          title: 'Bilinmeyen Cihazlar',
          value: 142,
          change: -23.4,
          trend: 'down',
          icon: ExclamationTriangleIcon,
          color: 'yellow',
        },
      ];

      const mockUtilizationData: ChartData = {
        labels: ['MFG', 'LOG', 'FCM', 'ENG', 'SL3'],
        datasets: [
          {
            label: 'IP Kullanım %',
            data: [78, 45, 89, 32, 67],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',   // MFG - Blue
              'rgba(16, 185, 129, 0.8)',   // LOG - Green  
              'rgba(139, 92, 246, 0.8)',   // FCM - Purple
              'rgba(245, 158, 11, 0.8)',   // ENG - Orange
              'rgba(107, 114, 128, 0.8)',  // SL3 - Gray
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
          domain: 'MFG',
          securityLevel: 'MFZ_SL4',
          compliant: 45,
          total: 48,
          issues: ['3 cihazda güncel olmayan firmware'],
        },
        {
          domain: 'LOG',
          securityLevel: 'LOG_SL4',
          compliant: 28,
          total: 28,
          issues: [],
        },
        {
          domain: 'FCM',
          securityLevel: 'FMZ_SL4',
          compliant: 12,
          total: 15,
          issues: ['Eksik güvenlik sertifikaları', 'Yetkisiz cihaz tespit edildi'],
        },
        {
          domain: 'ENG',
          securityLevel: 'ENG_SL4',
          compliant: 18,
          total: 20,
          issues: ['Test cihazları üretim ağında'],
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
          <h2 className="text-2xl font-bold text-gray-900">Analitik & Raporlar</h2>
          <p className="text-gray-600">Ağ performans metrikleri ve uyumluluk analitiği</p>
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
            <h3 className="text-lg font-medium text-gray-900">Domain Bazında IP Kullanımı</h3>
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
            <h3 className="text-lg font-medium text-gray-900">Cihaz Büyüme Trendi</h3>
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
          <h3 className="text-lg font-medium text-gray-900">Domain Bazında Güvenlik Uyumluluğu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Güvenlik Seviyesi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uyumluluk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sorunlar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complianceData.map((item) => {
                const complianceRate = (item.compliant / item.total) * 100;
                return (
                  <tr key={item.domain} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center mr-3',
                          getDomainColor(item.domain)
                        )}>
                          {(() => {
                            const DomainIcon = getDomainIcon(item.domain);
                            return <DomainIcon className="h-4 w-4" />;
                          })()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getDomainName(item.domain)}</div>
                          <div className="text-xs text-gray-500">{item.domain}</div>
                        </div>
                      </div>
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
                          <span className="text-green-600">Sorun yok</span>
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
                            Uyumlu
                          </>
                        ) : complianceRate >= 80 ? (
                          <>
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Uyarı
                          </>
                        ) : (
                          <>
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Uyumsuz
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
              <p className="text-blue-100">OT Cihaz Kapsamı</p>
              <p className="text-3xl font-bold">89%</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-blue-200" />
          </div>
          <p className="text-blue-100 text-sm mt-2">Kayıtlı cihazların aktif olanları</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">IP Kullanım Verimliliği</p>
              <p className="text-3xl font-bold">72%</p>
            </div>
            <GlobeAltIcon className="h-12 w-12 text-green-200" />
          </div>
          <p className="text-green-100 text-sm mt-2">Tahsis edilen IP'lerin kullanım oranı</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Network Segmentasyonu</p>
              <p className="text-3xl font-bold">13</p>
            </div>
            <ServerIcon className="h-12 w-12 text-purple-200" />
          </div>
          <p className="text-purple-100 text-sm mt-2">Aktif VLAN segmentleri</p>
        </div>
      </div>
    </div>
  );
};

export { EnhancedAnalytics };