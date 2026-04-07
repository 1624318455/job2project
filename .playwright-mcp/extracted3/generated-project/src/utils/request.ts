interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

class HttpClient {
  private baseURL = '';
  private timeout = 10000;

  setBaseURL(url: string) {
    this.baseURL = url;
  }

  private buildURL(url: string, params?: Record<string, string | number | boolean>): string {
    const u = new URL(url, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([k, v]) => u.searchParams.append(k, String(v)));
    }
    return u.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    const fullURL = this.buildURL(url, options?.params);
    const response = await fetch(fullURL, { ...options, method: 'GET' });
    return this.handleResponse<T>(response);
  }

  async post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const response = await fetch(this.buildURL(url, options?.params), {
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const response = await fetch(this.buildURL(url, options?.params), {
      ...options,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    const response = await fetch(this.buildURL(url, options?.params), { ...options, method: 'DELETE' });
    return this.handleResponse<T>(response);
  }
}

export const http = new HttpClient();