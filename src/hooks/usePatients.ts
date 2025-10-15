import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { listPatients, type ListPatientsParams } from '../api/patients';
import type { Patient } from '../types/patient';

export const PATIENTS_QUERY_KEY = 'patients';

export const usePatients = (params: ListPatientsParams): UseQueryResult<Patient[], Error> => {
  return useQuery<Patient[], Error>({
    queryKey: [PATIENTS_QUERY_KEY, params],
    queryFn: () => listPatients(params),
    keepPreviousData: true,
    staleTime: 60_000
  });
};
