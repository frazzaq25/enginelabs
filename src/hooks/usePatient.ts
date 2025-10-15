import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getPatient } from '../api/patients';
import type { Patient } from '../types/patient';

export const usePatient = (
  patientId: string | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<Patient, Error> => {
  return useQuery<Patient, Error>({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId as string),
    enabled: Boolean(patientId) && (options?.enabled ?? true),
    staleTime: 120_000
  });
};
