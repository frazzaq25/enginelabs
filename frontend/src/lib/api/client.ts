import { ApiError, normalizeError } from './errors';

export interface ApiClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  getAuthToken?: () => string | null | undefined;
}

export class ApiClient {
  private baseUrl: string;

  private defaultHeaders: Record<string, string>;

  private getAuthToken?: () => string | null | undefined;

  private authToken?: string | null;

  constructor({ baseUrl, defaultHeaders, getAuthToken }: ApiClientOptions = {}) {
    this.baseUrl = this.resolveBaseUrl(baseUrl);
    this.defaultHeaders = defaultHeaders ?? { 'Content-Type': 'application/json' };
    this.getAuthToken = getAuthToken;
    this.guardHttps(this.baseUrl);
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  configure(options: Partial<ApiClientOptions>) {
    if (options.baseUrl) {
      this.baseUrl = this.resolveBaseUrl(options.baseUrl);
      this.guardHttps(this.baseUrl);
    }
    if (options.defaultHeaders) {
      this.defaultHeaders = options.defaultHeaders;
    }
    if (options.getAuthToken) {
      this.getAuthToken = options.getAuthToken;
    }
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = this.createUrl(path);
    const headers = this.buildHeaders(init.headers);

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Network request failed. Check your connection.';
      throw new ApiError(0, message, {
        message,
        code: 'network_error'
      });
    }

    if (!response.ok) {
      throw await normalizeError(response);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    return (await response.text()) as T;
  }

  get<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, this.withBody('POST', body, init));
  }

  put<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, this.withBody('PUT', body, init));
  }

  patch<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, this.withBody('PATCH', body, init));
  }

  delete<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: 'DELETE' });
  }

  private resolveBaseUrl(provided?: string) {
    if (provided) {
      return provided.replace(/\/$/, '');
    }

    const envBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
    if (envBaseUrl) {
      return envBaseUrl.replace(/\/$/, '');
    }

    if (typeof window !== 'undefined') {
      return `${window.location.origin.replace(/\/$/, '')}/api`;
    }

    return '';
  }

  private guardHttps(url: string) {
    if (!url) {
      return;
    }

    if (url.startsWith('http://')) {
      console.warn(
        'The API client is configured to use a non-HTTPS endpoint. It is strongly recommended to serve the API over HTTPS in production environments.'
      );
    }
  }

  private createUrl(path: string) {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalized}`;
  }

  private buildHeaders(overrides?: HeadersInit): HeadersInit {
    const headers = new Headers({ ...this.defaultHeaders });
    const candidateToken = this.authToken ?? this.getAuthToken?.();

    if (candidateToken) {
      headers.set('Authorization', `Bearer ${candidateToken}`);
    }

    if (overrides) {
      const extra = new Headers(overrides);
      extra.forEach((value, key) => headers.set(key, value));
    }

    return headers;
  }

  private withBody(method: string, body?: unknown, init?: RequestInit): RequestInit {
    const headers = this.buildHeaders(init?.headers);

    let serializedBody: BodyInit | undefined;
    if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) {
      serializedBody = body;
      headers.delete('Content-Type');
    } else if (body !== undefined) {
      serializedBody = JSON.stringify(body);
      headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');
    }

    return {
      ...init,
      method,
      headers,
      body: serializedBody
    };
  }
}

export const apiClient = new ApiClient();
export type { ApiError } from './errors';
