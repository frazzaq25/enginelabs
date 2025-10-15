import { useMemo } from 'react';
import { apiClient } from '../lib/api/client';

export function useApiClient() {
  return useMemo(() => apiClient, []);
}
