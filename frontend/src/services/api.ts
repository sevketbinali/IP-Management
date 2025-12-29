/**
 * Simple API Client for IP Management System
 * Minimal, working HTTP client without complex features
 */

// Simple fetch-based API client
class APIClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseURL = '/api/v1';
    this.headers = {
      'Content-Type': 'application/json',
      'X-Plant-Code': 'BURSA',
      'X-Organization': 'Bosch Rexroth',
    };
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // HTTP methods
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const searchParams = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<T>(`${url}${searchParams}`);
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, {
      method: 'DELETE',
    });
  }

  // Health check - uses absolute path
  async checkHealth(): Promise<{ status: string; service: string; version: string }> {
    const response = await fetch('/health');
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json();
  }

  // Authentication methods
  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.headers['Authorization'];
  }
}

// Export singleton instance
export const apiClient = new APIClient();