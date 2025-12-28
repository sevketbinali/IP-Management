/**
 * API Client for IP Management System
 * Robust HTTP client with error handling, retries, and caching
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { APIResponse, APIError, AppConfig } from '@/types';

// Configuration
const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  plantCode: import.meta.env.VITE_PLANT_CODE || 'BURSA',
  organization: import.meta.env.VITE_ORGANIZATION || 'Bosch Rexroth',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  cacheDuration: parseInt(import.meta.env.VITE_CACHE_DURATION || '300000'),
  paginationSize: parseInt(import.meta.env.VITE_PAGINATION_SIZE || '50'),
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

// Response cache for GET requests
const responseCache = new Map<string, { data: unknown; timestamp: number }>();

class APIClient {
  private client: AxiosInstance;
  private retryCount = 3;
  private retryDelay = 1000;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Plant-Code': config.plantCode,
        'X-Organization': config.organization,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (config.method === 'get') {
          const cacheKey = this.getCacheKey(config);
          const cached = responseCache.get(cacheKey);
          
          if (cached && Date.now() - cached.timestamp < config.cacheDuration) {
            // Return cached response (this is a simplified approach)
            (config as any).metadata = { cached: true, data: cached.data };
          }
        }

        if ((config as any)?.enableDebug) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Cache GET responses
        if (response.config.method === 'get') {
          const cacheKey = this.getCacheKey(response.config);
          responseCache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
          });
        }

        if (config?.enableDebug) {
          console.log(`[API] Response:`, response.data);
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Retry logic for network errors
        if (
          error.code === 'NETWORK_ERROR' ||
          error.code === 'TIMEOUT' ||
          (error.response?.status >= 500 && error.response?.status < 600)
        ) {
          if (!originalRequest._retry && originalRequest._retryCount < this.retryCount) {
            originalRequest._retry = true;
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

            await this.delay(this.retryDelay * originalRequest._retryCount);
            return this.client(originalRequest);
          }
        }

        // Handle authentication errors
        if (error.response?.status === 401) {
          // Clear auth token and redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  private getCacheKey(config: AxiosRequestConfig): string {
    return `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private transformError(error: unknown): APIError {
    if (axios.isAxiosError(error)) {
      return {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.response?.data?.message || error.message || 'An unexpected error occurred',
        details: error.response?.data?.details,
        timestamp: new Date().toISOString(),
        requestId: error.response?.headers['x-request-id'],
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: Record<string, unknown>): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.post(url, data);
    this.invalidateCache();
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.put(url, data);
    this.invalidateCache();
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.patch(url, data);
    this.invalidateCache();
    return response.data;
  }

  async delete<T>(url: string): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.delete(url);
    this.invalidateCache();
    return response.data;
  }

  // Cache management
  invalidateCache(pattern?: string): void {
    if (pattern) {
      for (const key of responseCache.keys()) {
        if (key.includes(pattern)) {
          responseCache.delete(key);
        }
      }
    } else {
      responseCache.clear();
    }
  }

  // Health check
  async checkHealth(): Promise<{ status: string; service: string; version: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token
  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export { config as apiConfig };