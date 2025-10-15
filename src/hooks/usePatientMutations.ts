import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult
} from '@tanstack/react-query';
import {
  createPatient,
  updatePatient,
  type ListPatientsParams
} from '../api/patients';
import type { Patient, PatientUpsertInput } from '../types/patient';

const matchesFilters = (patient: Patient, params?: ListPatientsParams): boolean => {
  if (!params) {
    return true;
  }
  const { search, gender } = params;
  if (gender && gender !== 'all' && patient.gender !== gender) {
    return false;
  }
  if (search) {
    const haystack = `${patient.firstName} ${patient.lastName} ${patient.mrn} ${patient.email ?? ''}`.toLowerCase();
    if (!haystack.includes(search.toLowerCase())) {
      return false;
    }
  }
  return true;
};

type QuerySnapshot<TData> = [QueryKey, TData | undefined];

type CreateContext = {
  tempId: string;
  listSnapshots: QuerySnapshot<Patient[]>[];
};

type UpdateContext = {
  id: string;
  listSnapshots: QuerySnapshot<Patient[]>[];
  previousPatient?: Patient;
};

const createTemporaryPatient = (payload: PatientUpsertInput, tempId: string): Patient => {
  const now = new Date().toISOString();
  return {
    id: tempId,
    firstName: payload.firstName,
    lastName: payload.lastName,
    dob: payload.dob,
    gender: payload.gender,
    mrn: payload.mrn,
    email: payload.email,
    phone: payload.phone,
    primaryProvider: payload.primaryProvider,
    address: payload.address ? { ...payload.address } : undefined,
    notes: [],
    templates: [],
    createdAt: now,
    updatedAt: now
  };
};

export const usePatientMutations = (): {
  createMutation: UseMutationResult<Patient, Error, PatientUpsertInput, CreateContext>;
  updateMutation: UseMutationResult<
    Patient,
    Error,
    { id: string; data: PatientUpsertInput },
    UpdateContext
  >;
} => {
  const queryClient = useQueryClient();

  const createMutation = useMutation<Patient, Error, PatientUpsertInput, CreateContext>({
    mutationFn: (payload) => createPatient(payload),
    onMutate: async (payload) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticPatient = createTemporaryPatient(payload, tempId);

      await queryClient.cancelQueries({ queryKey: ['patients'] });

      const listSnapshots = queryClient.getQueriesData<Patient[]>({ queryKey: ['patients'] });

      listSnapshots.forEach(([key, patients]) => {
        if (!patients) {
          return;
        }
        const params = Array.isArray(key) && key.length > 1 ? (key[1] as ListPatientsParams) : undefined;
        if (!matchesFilters(optimisticPatient, params)) {
          return;
        }
        queryClient.setQueryData<Patient[]>(key, [optimisticPatient, ...patients]);
      });

      return { tempId, listSnapshots };
    },
    onError: (_error, _variables, context) => {
      context?.listSnapshots.forEach(([key, snapshot]) => {
        queryClient.setQueryData(key, snapshot);
      });
    },
    onSuccess: (patient, _variables, context) => {
      if (!context) {
        return;
      }
      const { tempId } = context;
      const listQueries = queryClient.getQueriesData<Patient[]>({ queryKey: ['patients'] });
      listQueries.forEach(([key, patients]) => {
        if (!patients) {
          return;
        }
        queryClient.setQueryData<Patient[]>(
          key,
          patients.map((item) => (item.id === tempId ? patient : item))
        );
      });
      queryClient.setQueryData(['patient', patient.id], patient);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });

  const updateMutation = useMutation<
    Patient,
    Error,
    { id: string; data: PatientUpsertInput },
    UpdateContext
  >({
    mutationFn: ({ id, data }) => updatePatient(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['patients'] });
      await queryClient.cancelQueries({ queryKey: ['patient', id] });

      const listSnapshots = queryClient.getQueriesData<Patient[]>({ queryKey: ['patients'] });
      const previousPatient = queryClient.getQueryData<Patient>(['patient', id]);

      const optimisticPatient: Patient = {
        id,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        gender: data.gender,
        mrn: data.mrn,
        email: data.email,
        phone: data.phone,
        primaryProvider: data.primaryProvider,
        address: data.address ? { ...data.address } : undefined,
        notes: previousPatient?.notes?.map((note) => ({ ...note })) ?? [],
        templates: previousPatient?.templates?.map((template) => ({ ...template })) ?? [],
        createdAt: previousPatient?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      queryClient.setQueryData(['patient', id], optimisticPatient);
      listSnapshots.forEach(([key, patients]) => {
        if (!patients) {
          return;
        }
        queryClient.setQueryData<Patient[]>(
          key,
          patients.map((item) => (item.id === id ? { ...item, ...optimisticPatient } : item))
        );
      });

      return { id, listSnapshots, previousPatient } satisfies UpdateContext;
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }
      const { id, previousPatient, listSnapshots } = context;
      if (previousPatient) {
        queryClient.setQueryData(['patient', id], previousPatient);
      }
      listSnapshots.forEach(([key, snapshot]) => {
        queryClient.setQueryData(key, snapshot);
      });
    },
    onSuccess: (patient, variables) => {
      queryClient.setQueryData(['patient', variables.id], patient);
      const listQueries = queryClient.getQueriesData<Patient[]>({ queryKey: ['patients'] });
      listQueries.forEach(([key, patients]) => {
        if (!patients) {
          return;
        }
        queryClient.setQueryData<Patient[]>(
          key,
          patients.map((item) => (item.id === variables.id ? patient : item))
        );
      });
    },
    onSettled: (_data, _error, context) => {
      if (context) {
        queryClient.invalidateQueries({ queryKey: ['patient', context.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });

  return {
    createMutation,
    updateMutation
  };
};
