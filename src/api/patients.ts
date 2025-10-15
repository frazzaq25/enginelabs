import { request } from './client';
import type { Patient, PatientGender, PatientUpsertInput } from '../types/patient';

export interface ListPatientsParams {
  search?: string;
  gender?: PatientGender | 'all';
}

const joinQuery = (params: ListPatientsParams = {}) => {
  const searchParams = new URLSearchParams();
  if (params.search) {
    searchParams.set('search', params.search);
  }
  if (params.gender && params.gender !== 'all') {
    searchParams.set('gender', params.gender);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export async function listPatients(params: ListPatientsParams = {}): Promise<Patient[]> {
  return request<Patient[]>(`/patients${joinQuery(params)}`);
}

export async function getPatient(patientId: string): Promise<Patient> {
  return request<Patient>(`/patients/${patientId}`);
}

export async function createPatient(payload: PatientUpsertInput): Promise<Patient> {
  return request<Patient>('/patients', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export interface UpdatePatientVariables {
  id: string;
  data: PatientUpsertInput;
}

export async function updatePatient(patientId: string, payload: PatientUpsertInput): Promise<Patient> {
  return request<Patient>(`/patients/${patientId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}
