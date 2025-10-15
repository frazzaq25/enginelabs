# API Client Guidelines

This project ships with a lightweight API client (`src/lib/api/client.ts`) that standardises how the frontend communicates with backend services. Use the client for all network calls to benefit from consistent error handling, authentication, and HTTPS checks.

## Base URL and HTTPS

- The client derives its `baseUrl` from `import.meta.env.VITE_API_URL`. Set this value in your environment files (e.g. `.env`) when running locally.
- If `VITE_API_URL` is not provided, the client automatically falls back to `${window.location.origin}/api`.
- Non-HTTPS URLs trigger a warning at runtime. Always configure production deployments with an HTTPS API endpoint to protect user data.

## Authentication

- Call `apiClient.setAuthToken(token)` after a user authenticates. The client will transparently attach the `Authorization: Bearer <token>` header to every request.
- For dynamic tokens (e.g. rotating refresh tokens), pass a `getAuthToken` callback when constructing the client or via the `configure` method.

## Error Normalisation

- All non-2xx responses are converted into a typed `ApiError` instance.
- JSON error payloads are preserved and exposed through the `error.data` property, making it easy to surface validation details in the UI.
- Network issues raise an `ApiError` with the `code` `network_error`. Handle it in React Query error boundaries or component-level error states.

## Example Usage

```ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<Project[]>('/projects')
  });
}
```

Refer to `src/lib/api/client.ts` for more helpers, including `post`, `put`, `patch`, and `delete`.
