const DEFAULT_API_BASE = 'http://localhost:4000/api';

const resolveBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as Record<string, string | undefined>).__PATIENT_APP_API_BASE_URL__) {
    return (window as Record<string, string>).__PATIENT_APP_API_BASE_URL__;
  }

  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL;
  }

  return DEFAULT_API_BASE;
};

const API_BASE_URL = resolveBaseUrl().replace(/\/$/, '');

interface RequestOptions extends RequestInit {
  parseJson?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { parseJson = true, headers, body, ...rest } = options;
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    body
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const errorBody = await response.json();
      if (errorBody?.message) {
        message = errorBody.message;
      }
    } catch (error) {
      // ignore JSON parsing errors
    }
    throw new Error(message || 'Request failed');
  }

  if (!parseJson || response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
