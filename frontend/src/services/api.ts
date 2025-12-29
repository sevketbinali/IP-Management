/**
 * API Client for IP Management System
 * Simple, reliable HTTP client with proper error handling
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { APIResponse, APIError } from '@/types';

// Simple configuration using only available environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const PLANT_CODE = import.meta.env.VITE_PLANT_CODE || 'BURSA';
const ORGANIZATION = import.meta.env.VITE_ORGANIZATION || 'Bosch Rexroth';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Plant-Code': PLANT_CODE,
        'X-Organization': ORGANIZATION,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for debugging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response: ${response.status}`);
        return response;
      },
      (error: AxiosError) => {
        console.error('[API] Error:', error.message);
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private transformError(error: AxiosError): APIError {
    const apiError: APIError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };

    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as any;
      apiError.message = responseData?.message || error.message || 'Server error';
      apiError.details = responseData?.details;
      apiError.requestId = error.response.headers['x-request-id'] as string;
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = 'Network error - please check your connection';
      apiError.code = 'NETWORK_ERROR';
    }

    return apiError;
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: Record<string, any>): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.delete(url);
    return response.data;
  }

  // Health check - uses absolute path since health endpoint is at root
  async checkHealth(): Promise<{ status: string; service: string; version: string }> {
    const response = await axios.get('/health');
    return response.data;
  }

  // Authentication methods
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Export singleton instance
export const apiClient = new APIClient();