import { rest } from 'msw';
import type { Patient, PatientUpsertInput } from '../../src/types/patient';

const API_BASE_URL = 'http://localhost:4000/api';

const initialPatients: Patient[] = [
  {
    id: 'patient-1',
    firstName: 'Alice',
    lastName: 'Anderson',
    dob: '1985-06-15',
    gender: 'female',
    mrn: 'AA-1001',
    email: 'alice.anderson@examplehealth.org',
    phone: '+1 555-111-2222',
    primaryProvider: 'Dr. Hudson',
    address: {
      line1: '100 Maple Ave',
      line2: '',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701'
    },
    notes: [
      { id: 'note-1', title: 'Annual wellness visit', createdAt: '2024-02-18T14:30:00.000Z' }
    ],
    templates: [
      { id: 'tpl-1', name: 'Hypertension Follow-up', lastUsedAt: '2024-03-01T16:00:00.000Z' }
    ],
    createdAt: '2023-01-05T12:00:00.000Z',
    updatedAt: '2024-04-02T10:00:00.000Z'
  },
  {
    id: 'patient-2',
    firstName: 'Brian',
    lastName: 'Brooks',
    dob: '1972-09-03',
    gender: 'male',
    mrn: 'BB-2044',
    email: 'brian.brooks@examplehealth.org',
    phone: '+1 555-333-4488',
    primaryProvider: 'Dr. Lee',
    address: {
      line1: '88 Riverside Dr',
      line2: 'Apt 4B',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601'
    },
    notes: [
      { id: 'note-2', title: 'Cardiology consult', createdAt: '2023-11-07T09:45:00.000Z' },
      { id: 'note-3', title: 'Medication reconciliation', createdAt: '2024-05-21T11:15:00.000Z' }
    ],
    templates: [
      { id: 'tpl-2', name: 'CHF Education', lastUsedAt: '2024-04-12T13:30:00.000Z' }
    ],
    createdAt: '2022-08-12T12:00:00.000Z',
    updatedAt: '2024-05-20T13:00:00.000Z'
  },
  {
    id: 'patient-3',
    firstName: 'Cecilia',
    lastName: 'Chen',
    dob: '1994-01-22',
    gender: 'female',
    mrn: 'CC-3307',
    email: 'cecilia.chen@examplehealth.org',
    phone: '+1 555-777-9900',
    primaryProvider: 'Dr. Morales',
    address: {
      line1: '742 Evergreen Terrace',
      line2: '',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101'
    },
    notes: [],
    templates: [],
    createdAt: '2023-07-29T08:00:00.000Z',
    updatedAt: '2024-03-11T09:20:00.000Z'
  }
];

const clonePatients = (data: Patient[]): Patient[] =>
  data.map((patient) => ({
    ...patient,
    address: patient.address ? { ...patient.address } : undefined,
    notes: patient.notes.map((note) => ({ ...note })),
    templates: patient.templates.map((template) => ({ ...template }))
  }));

let patients: Patient[] = clonePatients(initialPatients);

export const resetMockPatients = () => {
  patients = clonePatients(initialPatients);
};

const matchesFilters = (patient: Patient, search: string, gender: string) => {
  if (gender && gender !== 'all' && patient.gender !== gender) {
    return false;
  }

  if (search) {
    const haystack = `${patient.firstName} ${patient.lastName} ${patient.mrn} ${patient.email ?? ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  }

  return true;
};

const toPatient = (input: PatientUpsertInput, overrides: Partial<Patient> = {}): Patient => {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? `mock-${Date.now()}`,
    firstName: input.firstName,
    lastName: input.lastName,
    dob: input.dob,
    gender: input.gender,
    mrn: input.mrn,
    email: input.email,
    phone: input.phone,
    primaryProvider: input.primaryProvider,
    address: input.address ? { ...input.address } : undefined,
    notes: (overrides.notes ?? []).map((note) => ({ ...note })),
    templates: (overrides.templates ?? []).map((template) => ({ ...template })),
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now
  };
};

export const handlers = [
  rest.get(`${API_BASE_URL}/patients`, (req, res, ctx) => {
    const search = req.url.searchParams.get('search') ?? '';
    const gender = req.url.searchParams.get('gender') ?? 'all';

    const filtered = patients.filter((patient) => matchesFilters(patient, search, gender));

    return res(ctx.status(200), ctx.delay(50), ctx.json(filtered));
  }),
  rest.get(`${API_BASE_URL}/patients/:patientId`, (req, res, ctx) => {
    const patient = patients.find((item) => item.id === req.params.patientId);

    if (!patient) {
      return res(ctx.status(404), ctx.json({ message: 'Patient not found' }));
    }

    return res(ctx.status(200), ctx.delay(30), ctx.json(patient));
  }),
  rest.post(`${API_BASE_URL}/patients`, async (req, res, ctx) => {
    const body = (await req.json()) as PatientUpsertInput;
    const newPatient = toPatient(body, {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `mock-${Math.random().toString(36).slice(2)}`
    });

    patients = [newPatient, ...patients];

    return res(ctx.status(201), ctx.delay(40), ctx.json(newPatient));
  }),
  rest.put(`${API_BASE_URL}/patients/:patientId`, async (req, res, ctx) => {
    const body = (await req.json()) as PatientUpsertInput;
    const index = patients.findIndex((item) => item.id === req.params.patientId);

    if (index === -1) {
      return res(ctx.status(404), ctx.json({ message: 'Patient not found' }));
    }

    const existing = patients[index];
    const updated = toPatient(body, {
      ...existing,
      updatedAt: new Date().toISOString()
    });

    patients[index] = updated;

    return res(ctx.status(200), ctx.delay(40), ctx.json(updated));
  })
];
