export interface HealthResponse {
  status: 'ok';
  configuration: string;
}

export interface PluginSummary {
  id: string;
  name: string;
  description: string;
}

export interface PluginRoute {
  path: string;
  titleKey: string;
}

export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`API request failed with status ${status}`);
  }
}

export class ApiClient {
  private accessToken?: string;

  constructor(
    private readonly baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  ) {}

  setAccessToken(token?: string): void {
    this.accessToken = token;
  }

  async health(locale: string): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health', { method: 'GET' }, locale);
  }

  async plugins(locale: string): Promise<PluginSummary[]> {
    return this.request<PluginSummary[]>('/plugins', { method: 'GET' }, locale);
  }

  async pluginRoutes(locale: string): Promise<PluginRoute[]> {
    return this.request<PluginRoute[]>('/plugins/routes', { method: 'GET' }, locale);
  }

  private async request<T>(
    path: string,
    init: RequestInit,
    locale: string,
  ): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('Accept-Language', locale);
    if (this.accessToken) headers.set('Authorization', `Bearer ${this.accessToken}`);

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });
    if (!response.ok) throw new ApiError(response.status);

    return (await response.json()) as T;
  }
}

export const api = new ApiClient();
