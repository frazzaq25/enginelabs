export type PatientGender = 'female' | 'male' | 'other' | 'unknown';

export interface PatientAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface PatientNote {
  id: string;
  title: string;
  createdAt: string;
}

export interface PatientTemplate {
  id: string;
  name: string;
  lastUsedAt: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: PatientGender;
  mrn: string;
  email?: string;
  phone?: string;
  primaryProvider?: string;
  address?: PatientAddress;
  notes: PatientNote[];
  templates: PatientTemplate[];
  createdAt: string;
  updatedAt: string;
}

export interface PatientUpsertInput {
  firstName: string;
  lastName: string;
  dob: string;
  gender: PatientGender;
  mrn: string;
  email?: string;
  phone?: string;
  primaryProvider?: string;
  address?: PatientAddress;
}
