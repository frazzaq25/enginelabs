export interface ApiErrorData {
  message: string;
  code?: string;
  details?: Record<string, unknown> | string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly data?: ApiErrorData;

  constructor(status: number, message: string, data?: ApiErrorData) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function normalizeError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get('content-type') ?? '';
  let payload: ApiErrorData | undefined;

  if (contentType.includes('application/json')) {
    try {
      payload = await response.json();
    } catch (error) {
      console.warn('Failed to parse error payload', error);
    }
  } else {
    try {
      const text = await response.text();
      if (text) {
        payload = { message: text };
      }
    } catch (error) {
      console.warn('Failed to read error payload', error);
    }
  }

  const message = payload?.message || `${response.status} ${response.statusText}`;
  return new ApiError(response.status, message, payload);
}
